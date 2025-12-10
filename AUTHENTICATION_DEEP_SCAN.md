# RKR Laundry - Deep Authentication Backend Analysis

## 🔐 Executive Summary

This document provides a comprehensive analysis of the authentication system in the RKR Laundry application, covering Supabase authentication setup, database security, Row Level Security (RLS) policies, API security, and potential vulnerabilities.

---

## 📋 Authentication Architecture Overview

### **Technology Stack**
- **Backend**: Supabase (PostgreSQL + Auth)
- **Authentication Method**: Email/Password
- **Session Management**: Supabase Auth with JWT tokens
- **Database Security**: Row Level Security (RLS) policies
- **API Security**: Bearer token authentication

---

## 🏗️ Authentication Components

### 1. **Supabase Client Configuration**

#### **Client-Side Client** (`src/lib/supabase-client.ts`)
```typescript
- URL: process.env.NEXT_PUBLIC_SUPABASE_URL
- Key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY (public, safe for client)
- Features:
  ✅ persistSession: true (sessions stored in localStorage)
  ✅ autoRefreshToken: true (automatic token refresh)
  ✅ detectSessionInUrl: true (handles OAuth callbacks)
```

**Security Notes:**
- ✅ Uses anon key (read-only, RLS-protected)
- ✅ Session persistence enabled
- ✅ Automatic token refresh prevents expired sessions
- ⚠️ Anon key is public but protected by RLS policies

#### **Server-Side Admin Client** (`src/lib/supabase-admin.ts`)
```typescript
- URL: process.env.NEXT_PUBLIC_SUPABASE_URL
- Key: process.env.SUPABASE_SERVICE_ROLE_KEY (SECRET, server-only)
- Features:
  ✅ autoRefreshToken: false (not needed for server)
  ✅ persistSession: false (stateless server operations)
```

**Security Notes:**
- ✅ Service role key bypasses RLS (use only in API routes)
- ✅ Should NEVER be exposed to client
- ✅ Used for admin operations (user deletion, etc.)

---

## 🔑 Authentication Flow

### **1. User Registration Flow**

```
1. User fills registration form (email, password, firstName, lastName)
2. Frontend calls: signUpWithEmail(email, password, { first_name, last_name, role: 'customer' })
3. Supabase Auth creates user in auth.users table
4. User metadata stored in auth.users.user_metadata
5. Email verification sent (if enabled in Supabase)
6. Profile creation:
   ⚠️ ISSUE: No automatic profile creation trigger!
   - Profile is created manually via upsert in profile page
   - Registration only stores data in user_metadata
   - Profile row in public.profiles may not exist until user visits profile page
```

**Current Implementation:**
- Registration stores metadata in `auth.users.user_metadata`
- Profile row created lazily when user updates profile
- No database trigger to auto-create profile on signup

**Potential Issues:**
- ❌ New users may not have profile row until they visit profile page
- ❌ `getUserRole()` and `isAdmin()` will fail for new users without profile
- ❌ Profile-dependent features may break for new users

### **2. User Login Flow**

```
1. User enters email/password
2. Frontend calls: signInWithEmail(email, password)
3. Supabase validates credentials
4. Returns JWT access token + refresh token
5. Session stored in localStorage (via supabase client)
6. onAuthStateChange event fires
7. useAuthSession hook updates state
8. User redirected to home page
9. Session refresh on page load ensures latest state
```

**Security Features:**
- ✅ Password hashing handled by Supabase
- ✅ JWT tokens with expiration
- ✅ Automatic token refresh
- ✅ Session persistence across page reloads

### **3. Session Management**

**Hook: `useAuthSession`** (`src/hooks/use-auth-session.ts`)
```typescript
- Initializes with getSession() on mount
- Subscribes to onAuthStateChange for real-time updates
- Returns: { session, loading, user }
- Handles session state reactively
```

**Session Refresh:**
- ✅ Automatic refresh via `autoRefreshToken: true`
- ✅ Manual refresh on home page mount
- ✅ Real-time updates via `onAuthStateChange`

---

## 🗄️ Database Authentication Schema

### **1. Profiles Table** (`public.profiles`)

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'customer'
);
```

**Key Features:**
- ✅ Foreign key to `auth.users` with CASCADE delete
- ✅ Role-based access control (customer/admin)
- ✅ RLS enabled for security

**Row Level Security Policies:**

```sql
-- Users can view their own profile
CREATE POLICY "Allow users to view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Allow users to update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);
```

**Security Analysis:**
- ✅ Users can only see/edit their own profile
- ❌ **MISSING**: INSERT policy for profile creation
- ❌ **MISSING**: Admin can view all profiles policy
- ⚠️ New users cannot create their own profile (no INSERT policy)

### **2. Orders Table RLS Policies**

```sql
-- Customer policies
CREATE POLICY "Allow customer to view their own orders" FOR SELECT
USING (auth.uid() = customer_id);

CREATE POLICY "Allow customer to insert their own orders" FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Allow customer to update their own orders" FOR UPDATE
USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

-- Admin policies
CREATE POLICY "Allow admin to view all orders" FOR SELECT
USING (is_admin());

CREATE POLICY "Allow admin to update all orders" FOR UPDATE
USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Allow admin to insert orders" FOR INSERT
WITH CHECK (is_admin());
```

**Security Analysis:**
- ✅ Customers can only manage their own orders
- ✅ Admins can manage all orders
- ✅ Proper WITH CHECK clauses for INSERT/UPDATE
- ✅ Uses `is_admin()` function for admin checks

### **3. Admin Check Function**

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    auth.role() = 'authenticated' AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
END;
$$;
```

**Security Analysis:**
- ✅ Checks authentication status
- ✅ Verifies role from profiles table
- ✅ Uses SECURITY DEFINER (runs with creator's privileges)
- ⚠️ **VULNERABILITY**: Returns NULL/false if profile doesn't exist
- ⚠️ **VULNERABILITY**: No error handling if profile query fails

---

## 🔒 API Route Security

### **Delete Account API** (`src/app/api/delete-account/route.ts`)

**Authentication Flow:**
```typescript
1. Extract Authorization header
2. Parse Bearer token
3. Verify token with supabaseAdmin.auth.getUser(token)
4. Delete user data (orders, profile, auth user)
```

**Current Implementation:**
```typescript
const authHeader = request.headers.get('authorization');
const token = authHeader.replace('Bearer ', '');
const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
```

**Security Analysis:**
- ✅ Token verification before operations
- ✅ Uses admin client for user deletion
- ✅ Proper error handling
- ❌ **CRITICAL ISSUE**: Frontend doesn't send token!
- ❌ Delete account page calls API without Authorization header

**Frontend Issue:**
```typescript
// src/app/delete-account/page.tsx
const response = await fetch('/api/delete-account', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    // ❌ MISSING: Authorization header with token!
  },
});
```

**Impact:**
- ❌ API will always return 401 Unauthorized
- ❌ Account deletion will never work
- ❌ Security check is in place but frontend doesn't use it

---

## 🛡️ Security Analysis

### **✅ Strengths**

1. **RLS Policies**
   - Comprehensive row-level security
   - Users can only access their own data
   - Admin functions properly secured

2. **Token Management**
   - Automatic token refresh
   - Secure token storage (localStorage)
   - Session persistence

3. **Role-Based Access Control**
   - Admin/customer role separation
   - Database-level role checking
   - Frontend role verification

4. **API Security**
   - Token verification in API routes
   - Admin client for privileged operations
   - Proper error handling

### **❌ Critical Issues**

1. **Missing Profile Creation**
   - No automatic profile creation on signup
   - No INSERT policy for profiles table
   - New users may not have profile row
   - `getUserRole()` and `isAdmin()` may fail

2. **Delete Account API Not Working**
   - Frontend doesn't send Authorization token
   - API will always reject requests
   - Account deletion feature is broken

3. **Profile INSERT Policy Missing**
   - Users cannot create their own profile
   - Profile creation relies on upsert (which may fail without INSERT policy)
   - Admin cannot create profiles for users

4. **Admin Function Vulnerability**
   - `is_admin()` returns false if profile doesn't exist
   - No error handling for missing profiles
   - Could allow unauthorized access if profile check fails

### **⚠️ Potential Vulnerabilities**

1. **Race Conditions**
   - Profile creation timing issues
   - Role checking before profile exists
   - Session state synchronization

2. **Token Exposure**
   - Tokens stored in localStorage (XSS risk)
   - No token rotation mechanism
   - Long-lived sessions

3. **Missing Admin Policies**
   - No admin policy to view all profiles
   - No admin policy to create profiles
   - Admin operations may be limited

4. **Error Handling**
   - Silent failures in profile operations
   - No logging for security events
   - Limited error messages to users

---

## 🔧 Recommended Fixes

### **1. Fix Profile Creation**

**Add Database Trigger:**
```sql
-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'role', 'customer'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Add INSERT Policy:**
```sql
-- Allow users to insert their own profile (for initial creation)
CREATE POLICY "Allow users to insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow admins to insert any profile
CREATE POLICY "Allow admin to insert profiles"
ON public.profiles FOR INSERT
WITH CHECK (is_admin());
```

### **2. Fix Delete Account API**

**Update Frontend:**
```typescript
// src/app/delete-account/page.tsx
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

const response = await fetch('/api/delete-account', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`, // ✅ Add token
  },
});
```

### **3. Improve Admin Function**

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Check if authenticated
  IF auth.role() != 'authenticated' THEN
    RETURN FALSE;
  END IF;
  
  -- Get role with error handling
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- Return true only if role is explicitly 'admin'
  RETURN COALESCE(user_role, '') = 'admin';
END;
$$;
```

### **4. Add Admin Profile Policies**

```sql
-- Allow admins to view all profiles
CREATE POLICY "Allow admin to view all profiles"
ON public.profiles FOR SELECT
USING (is_admin());

-- Allow admins to update any profile
CREATE POLICY "Allow admin to update all profiles"
ON public.profiles FOR UPDATE
USING (is_admin());
```

### **5. Add Logging and Monitoring**

```typescript
// Add security event logging
console.log('Auth event:', {
  userId: user.id,
  action: 'login',
  timestamp: new Date(),
  ip: request.headers.get('x-forwarded-for'),
});
```

---

## 📊 Authentication State Flow

```
┌─────────────────┐
│  User Signs Up  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Supabase Auth Creates   │
│ User in auth.users      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ ❌ Profile NOT Created  │
│ (No Trigger)            │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ User Logs In            │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ JWT Token Generated     │
│ Session Stored          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ useAuthSession Hook     │
│ Updates State           │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ User Visits Profile     │
│ Profile Created via     │
│ Upsert                  │
└─────────────────────────┘
```

---

## 🔍 Security Checklist

### **Current Status:**

- [x] RLS enabled on all tables
- [x] Role-based access control
- [x] Token-based API authentication
- [x] Session management
- [x] Password hashing (Supabase)
- [ ] Automatic profile creation
- [ ] Profile INSERT policy
- [ ] Delete account API token passing
- [ ] Admin profile management policies
- [ ] Security event logging
- [ ] Token rotation
- [ ] Rate limiting on auth endpoints

---

## 📝 Summary

### **What's Working:**
1. ✅ Basic authentication flow (signup/login)
2. ✅ Session management and persistence
3. ✅ RLS policies for data isolation
4. ✅ Role-based access control structure
5. ✅ Token-based API security (backend)

### **What Needs Fixing:**
1. ❌ Profile auto-creation on signup
2. ❌ Profile INSERT RLS policy
3. ❌ Delete account API token passing
4. ❌ Admin profile management policies
5. ❌ Error handling in admin function

### **Security Rating: 7/10**

**Strengths:** Good foundation with RLS and role-based access
**Weaknesses:** Missing profile creation, broken delete API, incomplete policies

---

**Generated:** Comprehensive authentication backend analysis
**Last Updated:** Based on current codebase state

