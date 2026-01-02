import { supabase } from './supabase-client';
import { clearRoleCache } from './auth-helpers';
import { clearOrderCache } from './order-cache';
import { emailQueue } from './email-queue';

export async function signUpWithEmail(email: string, password: string, data?: Record<string, any>) {
  // Check email limits before attempting sign up
  const canSend = emailQueue.canSendEmail();
  if (!canSend.canSend) {
    return {
      data: null,
      error: {
        message: canSend.reason || 'Email limit reached. Please try again later.',
        status: 429
      }
    };
  }

  const redirectTo = typeof window !== 'undefined' 
    ? `${window.location.origin}`
    : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rkrlaundry.com'}`;
  
  // Queue the sign up to respect rate limits (2 req/s)
  const result = await emailQueue.queueEmail(
    'email_confirmation',
    email,
    async () => {
      return supabase.auth.signUp({ 
        email, 
        password, 
        options: { 
          data,
          emailRedirectTo: redirectTo,
        } 
      });
    }
  );

  if (!result.queued) {
    return {
      data: null,
      error: {
        message: result.error || 'Unable to send confirmation email. Please try again later.',
        status: 429
      }
    };
  }

  // Wait for email to be processed (with timeout)
  let attempts = 0;
  const maxWait = 20; // Max 2 seconds wait
  while (attempts < maxWait && emailQueue.getQueueStatus().length > 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }

  // Return success - email is queued and will be sent
  return {
    data: { user: null, session: null },
    error: null
  };
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  // Clear caches on logout
  if (typeof window !== 'undefined') {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (userId) {
      clearRoleCache(userId);
      clearOrderCache(userId);
    }
    // Also clear all caches (in case of multiple users)
    clearRoleCache();
    clearOrderCache();
  }
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}

export function onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
  return supabase.auth.onAuthStateChange(callback);
}

/**
 * Reset password with rate limiting and queue management
 */
export async function resetPasswordForEmail(email: string) {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      data: null,
      error: {
        message: 'Please enter a valid email address',
        status: 400
      }
    };
  }

  // Check email limits before attempting reset
  const canSend = emailQueue.canSendEmail();
  if (!canSend.canSend) {
    return {
      data: null,
      error: {
        message: canSend.reason || 'Email limit reached. Please try again later.',
        status: 429
      }
    };
  }

  const redirectTo = typeof window !== 'undefined' 
    ? `${window.location.origin}/reset-password`
    : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rkrlaundry.com'}/reset-password`;

  // Queue the password reset email to respect rate limits
  const result = await emailQueue.queueEmail(
    'password_reset',
    email,
    async () => {
      return supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
    }
  );

  if (!result.queued) {
    return {
      data: null,
      error: {
        message: result.error || 'Unable to send password reset email. Please try again later.',
        status: 429
      }
    };
  }

  // Wait for email to be processed (with timeout)
  let attempts = 0;
  const maxWait = 20; // Max 2 seconds wait
  while (attempts < maxWait && emailQueue.getQueueStatus().length > 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }

  // Return success - email is queued and will be sent
  return {
    data: null,
    error: null
  };
}

/**
 * Get email usage statistics
 */
export function getEmailUsageStats() {
  return emailQueue.getUsageStats();
}

