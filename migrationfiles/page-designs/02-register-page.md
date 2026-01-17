# Register Page Design & Logic

Complete design specification and business logic for the Register/Sign Up page in the RKR Laundry Android app.

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

**Primary Goal:** Allow new users to create an account and register for the service.

**Key Features:**
- User registration with email/password
- First name and last name collection
- Password confirmation
- Password visibility toggles
- Email verification requirement
- Automatic redirect to login after successful registration

**User Types:**
- New customers
- Users without an account

---

## 2. User Flow

### 2.1 Standard Registration Flow

```
1. User opens Register page
2. User fills in:
   - First Name
   - Last Name
   - Email Address
   - Password
   - Confirm Password
3. User clicks "Create Account" button
4. System validates all fields
5. If valid:
   - Create account via Supabase
   - Send verification email
   - Show success message
   - Redirect to login page after 3 seconds
6. If invalid:
   - Show error message
   - Highlight invalid fields
```

### 2.2 Navigation Flow

- **From:** Homepage (Register button), Login page
- **To:** Login page (after successful registration)

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
│    │   Register Card     │     │
│    │                     │     │
│    │  [First Name]       │     │
│    │  [Last Name]        │     │
│    │  [Email Input]      │     │
│    │  [Password Input]   │     │
│    │  [Confirm Password] │     │
│    │  [Create Button]    │     │
│    │                     │     │
│    │  [Login Link]       │     │
│    └─────────────────────┘     │
│                                 │
├─────────────────────────────────┤
│         App Footer               │
└─────────────────────────────────┘
```

### 3.2 Register Card Components

**Card Header:**
- Icon: UserPlus icon (purple)
- Title: "Create Account" (2xl/3xl, bold)
- Description: "Join RKR Laundry and start tracking your orders"

**Form Fields:**
1. **First Name Input:**
   - Label: "First Name" with User icon
   - Placeholder: "John"
   - Type: text
   - Required: Yes
   - Grid: 2 columns (with Last Name)

2. **Last Name Input:**
   - Label: "Last Name"
   - Placeholder: "Doe"
   - Type: text
   - Required: Yes
   - Grid: 2 columns (with First Name)

3. **Email Input:**
   - Label: "Email Address" with Mail icon
   - Placeholder: "your.email@example.com"
   - Type: email
   - Required: Yes
   - Validation: Email format

4. **Password Input:**
   - Label: "Password" with Lock icon
   - Placeholder: "At least 6 characters"
   - Type: password/text (toggleable)
   - Required: Yes
   - Min length: 6 characters
   - Show/Hide toggle button
   - Helper text: "Must be at least 6 characters long"

5. **Confirm Password Input:**
   - Label: "Confirm Password"
   - Placeholder: "Re-enter your password"
   - Type: password/text (toggleable)
   - Required: Yes
   - Min length: 6 characters
   - Show/Hide toggle button
   - Error message: "Passwords do not match" (if mismatch)

6. **Create Account Button:**
   - Text: "Create Account" or "Creating account..." (when loading)
   - Icon: UserPlus icon
   - Full width
   - Disabled when: Loading

**Footer Section:**
- Info: "Free to join • No credit card required" (with CheckCircle icon)
- Text: "Already have an account? Sign in here"
- Link to Login page

---

## 4. Data Models

### 4.1 Registration Form State

```kotlin
data class RegisterFormState(
    val firstName: String = "",
    val lastName: String = "",
    val email: String = "",
    val password: String = "",
    val confirmPassword: String = "",
    val showPassword: Boolean = false,
    val showConfirmPassword: Boolean = false,
    val isLoading: Boolean = false,
    val passwordError: String? = null,
    val generalError: String? = null
)
```

### 4.2 Registration Request

```kotlin
data class RegistrationRequest(
    val email: String,
    val password: String,
    val metadata: UserMetadata
)

data class UserMetadata(
    val first_name: String?,
    val last_name: String?,
    val role: String = "customer"
)
```

---

## 5. State Management

### 5.1 ViewModel State

```kotlin
data class RegisterUiState(
    val formState: RegisterFormState = RegisterFormState(),
    val successMessage: String? = null
)
```

### 5.2 State Updates

**On First Name Change:**
- Update firstName in form state

**On Last Name Change:**
- Update lastName in form state

**On Email Change:**
- Update email in form state

**On Password Change:**
- Update password in form state
- Clear passwordError if passwords match

**On Confirm Password Change:**
- Update confirmPassword in form state
- Validate password match
- Set passwordError if mismatch

**On Toggle Password Visibility:**
- Toggle showPassword boolean

**On Toggle Confirm Password Visibility:**
- Toggle showConfirmPassword boolean

**On Submit:**
- Validate all fields
- Check password match
- If valid: Call registration API
- On success: Show success message, navigate to login
- On failure: Show error message

---

## 6. Business Logic

### 6.1 Password Match Validation

```kotlin
fun validatePasswordMatch(password: String, confirmPassword: String): Boolean {
    return password == confirmPassword
}
```

### 6.2 Form Validation

```kotlin
fun validateForm(
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    confirmPassword: String
): ValidationResult {
    if (firstName.isBlank()) {
        return ValidationResult.Error("First name is required")
    }
    if (lastName.isBlank()) {
        return ValidationResult.Error("Last name is required")
    }
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
    if (confirmPassword.isBlank()) {
        return ValidationResult.Error("Please confirm your password")
    }
    if (password != confirmPassword) {
        return ValidationResult.Error("Passwords do not match")
    }
    return ValidationResult.Success
}
```

---

## 7. API Integration

### 7.1 Registration API

**Function:** `signUpWithEmail(email: String, password: String, metadata: UserMetadata)`

**Request:**
```kotlin
supabase.auth.signUp(
    email = email,
    password = password,
    data = mapOf(
        "first_name" to metadata.first_name,
        "last_name" to metadata.last_name,
        "role" to metadata.role
    )
)
```

**Response:**
- Success: User object returned (email verification required)
- Error: Error object with status code and message

**Error Codes:**
- `400`: Invalid email format or password too short
- `429`: Rate limit exceeded (email limit)
- Other: Network/server errors

### 7.2 Profile Creation

**Note:** Profile is automatically created via database trigger when user signs up, but metadata is stored in auth.users table.

---

## 8. Form Validation

### 8.1 Field Validation Rules

**First Name:**
- Required: Yes
- Min length: 1 character
- Max length: 50 characters (recommended)
- Allowed: Letters, spaces, hyphens

**Last Name:**
- Required: Yes
- Min length: 1 character
- Max length: 50 characters (recommended)
- Allowed: Letters, spaces, hyphens

**Email:**
- Required: Yes
- Format: Valid email address
- Case: Converted to lowercase

**Password:**
- Required: Yes
- Min length: 6 characters (Supabase requirement)
- No maximum length
- No complexity requirements (for simplicity)

**Confirm Password:**
- Required: Yes
- Must match: Password field exactly

### 8.2 Real-time Validation

**Password Match:**
- Validate on confirmPassword change
- Show error immediately if mismatch
- Clear error when passwords match

---

## 9. Error Handling

### 9.1 Validation Errors

**Empty Fields:**
- Message: "{Field name} is required"
- Action: Highlight field, show error below input

**Invalid Email:**
- Message: "Invalid email address. Please check and try again."
- Action: Highlight email field

**Password Too Short:**
- Message: "Password must be at least 6 characters long."
- Action: Highlight password field

**Passwords Don't Match:**
- Message: "Passwords do not match"
- Action: Highlight confirmPassword field, show error below

### 9.2 API Errors

**Email Already Exists:**
- Message: "An account with this email already exists. Please sign in instead."
- Action: Show error, suggest login

**Invalid Email Format:**
- Message: "Invalid email address. Please check and try again."
- Action: Highlight email field

**Email Limit Reached:**
- Message: "Email limit reached. Please try again later."
- Action: Show error, allow retry after delay

**Network Errors:**
- Message: "Network error. Please check your connection and try again."
- Action: Allow retry

**Server Errors:**
- Message: "Failed to create account. Please try again."
- Action: Allow retry

### 9.3 Success Handling

**Registration Success:**
- Message: "Signup Successful! Check your email to verify. Redirecting to login..."
- Action: Show toast, wait 3 seconds, navigate to login
- Duration: 3 seconds before redirect

---

## 10. Loading States

### 10.1 Registration Loading

**Button State:**
- Text: "Creating account..." when loading
- Icon: UserPlus icon (animated pulse)
- Disabled: Yes

**Form State:**
- All inputs disabled
- Submit button disabled
- No field editing allowed

### 10.2 Success State

**After Registration:**
- Show success toast
- Disable form
- Show redirect message
- Auto-navigate after 3 seconds

---

## 11. Android Implementation

### 11.1 Activity/Fragment Structure

**Fragment:** `RegisterFragment`

**Layout:** `fragment_register.xml`

### 11.2 ViewModel

```kotlin
class RegisterViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(RegisterUiState())
    val uiState: StateFlow<RegisterUiState> = _uiState.asStateFlow()
    
    private val authRepository = AuthRepository()
    
    fun updateFirstName(firstName: String) {
        _uiState.update { it.copy(formState = it.formState.copy(firstName = firstName)) }
    }
    
    fun updateLastName(lastName: String) {
        _uiState.update { it.copy(formState = it.formState.copy(lastName = lastName)) }
    }
    
    fun updateEmail(email: String) {
        _uiState.update { it.copy(formState = it.formState.copy(email = email)) }
    }
    
    fun updatePassword(password: String) {
        val formState = _uiState.value.formState
        val newState = formState.copy(
            password = password,
            passwordError = if (password != formState.confirmPassword && formState.confirmPassword.isNotEmpty()) {
                "Passwords do not match"
            } else null
        )
        _uiState.update { it.copy(formState = newState) }
    }
    
    fun updateConfirmPassword(confirmPassword: String) {
        val formState = _uiState.value.formState
        val newState = formState.copy(
            confirmPassword = confirmPassword,
            passwordError = if (confirmPassword != formState.password) {
                "Passwords do not match"
            } else null
        )
        _uiState.update { it.copy(formState = newState) }
    }
    
    fun togglePasswordVisibility() {
        _uiState.update { 
            it.copy(formState = it.formState.copy(showPassword = !it.formState.showPassword))
        }
    }
    
    fun toggleConfirmPasswordVisibility() {
        _uiState.update { 
            it.copy(formState = it.formState.copy(showConfirmPassword = !it.formState.showConfirmPassword))
        }
    }
    
    suspend fun register(
        firstName: String,
        lastName: String,
        email: String,
        password: String,
        confirmPassword: String
    ) {
        // Validate
        val validation = validateForm(firstName, lastName, email, password, confirmPassword)
        if (validation is ValidationResult.Error) {
            _uiState.update { 
                it.copy(formState = it.formState.copy(generalError = validation.message))
            }
            return
        }
        
        // Check password match
        if (password != confirmPassword) {
            _uiState.update { 
                it.copy(formState = it.formState.copy(passwordError = "Passwords do not match"))
            }
            return
        }
        
        // Set loading
        _uiState.update { it.copy(formState = it.formState.copy(isLoading = true, generalError = null)) }
        
        // Call API
        val result = authRepository.signUpWithEmail(
            email = email,
            password = password,
            metadata = UserMetadata(
                first_name = firstName.trim(),
                last_name = lastName.trim(),
                role = "customer"
            )
        )
        
        // Handle result
        result.fold(
            onSuccess = {
                _uiState.update { 
                    it.copy(
                        formState = it.formState.copy(isLoading = false),
                        successMessage = "Signup Successful! Check your email to verify. Redirecting to login..."
                    )
                }
            },
            onFailure = { error ->
                val errorMessage = when {
                    error.message?.contains("already registered", ignoreCase = true) == true -> {
                        "An account with this email already exists. Please sign in instead."
                    }
                    error.message?.contains("email", ignoreCase = true) == true -> {
                        "Invalid email address. Please check and try again."
                    }
                    else -> {
                        error.message ?: "Failed to create account. Please try again."
                    }
                }
                _uiState.update { 
                    it.copy(
                        formState = it.formState.copy(
                            isLoading = false,
                            generalError = errorMessage
                        )
                    )
                }
            }
        )
    }
}
```

### 11.3 Repository

```kotlin
class AuthRepository {
    suspend fun signUpWithEmail(
        email: String,
        password: String,
        metadata: UserMetadata
    ): Result<AuthResponse> {
        return try {
            val response = supabase.auth.signUp(
                email = email,
                password = password,
                data = mapOf(
                    "first_name" to metadata.first_name,
                    "last_name" to metadata.last_name,
                    "role" to metadata.role
                )
            )
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

### 11.4 Navigation

**To Login:**
```kotlin
// After successful registration, wait 3 seconds then navigate
lifecycleScope.launch {
    delay(3000)
    findNavController().navigate(
        RegisterFragmentDirections.actionRegisterFragmentToLoginFragment()
    )
}
```

**From Login:**
```kotlin
findNavController().navigate(
    LoginFragmentDirections.actionLoginFragmentToRegisterFragment()
)
```

### 11.5 UI Components

**Name Inputs (Grid Layout):**
- Material TextInputLayout with TextInputEditText
- Two columns in a Row/GridLayout
- InputType: TYPE_TEXT_VARIATION_PERSON_NAME

**Email Input:**
- Material TextInputLayout with TextInputEditText
- InputType: TYPE_TEXT_VARIATION_EMAIL_ADDRESS
- Icons: Mail icon (start)

**Password Inputs:**
- Material TextInputLayout with TextInputEditText
- InputType: TYPE_TEXT_VARIATION_PASSWORD (toggleable)
- Icons: Lock icon (start), Eye/EyeOff icon (end)

**Submit Button:**
- Material Button
- Full width
- Gradient background (yellow, matching homepage)
- Loading state with ProgressIndicator

**Error Display:**
- Material Card with error styling
- Error message text
- Dismissible (optional)

---

## 12. Testing Considerations

### 12.1 Unit Tests

- Form validation logic
- Password match validation
- Email validation
- Field trimming

### 12.2 Integration Tests

- Successful registration flow
- Failed registration (email exists)
- Failed registration (invalid email)
- Password mismatch handling

### 12.3 UI Tests

- Form submission
- Password visibility toggles
- Field validation display
- Navigation to login

---

**End of Register Page Design Document**
