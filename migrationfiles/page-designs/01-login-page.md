# Login Page Design & Logic

Complete design specification and business logic for the Login page in the RKR Laundry Android app.

---

## 📋 Table of Contents

1. [Page Purpose](#1-page-purpose)
2. [User Flow](#2-user-flow)
3. [UI Layout](#3-ui-layout)
4. [Data Models](#4-data-models)
5. [State Management](#5-state-management)
6. [Business Logic](#6-business-logic)
7. [API Integration](#7-api-integration)
8. [Form Validation](#8-form-validation)
9. [Error Handling](#9-error-handling)
10. [Loading States](#10-loading-states)
11. [Android Implementation](#11-android-implementation)

---

## 1. Page Purpose

**Primary Goal:** Allow existing users to authenticate and access their account.

**Key Features:**
- Email/password authentication
- Password visibility toggle
- Forgot password functionality
- Login attempt rate limiting (security)
- Password reset rate limiting
- Session management
- Redirect to homepage after successful login

**User Types:**
- Returning customers
- Users who forgot their password

---

## 2. User Flow

### 2.1 Standard Login Flow

```
1. User opens Login page
2. User enters email and password
3. User clicks "Sign In" button
4. System validates credentials
5. If valid:
   - Create session
   - Reset login attempts for email
   - Show success toast
   - Redirect to homepage
6. If invalid:
   - Increment failed attempt counter
   - Show error message
   - If 3+ attempts: Lock account for 1 minute
```

### 2.2 Forgot Password Flow

```
1. User clicks "Forgot password?" link
2. Dialog opens
3. User enters email
4. User clicks "Send Reset Link"
5. System validates email
6. If valid:
   - Send password reset email
   - Increment reset attempt counter
   - Show success message
   - Close dialog
7. If invalid/rate limited:
   - Show error message
   - If 3+ attempts: Lock for 30 minutes
```

### 2.3 Navigation Flow

- **From:** Homepage (Login button), Register page, Reset Password page
- **To:** Homepage (after login), Register page, Reset Password page (via email link)

---

## 3. UI Layout

### 3.1 Page Structure

```
┌─────────────────────────────────┐
│         App Header               │
├─────────────────────────────────┤
│         Promo Banner             │
├─────────────────────────────────┤
│                                 │
│    ┌─────────────────────┐     │
│    │   Login Card        │     │
│    │                     │     │
│    │  [Email Input]      │     │
│    │  [Password Input]   │     │
│    │  [Forgot Password?] │     │
│    │  [Sign In Button]   │     │
│    │                     │     │
│    │  [Register Link]    │     │
│    └─────────────────────┘     │
│                                 │
├─────────────────────────────────┤
│         App Footer               │
└─────────────────────────────────┘
```

### 3.2 Login Card Components

**Card Header:**
- Icon: LogIn icon (purple)
- Title: "Welcome Back" (2xl/3xl, bold)
- Description: "Enter your credentials to access your account"

**Form Fields:**
1. **Email Input:**
   - Label: "Email Address" with Mail icon
   - Placeholder: "your.email@example.com"
   - Type: email
   - Required: Yes
   - Validation: Email format

2. **Password Input:**
   - Label: "Password"
   - Placeholder: "Enter your password"
   - Type: password/text (toggleable)
   - Required: Yes
   - Show/Hide toggle button (Eye/EyeOff icon)

3. **Forgot Password Link:**
   - Text: "Forgot password?"
   - Position: Right-aligned below password field
   - Opens dialog

4. **Sign In Button:**
   - Text: "Sign In" or "Logging in..." (when loading)
   - Icon: LogIn icon
   - Full width
   - Disabled when: Loading, locked out
   - Shows countdown timer when locked out

**Footer Section:**
- Text: "Don't have an account? Create one now"
- Link to Register page

### 3.3 Forgot Password Dialog

**Dialog Structure:**
- Title: "Reset Password"
- Description: "Enter your email address and we'll send you a link to reset your password."

**Dialog Content:**
- Email Input field
- "Send Reset Link" button
- Lockout message (if applicable)
- Countdown timer (if locked out)

### 3.4 Lockout Display

**Login Lockout:**
- Shows countdown: "Please wait {X}s"
- Disables submit button
- Shows error message: "Too many failed attempts. Please wait {X} seconds before trying again."

**Reset Lockout:**
- Shows countdown: "Wait {X}m {Y}s"
- Disables submit button
- Shows error message: "Too many reset requests. Please wait {X} minutes and {Y} seconds before requesting another."

---

## 4. Data Models

### 4.1 Login Form State

```kotlin
data class LoginFormState(
    val email: String = "",
    val password: String = "",
    val showPassword: Boolean = false,
    val isLoading: Boolean = false,
    val lockoutUntil: Long? = null, // Timestamp
    val remainingSeconds: Int = 0
)
```

### 4.2 Password Reset Dialog State

```kotlin
data class PasswordResetState(
    val email: String = "",
    val isOpen: Boolean = false,
    val isSending: Boolean = false,
    val lockoutUntil: Long? = null, // Timestamp
    val remainingSeconds: Int = 0
)
```

### 4.3 Login Attempts (Local Storage)

```kotlin
data class LoginAttempts(
    val count: Int = 0,
    val lockoutUntil: Long? = null // Timestamp in milliseconds
)

// Stored as: Map<String, LoginAttempts> where key is normalized email
```

### 4.4 Constants

```kotlin
object LoginConstants {
    const val MAX_LOGIN_ATTEMPTS = 3
    const val LOGIN_LOCKOUT_DURATION_MS = 60 * 1000L // 1 minute
    const val MAX_RESET_ATTEMPTS = 3
    const val RESET_LOCKOUT_DURATION_MS = 30 * 60 * 1000L // 30 minutes
    const val STORAGE_KEY_LOGIN = "rkr_login_attempts"
    const val STORAGE_KEY_RESET = "rkr_password_reset_attempts"
}
```

---

## 5. State Management

### 5.1 ViewModel State

```kotlin
data class LoginUiState(
    val formState: LoginFormState = LoginFormState(),
    val resetState: PasswordResetState = PasswordResetState(),
    val errorMessage: String? = null,
    val successMessage: String? = null
)
```

### 5.2 State Updates

**On Email Change:**
- Update email in form state
- Check lockout status for this email
- Update lockoutUntil if locked out

**On Password Change:**
- Update password in form state

**On Toggle Password Visibility:**
- Toggle showPassword boolean

**On Submit:**
- Validate form
- Check lockout status
- If locked out: Show error, return
- If not locked out: Call login API
- On success: Reset attempts, navigate to homepage
- On failure: Increment attempts, show error

**On Forgot Password:**
- Open dialog
- Check reset lockout status
- On submit: Validate email, check lockout
- If locked out: Show error, return
- If not locked out: Send reset email
- On success: Increment attempts, show success
- On failure: Increment attempts, show error

---

## 6. Business Logic

### 6.1 Email Normalization

```kotlin
fun normalizeEmail(email: String): String {
    return email.lowercase().trim()
}
```

### 6.2 Login Attempt Management

**Get Login Attempts:**
```kotlin
fun getLoginAttempts(email: String): LoginAttempts {
    val normalizedEmail = normalizeEmail(email)
    val stored = sharedPreferences.getString(STORAGE_KEY_LOGIN, null)
    // Parse JSON and get attempts for email
    // Clean expired lockouts
    return attempts[normalizedEmail] ?: LoginAttempts()
}
```

**Increment Failed Attempt:**
```kotlin
fun incrementFailedAttempt(email: String): LoginAttempts {
    val attempts = getLoginAttempts(email)
    val newCount = attempts.count + 1
    val lockoutUntil = if (newCount >= MAX_ATTEMPTS) {
        // If already locked, extend lockout
        if (attempts.lockoutUntil != null && System.currentTimeMillis() < attempts.lockoutUntil) {
            attempts.lockoutUntil + LOGIN_LOCKOUT_DURATION_MS
        } else {
            System.currentTimeMillis() + LOGIN_LOCKOUT_DURATION_MS
        }
    } else null
    
    val newAttempts = LoginAttempts(newCount, lockoutUntil)
    saveLoginAttempts(email, newAttempts)
    return newAttempts
}
```

**Reset Login Attempts:**
```kotlin
fun resetLoginAttempts(email: String) {
    val normalizedEmail = normalizeEmail(email)
    // Remove from storage
    // Save updated map
}
```

### 6.3 Password Reset Attempt Management

Same logic as login attempts, but with:
- `MAX_RESET_ATTEMPTS = 3`
- `RESET_LOCKOUT_DURATION_MS = 30 minutes`
- Different storage key

### 6.4 Lockout Timer

**Update Timer:**
```kotlin
fun updateLockoutTimer(lockoutUntil: Long?): Int {
    if (lockoutUntil == null) return 0
    
    val now = System.currentTimeMillis()
    val remaining = ((lockoutUntil - now) / 1000).toInt()
    
    if (remaining <= 0) {
        // Lockout expired, reset attempts
        return 0
    }
    
    return remaining
}
```

---

## 7. API Integration

### 7.1 Login API

**Function:** `signInWithEmail(email: String, password: String)`

**Request:**
```kotlin
// Supabase Auth
supabase.auth.signInWith(
    Email,
    EmailLoginRequest(
        email = email,
        password = password
    )
)
```

**Response:**
- Success: Session created, user object returned
- Error: Error object with status code and message

**Error Codes:**
- `400`: Invalid credentials
- `429`: Rate limit exceeded
- Other: Network/server errors

### 7.2 Password Reset API

**Function:** `resetPasswordForEmail(email: String)`

**Request:**
```kotlin
supabase.auth.resetPasswordForEmail(
    email = email,
    redirectTo = "https://yourapp.com/reset-password"
)
```

**Response:**
- Success: Email sent
- Error: Error object with status code and message

**Error Codes:**
- `400`: Invalid email format
- `429`: Rate limit exceeded (email limit)
- Other: Network/server errors

---

## 8. Form Validation

### 8.1 Email Validation

```kotlin
fun isValidEmail(email: String): Boolean {
    return android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
}
```

**Validation Rules:**
- Required field
- Must be valid email format
- Trimmed before validation

### 8.2 Password Validation

**Validation Rules:**
- Required field
- Minimum length: 6 characters (enforced by Supabase)
- No maximum length

### 8.3 Submit Validation

```kotlin
fun validateForm(email: String, password: String): ValidationResult {
    if (email.isBlank()) {
        return ValidationResult.Error("Email is required")
    }
    if (!isValidEmail(email)) {
        return ValidationResult.Error("Invalid email format")
    }
    if (password.isBlank()) {
        return ValidationResult.Error("Password is required")
    }
    if (password.length < 6) {
        return ValidationResult.Error("Password must be at least 6 characters")
    }
    return ValidationResult.Success
}
```

---

## 9. Error Handling

### 9.1 Login Errors

**Invalid Credentials:**
- Message: "Invalid credentials. {X} attempt(s) remaining for this email."
- Action: Increment failed attempt counter
- Show remaining attempts

**Too Many Attempts:**
- Message: "You have exceeded 3 login attempts for this email. Please wait {X} second(s) before trying again."
- Action: Lock account, show countdown timer
- Disable submit button

**Network Errors:**
- Message: "Network error. Please check your connection and try again."
- Action: Allow retry

**Server Errors:**
- Message: "Server error. Please try again later."
- Action: Allow retry

### 9.2 Password Reset Errors

**Invalid Email:**
- Message: "Invalid email address. Please check and try again."
- Action: Highlight email field

**Too Many Reset Requests:**
- Message: "You have exceeded 3 password reset requests. Please wait {X} minute(s) and {Y} second(s) before trying again."
- Action: Lock reset, show countdown timer
- Disable submit button

**Email Limit Reached:**
- Message: "Daily or monthly email limit reached. Please try again later."
- Action: Show error, allow retry after delay

**Network/Server Errors:**
- Same as login errors

---

## 10. Loading States

### 10.1 Login Loading

**Button State:**
- Text: "Logging in..." when loading
- Icon: Spinner icon (animated)
- Disabled: Yes

**Form State:**
- All inputs disabled
- Submit button disabled

### 10.2 Password Reset Loading

**Button State:**
- Text: "Sending..." when loading
- Icon: Mail icon (animated pulse)
- Disabled: Yes

**Dialog State:**
- Email input disabled
- Submit button disabled

### 10.3 Lockout Loading

**Login Lockout:**
- Button shows: "Please wait {X}s"
- Icon: Clock icon (animated pulse)
- Button disabled

**Reset Lockout:**
- Button shows: "Wait {X}m {Y}s"
- Icon: Clock icon (animated pulse)
- Button disabled

---

## 11. Android Implementation

### 11.1 Activity/Fragment Structure

**Recommended:** Single Activity with Navigation Component

**Fragment:** `LoginFragment`

**Layout:** `fragment_login.xml`

### 11.2 ViewModel

```kotlin
class LoginViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()
    
    private val loginAttemptsManager = LoginAttemptsManager()
    private val resetAttemptsManager = ResetAttemptsManager()
    
    fun updateEmail(email: String) {
        // Update state
        // Check lockout
    }
    
    fun updatePassword(password: String) {
        // Update state
    }
    
    fun togglePasswordVisibility() {
        // Toggle state
    }
    
    suspend fun login(email: String, password: String) {
        // Validate
        // Check lockout
        // Call API
        // Handle response
    }
    
    suspend fun requestPasswordReset(email: String) {
        // Validate
        // Check lockout
        // Call API
        // Handle response
    }
}
```

### 11.3 Repository

```kotlin
class AuthRepository {
    suspend fun signInWithEmail(email: String, password: String): Result<AuthResponse> {
        return try {
            val response = supabase.auth.signInWith(Email, EmailLoginRequest(email, password))
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun resetPasswordForEmail(email: String): Result<Unit> {
        return try {
            supabase.auth.resetPasswordForEmail(email, redirectTo = "...")
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

### 11.4 Local Storage (SharedPreferences)

```kotlin
class LoginAttemptsManager(private val prefs: SharedPreferences) {
    fun getLoginAttempts(email: String): LoginAttempts {
        // Read from SharedPreferences
    }
    
    fun saveLoginAttempts(email: String, attempts: LoginAttempts) {
        // Save to SharedPreferences
    }
    
    fun resetLoginAttempts(email: String) {
        // Remove from SharedPreferences
    }
}
```

### 11.5 Navigation

**To Homepage:**
```kotlin
findNavController().navigate(
    LoginFragmentDirections.actionLoginFragmentToHomeFragment()
)
```

**To Register:**
```kotlin
findNavController().navigate(
    LoginFragmentDirections.actionLoginFragmentToRegisterFragment()
)
```

**To Reset Password:**
```kotlin
// Usually handled via email link, but can navigate directly
findNavController().navigate(
    LoginFragmentDirections.actionLoginFragmentToResetPasswordFragment()
)
```

### 11.6 UI Components

**Email Input:**
- Material TextInputLayout with TextInputEditText
- InputType: TYPE_TEXT_VARIATION_EMAIL_ADDRESS
- Icons: Mail icon (start), Clear icon (end, when has text)

**Password Input:**
- Material TextInputLayout with TextInputEditText
- InputType: TYPE_TEXT_VARIATION_PASSWORD (toggleable)
- Icons: Lock icon (start), Eye/EyeOff icon (end)

**Submit Button:**
- Material Button
- Full width
- Gradient background (purple)
- Loading state with ProgressIndicator

**Lockout Display:**
- Material Card with error styling
- Countdown timer text
- Clock icon

---

## 12. Testing Considerations

### 12.1 Unit Tests

- Email validation
- Password validation
- Login attempt counter logic
- Lockout timer calculation
- Email normalization

### 12.2 Integration Tests

- Successful login flow
- Failed login flow
- Lockout after 3 attempts
- Password reset request
- Reset lockout after 3 attempts

### 12.3 UI Tests

- Form submission
- Password visibility toggle
- Forgot password dialog
- Lockout countdown display
- Navigation flows

---

**End of Login Page Design Document**
