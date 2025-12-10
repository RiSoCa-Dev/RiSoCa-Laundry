'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { PromoBanner } from '@/components/promo-banner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogIn, Clock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { signInWithEmail } from '@/lib/auth'

const MAX_ATTEMPTS = 3
const LOCKOUT_DURATION = 60 * 1000 // 1 minute in milliseconds
const STORAGE_KEY = 'rkr_login_attempts'

interface LoginAttempts {
  count: number
  lockoutUntil: number | null
}

function getLoginAttempts(): LoginAttempts {
  if (typeof window === 'undefined') {
    return { count: 0, lockoutUntil: null }
  }
  
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return { count: 0, lockoutUntil: null }
  }
  
  try {
    const parsed = JSON.parse(stored)
    const now = Date.now()
    
    // If lockout has expired, reset attempts
    if (parsed.lockoutUntil && now >= parsed.lockoutUntil) {
      localStorage.removeItem(STORAGE_KEY)
      return { count: 0, lockoutUntil: null }
    }
    
    return parsed
  } catch {
    return { count: 0, lockoutUntil: null }
  }
}

function saveLoginAttempts(attempts: LoginAttempts) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts))
}

function incrementFailedAttempt(): LoginAttempts {
  const attempts = getLoginAttempts()
  const newCount = attempts.count + 1
  
  let lockoutUntil: number | null = null
  
  if (newCount >= MAX_ATTEMPTS) {
    // If already locked out, extend the lockout
    if (attempts.lockoutUntil && Date.now() < attempts.lockoutUntil) {
      lockoutUntil = attempts.lockoutUntil + LOCKOUT_DURATION
    } else {
      // New lockout
      lockoutUntil = Date.now() + LOCKOUT_DURATION
    }
  }
  
  const newAttempts: LoginAttempts = {
    count: newCount,
    lockoutUntil
  }
  
  saveLoginAttempts(newAttempts)
  return newAttempts
}

function resetLoginAttempts() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [lockoutTime, setLockoutTime] = useState<number | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  useEffect(() => {
    const attempts = getLoginAttempts()
    if (attempts.lockoutUntil) {
      setLockoutTime(attempts.lockoutUntil)
    }
  }, [])

  useEffect(() => {
    if (!lockoutTime) return

    const updateTimer = () => {
      const now = Date.now()
      const remaining = Math.ceil((lockoutTime - now) / 1000)
      
      if (remaining <= 0) {
        setLockoutTime(null)
        setRemainingSeconds(0)
        resetLoginAttempts()
        return
      }
      
      setRemainingSeconds(remaining)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [lockoutTime])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    // Check if locked out
    const attempts = getLoginAttempts()
    if (attempts.lockoutUntil && Date.now() < attempts.lockoutUntil) {
      const remaining = Math.ceil((attempts.lockoutUntil - Date.now()) / 1000)
      toast({
        variant: "destructive",
        title: 'Too Many Failed Attempts',
        description: `Please wait ${remaining} second${remaining !== 1 ? 's' : ''} before trying again.`,
      })
      setLockoutTime(attempts.lockoutUntil)
      return
    }

    setLoading(true)

    const { error } = await signInWithEmail(email, password)
    if (error) {
      const newAttempts = incrementFailedAttempt()
      
      if (newAttempts.lockoutUntil) {
        const remaining = Math.ceil((newAttempts.lockoutUntil - Date.now()) / 1000)
        setLockoutTime(newAttempts.lockoutUntil)
        toast({
          variant: "destructive",
          title: 'Too Many Failed Attempts',
          description: `You have exceeded ${MAX_ATTEMPTS} login attempts. Please wait ${remaining} second${remaining !== 1 ? 's' : ''} before trying again.`,
        })
      } else {
        const remainingAttempts = MAX_ATTEMPTS - newAttempts.count
        toast({
          variant: "destructive",
          title: 'Login Failed',
          description: `Invalid credentials. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
        })
      }
      setLoading(false)
      return
    }

    // Successful login - reset attempts
    resetLoginAttempts()
    setLockoutTime(null)
    
    toast({
      title: 'Login Successful',
      description: 'Welcome back!',
    })
    
    // Wait a moment for session to be established before redirecting
    setTimeout(() => {
      router.push('/');
      router.refresh(); // Force a refresh to ensure session is loaded
    }, 100);
    
    setLoading(false)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <PromoBanner />
      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollable pb-20">
        <div className="container mx-auto px-4 py-8 flex items-start justify-center min-h-full">
        <Card className="mx-auto w-full max-w-sm">
          <CardHeader className="p-4">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            <form onSubmit={handleSubmit} className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                disabled={loading || (lockoutTime !== null && Date.now() < lockoutTime)}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
              >
                {lockoutTime && Date.now() < lockoutTime ? (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Wait {remainingSeconds}s
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    {loading ? 'Logging in...' : 'Login'}
                  </>
                )}
              </Button>
              
              {lockoutTime && Date.now() < lockoutTime && (
                <p className="text-xs text-center text-destructive mt-2">
                  Too many failed attempts. Please wait {remainingSeconds} second{remainingSeconds !== 1 ? 's' : ''} before trying again.
                </p>
              )}
            </form>
             <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
