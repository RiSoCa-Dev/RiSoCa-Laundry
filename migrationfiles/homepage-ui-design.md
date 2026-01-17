# Homepage UI Design Specification

Complete detailed design specification for the RKR Laundry homepage/main page, including layout, components, spacing, colors, typography, and Android implementation guidelines.

---

## ⚠️ CRITICAL IMPLEMENTATION NOTES - READ FIRST

### Authentication Buttons - MUST FIX

**Login Button:**
- **Text MUST be:** "Log in" (two words, with space) - NOT "Login" or "Sign In"
- **Background MUST be:** Blue gradient from `#3B82F6` to `#2563EB` - NOT purple
- **Icon:** ArrowRight icon on the left side of text
- **Color:** White text on blue gradient background

**Register Button:**
- **Text MUST be:** "Register" - NOT "Sign Up" or "Signup"
- **Background MUST be:** Yellow gradient from `#FACC15` to `#EAB308` - NOT purple
- **Icon:** UserPlus icon on the left side of text
- **Color:** White text on yellow gradient background

**Common Issues to Avoid:**
- ❌ Both buttons should NOT be the same color (purple)
- ❌ Login button should NOT be purple - it must be BLUE
- ❌ Register button should NOT be purple - it must be YELLOW
- ❌ Text should NOT be "Login" or "Sign Up" - use exact text above

### Grid Menu Items - MUST FIX

**Grid Layout:**
- **MUST be 3 columns** - NOT 4 columns
- **Total items:** 8 items arranged in 3 columns (3 rows: 3-3-2)

**Label Text - MUST Show Full Text:**
- ❌ Labels are being truncated - this is WRONG
- ✅ Labels MUST display complete text on multiple lines if needed
- ✅ Use `android:maxLines="2"` or `android:ellipsize="none"` to prevent truncation
- ✅ Text should wrap to 2 lines if needed, but show full words

**Exact Label Text (NO TRUNCATION):**
1. "Order Status" (NOT "Order" or "Orde")
2. "Create Order" (NOT "Crea" or "Create")
3. "Service Rates" (NOT "Servi" or "Service")
4. "Download App" (NOT "Do" or "Download")
5. "About Us" (NOT "A bo" or "About")
6. "FAQs" (NOT "FA Qs" or "FAQ")
7. "Branches" (NOT "Br an" or "Branch")
8. "Contact Us" (NOT "C on" or "Contact")

**Label Styling:**
- Font size: 12sp (mobile), 14sp (tablet)
- Text alignment: Center
- Allow text wrapping: YES (up to 2 lines)
- Text color: Dark gray/black `#2A2530` at 90% opacity
- Do NOT use ellipsize or single line - show full text

**Grid Item Container:**
- Height: 96dp (fixed)
- Background: Transparent (NO card background)
- Padding: 8dp all around
- Text should be centered below icon

---

## 1. Overall Layout Structure

### Page Structure

```
┌─────────────────────────────────────┐
│         App Header (Fixed)          │
│    (64dp height, top of screen)     │
├─────────────────────────────────────┤
│                                     │
│         Main Content Area           │
│      (Scrollable, centered)         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Logo Section           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Profile/Auth Buttons       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Grid Menu (3x3)         │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│      App Footer (Fixed)            │
│   (56dp height, bottom of screen)  │
└─────────────────────────────────────┘
```

### Layout Properties

**Container:**
- Type: Flex column, full screen height
- Overflow: Hidden (prevents scroll on container)
- Background: `#EDE7F6` (Light Lavender)

**Main Content:**
- Type: Flex column, centered vertically
- Padding Top: 64dp (for fixed header)
- Padding Bottom: 80dp (for fixed footer)
- Padding Horizontal: 16dp (mobile), 24dp (tablet)
- Alignment: Center (both horizontal and vertical)
- Max Width: No limit (content centered)

---

## 2. Header (App Bar)

### Header Structure

**When on Homepage:**
- **ALWAYS shows logo, text, and tagline on the LEFT side** (even if promo banner is active)
- Logo: Washing machine icon (small, 32dp x 32dp on mobile, 40dp x 40dp on tablet)
- Text: "RKR Laundry" in purple, bold, 18sp (mobile), 20sp (tablet)
- Tagline: "Fast. Clean. Convenient." in smaller gray text (12sp mobile, 14sp tablet) below the text
- Height: 64dp (fixed)
- Background: `#EDE7F6` with 95% opacity + backdrop blur
- Border: Bottom border, 1dp, color `#D4B8E5`
- Padding: 16dp horizontal
- Alignment: **Left-aligned content** (logo and text on left side)
- Layout: Horizontal row with icon, then vertical stack (text + tagline)

**Promo Banner (Optional - Above Header):**
- If active promo exists, promo banner appears ABOVE the header
- Header with logo + text + tagline is ALWAYS visible below promo banner
- Promo banner is separate from header
- Promo banner has animated gradient background

**When on Other Pages:**
- Shows logo and tagline (same as homepage, left-aligned)
- Height: 64dp (fixed)
- Background: `#EDE7F6` with 95% opacity
- Border: Bottom border, 1dp, color `#D4B8E5`

### Promo Banner (Homepage Only - Optional)

**Note:** Promo banner appears ABOVE the header when active, but header with logo + text + tagline is ALWAYS visible below it.

**Container:**
- Padding: 4dp vertical, 0dp horizontal
- Border Radius: 8dp
- Background: Animated gradient (yellow to red)
- Animation: Gradient shift (8s infinite)
- Position: Above header (if promo active)

**Content:**
- Padding: 8dp (mobile), 12dp (tablet)
- Border: 2dp, color `#FCD34D` (yellow-400) with 50% opacity
- Background: Gradient from yellow-50 to orange-50 to red-50
- Box Shadow: Multiple shadows for depth
- Border Radius: 8dp

**Elements:**
1. **"Once a Year Only!" Badge:**
   - Background: Gradient red-600 to orange-600
   - Text: White, bold, uppercase
   - Size: 9px (mobile), 10px (tablet)
   - Padding: 6dp horizontal, 2dp vertical
   - Border Radius: 999dp (pill)
   - Animation: Pulse

2. **Countdown Timer:**
   - Icon: Clock, 12px (mobile), 16px (tablet), color red-700
   - Label: "Promo Starts In:" or "Promo Ends In:"
   - Time: Days, Hours, Minutes, Seconds
   - Font: Bold, 10px (mobile), 12px (tablet)
   - Color: Red-700

3. **Gift Icon:**
   - Size: 16px (mobile), 20px (tablet)
   - Color: Yellow-600
   - Animation: Bounce (2s duration)

4. **Main Text:**
   - "✨ Special Offer! ✨"
   - "— Only ₱{price} per load! 🎉"
   - Font: Bold, 10px (mobile), 12px (tablet)
   - Color: Yellow-900

5. **Date Display:**
   - Mobile: Below countdown
   - Desktop: Below main text
   - Font: Semibold, 10px (mobile), 12px (tablet)
   - Color: Yellow-900, Red-700 for date

6. **Sparkle Icons:**
   - Multiple sparkles with pulse animation
   - Size: 8px to 12px
   - Color: Yellow-200 to Yellow-500
   - Position: Scattered across banner

---

## 3. Logo Section (Main Content - Centered)

### Layout

**Container:**
- Margin Bottom: 16dp (mobile), 24dp (tablet)
- Alignment: Center (horizontal and vertical)
- Flex Direction: Column
- Gap: 8dp

**Logo Row:**
- Flex Direction: Row
- Alignment: Center (both horizontal and vertical)
- Gap: 12dp

**Icon:**
- Component: WashingMachine (Lucide icon)
- Size: 64dp x 64dp
- Color: Primary `#673AB7`
- No background

**Text:**
- Font: Bold, 36sp
- Color: Primary `#673AB7`
- Text: "RKR Laundry"
- Line Height: 1.2

**Tagline:**
- Font: Regular, 14sp
- Color: Muted Foreground `#6B6B6B`
- Text: "Fast. Clean. Convenient."
- Margin Top: 0dp (part of logo container gap)
- Alignment: Center

---

## 4. Profile / Auth Buttons Section

### Container

**Layout:**
- Min Height: 96dp (to prevent layout shift)
- Flex Direction: Row
- Justification: Center
- Gap: 16dp
- Alignment: Center

### When User is Logged In (Profile Button)

**Profile Button Container:**
- Flex Direction: Column
- Alignment: Center
- Gap: 8dp

**Profile Avatar:**
- Size: 56dp x 56dp (diameter)
- Background: `#2563EB` (Blue-600)
- Border Radius: 999dp (circle)
- Text: User's initial (first letter of name)
- Font: Bold, 24sp
- Color: White
- Shadow: Large (elevation 6dp)
- Border: None
- Interactive: Clickable, opens dropdown menu
- Hover: Opacity 80%
- Focus: Ring 2dp, Primary color, offset 2dp

**User Name:**
- Font: Semibold, 14sp
- Color: Primary `#673AB7`
- Text: User's first name or display name
- Alignment: Center

**Dropdown Menu:**
- Width: 192dp (48 * 4)
- Background: White
- Border: 1dp, color `#D4B8E5`
- Border Radius: 8dp
- Shadow: Medium elevation
- Padding: 4dp
- Alignment: Center (below avatar)

**Menu Items:**
- Height: 40dp per item
- Padding: 12dp horizontal, 8dp vertical
- Gap: 8dp (icon to text)
- Font: Regular, 14sp
- Icon Size: 16dp x 16dp
- Hover: Background `#F5F3F9` (muted)

**Menu Items List:**
1. **Profile:**
   - Icon: User
   - Text: "Profile"
   - Action: Navigate to `/profile`

2. **My Orders:**
   - Icon: ShoppingBag
   - Text: "My Orders"
   - Action: Navigate to `/my-orders`

3. **Separator:**
   - Height: 1dp
   - Color: `#D4B8E5`
   - Margin: 4dp vertical

4. **Log Out:**
   - Icon: LogOut
   - Text: "Log Out"
   - Color: Destructive `#F44336`
   - Action: Sign out user

---

### When User is NOT Logged In (Auth Buttons)

**Login Button:**
- Size: 48dp height, 128dp width (mobile), 144dp width (tablet)
- Border Radius: 999dp (pill-shaped)
- Background: Gradient from `#3B82F6` (blue-500) to `#2563EB` (blue-600)
- Hover Background: Gradient from `#2563EB` (blue-600) to `#1D4ED8` (blue-700)
- Text: "Log in"
- Text Color: White
- Font: Medium, 14sp
- Icon: ArrowRight, 16dp x 16dp, margin right 8dp
- Shadow: Large (elevation 4dp)
- Hover Shadow: Extra large (elevation 6dp)
- Transition: All properties, 200ms

**Register Button:**
- Size: 48dp height, 128dp width (mobile), 144dp width (tablet)
- Border Radius: 999dp (pill-shaped)
- Background: Gradient from `#FACC15` (yellow-400) to `#EAB308` (yellow-500)
- Hover Background: Gradient from `#EAB308` (yellow-500) to `#CA8A04` (yellow-600)
- Text: "Register"
- Text Color: White
- Font: Medium, 14sp
- Icon: UserPlus, 16dp x 16dp, margin right 8dp
- Shadow: Large (elevation 4dp)
- Hover Shadow: Extra large (elevation 6dp)
- Transition: All properties, 200ms

**Loading State:**
- If auth is loading, buttons are hidden
- Container shows nothing (null)

---

## 5. Grid Menu

### Container

**Layout:**
- Type: Grid
- Columns: 3 (always)
- Gap: 8dp (mobile), 16dp (tablet)
- Width: 100%
- Max Width: 448dp (28 * 16)
- Alignment: Center
- Margin Top: 16dp (mobile), 24dp (tablet)

### Grid Items

**Individual Item:**
- Type: Link (or div if coming soon)
- Layout: Flex column
- Alignment: Center (horizontal), start (vertical)
- Gap: 4dp
- Padding: 8dp
- Height: 96dp (fixed)
- Border Radius: 8dp
- Background: **Transparent (no background, just icon and text)**
- Border: None
- Hover Background: `#F5F3F9` (muted) - subtle hover effect
- Position: Relative
- Cursor: Pointer (if clickable), not-allowed (if coming soon)
- Transition: Background color, 200ms
- Shadow: None (no elevation)

**Icon Container:**
- Flex Shrink: 0 (prevents icon from shrinking)
- Icon Size: 40dp x 40dp (mobile), 48dp x 48dp (tablet)
- Color: Foreground with 80% opacity `#2A2530` (80% opacity)
- Hover Color: Primary `#673AB7`
- Transition: Color, 200ms

**Label:**
- Font: Medium, 12sp (mobile), 14sp (tablet)
- Color: **Foreground with 90% opacity `#2A2530` (90% opacity)** - dark gray/black text
- Text Alignment: Center
- Flex Grow: 1 (pushes to bottom)
- Display: Flex (to center text vertically)
- Alignment: Center (vertical)

**Badge (Coming Soon):**
- Position: Absolute
- Top: -8dp (half outside)
- Left: Center
- Background: Secondary `#D1C4E9`
- Text: "Soon"
- Font: Regular, 12sp
- Padding: 2dp horizontal, 1dp vertical
- Border Radius: 4dp
- Z-Index: 10

**Notification Badge (Order Status):**
- Position: Absolute
- Top: -4dp
- Right: -4dp
- Size: 20dp x 20dp (diameter)
- Background: `#EF4444` (red-500)
- Text: Order count (white)
- Font: Regular, 12sp
- Border Radius: 999dp (circle)
- Z-Index: 10
- Display: Only if ongoing orders > 0

**Disabled State (Coming Soon):**
- Opacity: 50%
- Cursor: Not allowed
- No hover effect
- Not clickable

---

## 6. Footer

### Footer Structure

**Container:**
- Position: Fixed
- Bottom: 0
- Left: 0
- Right: 0
- Width: 100%
- Min Height: 56dp
- Padding: 8dp vertical, 16dp horizontal
- Background: `#EDE7F6` with 95% opacity + backdrop blur
- Border: Top border, 1dp, color `#D4B8E5`
- Z-Index: 9999 (always on top)

**Content:**
- Layout: Flex row, wrap
- Alignment: Center
- Justification: Center
- Gap: 16dp horizontal, 4dp vertical
- Font: Regular, 12sp (mobile), 14sp (tablet)
- Color: Muted Foreground `#6B6B6B`

**Elements:**
1. **Copyright:**
   - Text: "© {year} RKR Laundry. All rights reserved."
   - Alignment: Center

2. **Privacy Policy Link:**
   - Text: "Privacy Policy"
   - Color: Muted Foreground
   - Hover Color: Primary `#673AB7`
   - Underline: Yes
   - Transition: Color, 200ms

3. **Terms & Conditions Link:**
   - Text: "Terms & Conditions"
   - Color: Muted Foreground
   - Hover Color: Primary `#673AB7`
   - Underline: Yes
   - Transition: Color, 200ms

4. **Social Media Icons:**
   - Facebook: 16dp x 16dp (mobile), 20dp x 20dp (tablet)
   - Email: 16dp x 16dp (mobile), 20dp x 20dp (tablet)
   - Color: Muted Foreground
   - Hover Color: Primary `#673AB7`
   - Gap: 8dp between icons
   - Opacity: 50% for disabled (Facebook coming soon)

---

## 7. Spacing & Dimensions

### Spacing Scale

**Vertical Spacing:**
- Logo Section Bottom Margin: 16dp (mobile), 24dp (tablet)
- Profile/Auth Section Min Height: 96dp
- Grid Menu Top Margin: 16dp (mobile), 24dp (tablet)
- Grid Item Gap: 4dp (internal)
- Grid Gap: 8dp (mobile), 16dp (tablet)

**Horizontal Spacing:**
- Container Padding: 16dp (mobile), 24dp (tablet)
- Button Gap: 16dp
- Grid Gap: 8dp (mobile), 16dp (tablet)
- Footer Gap: 16dp horizontal

**Component Sizes:**
- Logo Icon: 64dp x 64dp
- Profile Avatar: 56dp x 56dp
- Auth Buttons: 48dp height, 128-144dp width
- Grid Items: 96dp height
- Grid Icons: 40dp (mobile), 48dp (tablet)
- Footer Icons: 16dp (mobile), 20dp (tablet)

---

## 8. Colors

### Primary Colors

**Background:**
- Main Background: `#EDE7F6` (Light Lavender)
- Card Background: `#FFFFFF` (White)
- Muted Background: `#F5F3F9` (Muted)

**Text:**
- Primary Text: `#2A2530` (Foreground)
- Muted Text: `#6B6B6B` (Muted Foreground)
- Primary Brand: `#673AB7` (Primary)

**Interactive:**
- Primary Button: `#673AB7` (Primary)
- Login Button: Gradient `#3B82F6` to `#2563EB`
- Register Button: Gradient `#FACC15` to `#EAB308`
- Profile Avatar: `#2563EB` (Blue-600)
- Hover Background: `#F5F3F9` (Muted)

**Borders:**
- Default Border: `#D4B8E5`
- Focus Ring: `#673AB7` (Primary)

**Status:**
- Notification Badge: `#EF4444` (Red-500)
- Destructive: `#F44336` (Red)

---

## 9. Typography

### Font Family
- **Primary:** PT Sans
- **Fallback:** Sans-serif

### Text Styles

**Logo:**
- Size: 36sp
- Weight: Bold (700)
- Color: Primary `#673AB7`
- Line Height: 1.2

**Tagline:**
- Size: 14sp
- Weight: Regular (400)
- Color: Muted Foreground `#6B6B6B`
- Line Height: 1.5

**User Name:**
- Size: 14sp
- Weight: Semibold (500)
- Color: Primary `#673AB7`
- Line Height: 1.4

**Button Text:**
- Size: 14sp
- Weight: Medium (500)
- Color: White
- Line Height: 1.4

**Grid Item Label:**
- Size: 12sp (mobile), 14sp (tablet)
- Weight: Medium (500)
- Color: Foreground 90% opacity
- Line Height: 1.4

**Footer Text:**
- Size: 12sp (mobile), 14sp (tablet)
- Weight: Regular (400)
- Color: Muted Foreground `#6B6B6B`
- Line Height: 1.5

---

## 10. Interactive States

### Hover States

**Grid Items:**
- Background: `#F5F3F9` (Muted)
- Icon Color: Primary `#673AB7`
- Transition: 200ms ease

**Buttons:**
- Shadow: Increases elevation
- Background: Darker gradient
- Scale: None (no scale transform)

**Links:**
- Color: Primary `#673AB7`
- Underline: Maintained

**Profile Avatar:**
- Opacity: 80%
- Scale: None

### Focus States

**Buttons:**
- Outline: 2dp ring, Primary color
- Offset: 2dp
- Border Radius: Matches button

**Grid Items:**
- Outline: 2dp ring, Primary color
- Offset: 2dp

### Active/Pressed States

**Buttons:**
- Shadow: Decreases slightly
- Background: Slightly darker
- No scale transform

**Grid Items:**
- Background: Slightly darker muted
- No scale transform

### Disabled States

**Coming Soon Items:**
- Opacity: 50%
- Cursor: Not allowed
- No hover effect
- Not clickable

---

## 11. Responsive Behavior

### Mobile (< 640px)

**Logo:**
- Icon: 64dp
- Text: 36sp
- Tagline: 14sp

**Buttons:**
- Width: 128dp
- Height: 48dp

**Grid:**
- Columns: 3
- Gap: 8dp
- Icon Size: 40dp
- Label: 12sp

**Footer:**
- Text: 12sp
- Icons: 16dp

### Tablet (≥ 640px)

**Logo:**
- Icon: 64dp (same)
- Text: 36sp (same)
- Tagline: 14sp (same)

**Buttons:**
- Width: 144dp
- Height: 48dp (same)

**Grid:**
- Columns: 3 (same)
- Gap: 16dp
- Icon Size: 48dp
- Label: 14sp

**Footer:**
- Text: 14sp
- Icons: 20dp

### Desktop (≥ 1024px)

**Same as tablet, but:**
- Max content width: 448dp (grid)
- Container padding: 24dp

---

## 12. Grid Menu Items

### Customer Items (8 items)

1. **Order Status**
   - Icon: Package
   - Label: "Order Status"
   - Href: `/order-status`

2. **Create Order**
   - Icon: FileText
   - Label: "Create Order"
   - Href: `/create-order`

3. **Service Rates**
   - Icon: PesoCoinIcon (custom)
   - Label: "Service Rates"
   - Href: `/service-rates`

4. **Download App**
   - Icon: Download
   - Label: "Download App"
   - Href: `/download-app`

5. **About Us**
   - Icon: Users
   - Label: "About Us"
   - Href: `/about-us`

6. **FAQs**
   - Icon: HelpCircle
   - Label: "FAQs"
   - Href: `/faqs`

7. **Branches**
   - Icon: MapPin
   - Label: "Branches"
   - Href: `/branches`

8. **Contact Us**
   - Icon: Phone
   - Label: "Contact Us"
   - Href: `/contact-us`

**Note:** This is a customer-focused app. Only customer items are shown on the homepage.

---

## 13. Loading States

### Initial Load

**While Checking Auth:**
- Profile/Auth section: Hidden (null)
- Grid Menu: Shows (with loading items if needed)
- Logo: Shows immediately

**Loading Indicator:**
- If needed, show spinner in center
- Color: Primary `#673AB7`
- Size: 32dp x 32dp

---

## 14. Android Implementation

### Layout Structure (XML)

```xml
<androidx.constraintlayout.widget.ConstraintLayout
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/background">

    <!-- Header -->
    <com.google.android.material.appbar.AppBarLayout
        android:id="@+id/appBar"
        android:layout_width="match_parent"
        android:layout_height="64dp"
        app:layout_constraintTop_toTopOf="parent"
        android:background="@color/background"
        android:elevation="4dp">

        <!-- Logo + Text + Tagline (Always visible on homepage) -->
        <LinearLayout
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:gravity="center_vertical"
            android:padding="16dp"
            android:layout_gravity="start">

            <ImageView
                android:layout_width="32dp"
                android:layout_height="32dp"
                android:src="@drawable/ic_washing_machine"
                android:tint="@color/primary" />

            <LinearLayout
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:orientation="vertical"
                android:layout_marginStart="8dp">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="RKR Laundry"
                    android:textSize="18sp"
                    android:textStyle="bold"
                    android:textColor="@color/primary"
                    android:lineSpacingExtra="0dp" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Fast. Clean. Convenient."
                    android:textSize="12sp"
                    android:textColor="@color/muted_foreground"
                    android:layout_marginTop="4dp"
                    android:lineSpacingExtra="0dp" />
            </LinearLayout>
        </LinearLayout>
    </com.google.android.material.appbar.AppBarLayout>

    <!-- Main Content -->
    <androidx.core.widget.NestedScrollView
        android:layout_width="match_parent"
        android:layout_height="0dp"
        app:layout_constraintTop_toBottomOf="@id/appBar"
        app:layout_constraintBottom_toTopOf="@id/footer">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:gravity="center"
            android:padding="16dp">

            <!-- Logo Section -->
            <LinearLayout
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:orientation="vertical"
                android:gravity="center"
                android:layout_marginBottom="16dp">

                <LinearLayout
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:orientation="horizontal"
                    android:gravity="center_vertical"
                    android:layout_marginBottom="8dp">

                    <ImageView
                        android:layout_width="64dp"
                        android:layout_height="64dp"
                        android:src="@drawable/ic_washing_machine"
                        android:tint="@color/primary" />

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="RKR Laundry"
                        android:textSize="36sp"
                        android:textStyle="bold"
                        android:textColor="@color/primary"
                        android:layout_marginStart="12dp" />
                </LinearLayout>

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Fast. Clean. Convenient."
                    android:textSize="14sp"
                    android:textColor="@color/muted_foreground" />
            </LinearLayout>

            <!-- Profile/Auth Section -->
            <LinearLayout
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:orientation="horizontal"
                android:gravity="center"
                android:minHeight="96dp"
                android:layout_marginBottom="16dp">

                <!-- Profile Button OR Login/Register Buttons -->
            </LinearLayout>

            <!-- Grid Menu - CRITICAL: Must be 3 columns, labels must show full text -->
            <androidx.recyclerview.widget.RecyclerView
                android:id="@+id/gridMenu"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:maxWidth="448dp"
                app:layoutManager="androidx.recyclerview.widget.GridLayoutManager"
                app:spanCount="3" /> <!-- CRITICAL: 3 columns, NOT 4 -->
        </LinearLayout>
    </androidx.core.widget.NestedScrollView>

    <!-- Footer -->
    <com.google.android.material.appbar.AppBarLayout
        android:id="@+id/footer"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        app:layout_constraintBottom_toBottomOf="parent">
        <!-- Footer content -->
    </com.google.android.material.appbar.AppBarLayout>

</androidx.constraintlayout.widget.ConstraintLayout>
```

### Compose Implementation

```kotlin
@Composable
fun HomePage(
    viewModel: HomeViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFEDE7F6))
    ) {
        // Header
        AppHeader(
            showPromoBanner = uiState.showPromoBanner,
            promo = uiState.promo
        )
        
        // Main Content
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(top = 64.dp, bottom = 80.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.Center)
                    .padding(horizontal = 16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Logo Section
                LogoSection()
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Profile/Auth Section
                if (uiState.isLoggedIn) {
                    ProfileButton(
                        userName = uiState.userName,
                        userInitial = uiState.userInitial,
                        onProfileClick = { /* Navigate to profile */ },
                        onMyOrdersClick = { /* Navigate to orders */ },
                        onLogoutClick = { viewModel.logout() }
                    )
                } else {
                    // CRITICAL: Login button MUST be BLUE gradient, Register MUST be YELLOW gradient
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Login Button - BLUE gradient
                        Button(
                            onClick = { /* Navigate to login */ },
                            modifier = Modifier
                                .height(48.dp)
                                .width(128.dp),
                            shape = RoundedCornerShape(999.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color.Transparent // Use gradient brush instead
                            ),
                            contentPadding = PaddingValues(0.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .background(
                                        brush = Brush.horizontalGradient(
                                            colors = listOf(
                                                Color(0xFF3B82F6), // blue-500
                                                Color(0xFF2563EB)  // blue-600
                                            )
                                        ),
                                        shape = RoundedCornerShape(999.dp)
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(
                                    horizontalArrangement = Arrangement.Center,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.ArrowForward,
                                        contentDescription = null,
                                        tint = Color.White,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Log in", // CRITICAL: Two words with space
                                        color = Color.White,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }
                        
                        // Register Button - YELLOW gradient
                        Button(
                            onClick = { /* Navigate to register */ },
                            modifier = Modifier
                                .height(48.dp)
                                .width(128.dp),
                            shape = RoundedCornerShape(999.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color.Transparent // Use gradient brush instead
                            ),
                            contentPadding = PaddingValues(0.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .background(
                                        brush = Brush.horizontalGradient(
                                            colors = listOf(
                                                Color(0xFFFACC15), // yellow-400
                                                Color(0xFFEAB308)  // yellow-500
                                            )
                                        ),
                                        shape = RoundedCornerShape(999.dp)
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(
                                    horizontalArrangement = Arrangement.Center,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.PersonAdd,
                                        contentDescription = null,
                                        tint = Color.White,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Register", // CRITICAL: Exact text
                                        color = Color.White,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Grid Menu
                GridMenu(
                    items = uiState.gridItems,
                    modifier = Modifier.fillMaxWidth(0.9f)
                )
            }
        }
        
        // Footer
        AppFooter()
    }
}
```

### Grid Item XML Layout (Alternative Implementation)

```xml
<!-- Grid Item Layout - CRITICAL: Label must show full text -->
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="96dp"
    android:orientation="vertical"
    android:gravity="center"
    android:padding="8dp"
    android:background="@android:color/transparent"
    android:clickable="true"
    android:focusable="true">

    <!-- Icon -->
    <ImageView
        android:layout_width="40dp"
        android:layout_height="40dp"
        android:src="@drawable/ic_grid_item_icon"
        android:tint="#2A2530"
        android:alpha="0.8"
        android:layout_marginBottom="4dp" />

    <!-- Label - CRITICAL: Must show full text, allow 2 lines -->
    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Order Status"
        android:textSize="12sp"
        android:textStyle="bold"
        android:textColor="#2A2530"
        android:textColorAlpha="0.9"
        android:gravity="center"
        android:maxLines="2"
        android:ellipsize="none"
        android:lineSpacingExtra="2dp"
        android:paddingTop="4dp" />
</LinearLayout>
```

### Grid Item Composable

```kotlin
@Composable
fun GridMenuItem(
    item: GridMenuItem,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    // No Card - just a clickable container with transparent background
    Box(
        modifier = modifier
            .height(96.dp)
            .fillMaxWidth()
            .clickable(enabled = !item.comingSoon) { onClick() }
            .background(
                color = if (item.comingSoon) Color.Transparent else Color.Transparent,
                shape = RoundedCornerShape(8.dp)
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Top
        ) {
            // Notification Badge (if applicable)
            if (item.showNotificationBadge) {
                Box(
                    modifier = Modifier
                        .align(Alignment.End)
                        .offset(x = 4.dp, y = (-4).dp)
                ) {
                    NotificationBadge(count = item.notificationCount)
                }
            }
            
            // Coming Soon Badge
            if (item.comingSoon) {
                Badge(
                    modifier = Modifier.offset(y = (-8).dp),
                    backgroundColor = Color(0xFFD1C4E9)
                ) {
                    Text("Soon", fontSize = 12.sp)
                }
            }
            
            Spacer(modifier = Modifier.height(4.dp))
            
            // Icon
            Icon(
                imageVector = item.icon,
                contentDescription = item.label,
                modifier = Modifier.size(40.dp),
                tint = if (item.comingSoon) 
                    Color(0xFF2A2530).copy(alpha = 0.5f)
                else 
                    Color(0xFF2A2530).copy(alpha = 0.8f)
            )
            
            Spacer(modifier = Modifier.weight(1f))
            
            // Label - CRITICAL: Must show full text, allow 2 lines, NO truncation
            Text(
                text = item.label,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = if (item.comingSoon)
                    Color(0xFF2A2530).copy(alpha = 0.5f)
                else
                    Color(0xFF2A2530).copy(alpha = 0.9f), // Dark gray/black at 90% opacity
                textAlign = TextAlign.Center,
                maxLines = 2, // CRITICAL: Allow 2 lines to prevent truncation
                overflow = TextOverflow.Visible, // Show full text, don't truncate
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

// Hover effect (for desktop/web)
@Composable
fun GridMenuItemWithHover(
    item: GridMenuItem,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    var isHovered by remember { mutableStateOf(false) }
    
    Box(
        modifier = modifier
            .height(96.dp)
            .fillMaxWidth()
            .clickable(enabled = !item.comingSoon) { onClick() }
            .background(
                color = if (isHovered && !item.comingSoon) 
                    Color(0xFFF5F3F9) 
                else 
                    Color.Transparent,
                shape = RoundedCornerShape(8.dp)
            )
            .onPointerEvent(PointerEventType.Enter) { isHovered = true }
            .onPointerEvent(PointerEventType.Exit) { isHovered = false }
    ) {
        // Same content as above
    }
}
```

---

## 15. Animations

### Transitions

**Page Load:**
- Fade in: 300ms
- Stagger: Grid items fade in with 50ms delay between items

**Button Press:**
- Scale: None
- Shadow: Decrease on press, increase on release
- Duration: 150ms

**Grid Item Hover:**
- Background: Fade in, 200ms
- Icon Color: Transition, 200ms

**Profile Dropdown:**
- Slide down: 200ms
- Fade in: 200ms

---

## 16. Accessibility

### Screen Reader Support

**Logo:**
- Content Description: "RKR Laundry logo"

**Buttons:**
- Content Description: Button text + action
- Example: "Log in button"

**Grid Items:**
- Content Description: "{Label} button, navigate to {feature}"
- Example: "Order Status button, navigate to order status page"

**Profile Avatar:**
- Content Description: "Profile menu for {user name}"

### Touch Targets

**Minimum Size:**
- All interactive elements: 48dp x 48dp minimum
- Grid items: 96dp height (meets requirement)
- Buttons: 48dp height (meets requirement)
- Profile avatar: 56dp (meets requirement)

### Focus Indicators

**Visible Focus:**
- All interactive elements show focus ring
- Color: Primary `#673AB7`
- Width: 2dp
- Offset: 2dp

---

## 17. Design Specifications Summary

### Key Measurements

- **Header Height:** 64dp (standard), Auto (with promo)
- **Footer Height:** 56dp
- **Logo Icon:** 64dp x 64dp
- **Profile Avatar:** 56dp x 56dp
- **Auth Buttons:** 48dp height, 128-144dp width
- **Grid Items:** 96dp height
- **Grid Icons:** 40dp (mobile), 48dp (tablet)
- **Grid Gap:** 8dp (mobile), 16dp (tablet)
- **Container Padding:** 16dp (mobile), 24dp (tablet)

### Key Colors

- **Background:** `#EDE7F6`
- **Primary:** `#673AB7`
- **Text:** `#2A2530`
- **Muted Text:** `#6B6B6B`
- **Login Button:** Blue gradient
- **Register Button:** Yellow gradient
- **Profile Avatar:** `#2563EB`

### Key Typography

- **Logo:** 36sp, Bold
- **Tagline:** 14sp, Regular
- **Button Text:** 14sp, Medium
- **Grid Label:** 12-14sp, Medium
- **Footer:** 12-14sp, Regular

---

This document provides complete design specifications for implementing the homepage in Android, matching the web app's design exactly.
