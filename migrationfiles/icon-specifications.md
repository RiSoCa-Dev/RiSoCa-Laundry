# Icon Specifications for RKR Laundry Android App

Complete icon specifications for all icons used in the homepage and throughout the customer-facing Android app, including sizes, colors, styles, and implementation details.

---

## 📋 Table of Contents

1. [Logo Icon](#1-logo-icon)
2. [Grid Menu Icons](#2-grid-menu-icons)
3. [Authentication Button Icons](#3-authentication-button-icons)
4. [Profile Menu Icons](#4-profile-menu-icons)
5. [Icon Sourcing and Creation](#5-icon-sourcing-and-creation)
6. [Android Implementation](#6-android-implementation)
7. [Icon File Naming Convention](#7-icon-file-naming-convention)

---

## 1. Logo Icon

### Washing Machine Icon

**Purpose:** Main logo icon displayed in the header and centered logo section

**Design Requirements:**
- **Style:** Outlined or filled (prefer outlined for cleaner look)
- **Concept:** Washing machine drum or circular laundry symbol
- **Visual:** Circular outline with inner circle, resembling a washing machine drum or target
- **Color:** Primary purple `#673AB7` (dark purple)
- **Size:** 
  - Header: 32dp x 32dp (mobile), 40dp x 40dp (tablet)
  - Centered Logo: 64dp x 64dp (mobile), 80dp x 80dp (tablet)

**Material Design Equivalent:**
- No direct equivalent - **CUSTOM ICON REQUIRED**
- Alternative placeholder: `LocalLaundryService` (but custom is preferred)

**Android Resource:**
- File: `res/drawable/ic_washing_machine.xml` (vector drawable)
- File: `res/drawable/ic_washing_machine_24dp.xml` (24dp version)
- File: `res/drawable/ic_washing_machine_64dp.xml` (64dp version)

**Implementation Notes:**
- Must be scalable vector drawable (SVG converted to XML)
- Should work at all sizes without pixelation
- Tint color should be applied via `android:tint` attribute

---

## 2. Grid Menu Icons

All grid menu icons share these common specifications:
- **Size:** 40dp x 40dp (mobile), 48dp x 48dp (tablet)
- **Color:** Dark gray/black `#2A2530` at 80% opacity (default), `#673AB7` (hover/active)
- **Style:** Outlined (preferred) or filled
- **Stroke Width:** 1.5dp (if outlined)

### 2.1 Order Status Icon

**Icon:** Package / Box / PackageIcon

**Description:** Represents order tracking and status checking

**Material Design Icon:**
- `android.R.drawable.ic_menu_view` (not ideal)
- **Use:** Material Icons `package` or `inventory_2`
- **Alternative:** `local_shipping` or `assignment`

**Android Resource:**
- File: `res/drawable/ic_package.xml`
- Material Icons name: `ic_package` or `ic_inventory_2`

**Visual:** Box/package with lines or a shipping box icon

---

### 2.2 Create Order Icon

**Icon:** FileText / Document / FileEdit

**Description:** Represents creating a new order or form filling

**Material Design Icon:**
- Material Icons `description` or `edit_document`
- **Alternative:** `note_add` or `create`

**Android Resource:**
- File: `res/drawable/ic_file_text.xml`
- Material Icons name: `ic_description` or `ic_edit_document`

**Visual:** Document with text lines or a form icon

---

### 2.3 Service Rates Icon

**Icon:** PesoCoinIcon (CUSTOM) / DollarSign / Currency

**Description:** Represents pricing, rates, and currency

**Material Design Icon:**
- Material Icons `attach_money` or `payments`
- **Alternative:** `currency_exchange` or `monetization_on`
- **Note:** This is a CUSTOM icon in the web app - you may need to create a peso coin icon or use a generic currency icon

**Android Resource:**
- File: `res/drawable/ic_peso_coin.xml` (custom)
- OR File: `res/drawable/ic_attach_money.xml` (Material Icons fallback)

**Visual:** 
- Custom: Peso coin symbol (₱) or coin with peso sign
- Fallback: Dollar sign ($) or payment icon

**Special Note:** If creating custom peso coin icon:
- Circular coin shape
- Letter "P" or peso symbol "₱" in center
- Outlined style preferred

**Web App Implementation Reference:**
The web app uses a custom React component `PesoCoinIcon` that loads an image from:
- Source: `https://cdn-icons-png.flaticon.com/512/32/32724.png`
- This is a peso coin icon from Flaticon
- **Recommendation for Android:**
  1. Download the PNG image from the URL above
  2. Convert to vector drawable using Android Studio Vector Asset Studio
  3. OR use Material Icon `monetization_on` or `attach_money` as a simpler alternative
  4. OR create a custom vector drawable with peso symbol "₱" in a circle

---

### 2.4 Download App Icon

**Icon:** Download / DownloadCloud

**Description:** Represents downloading the mobile app

**Material Design Icon:**
- Material Icons `download` or `get_app`
- **Alternative:** `file_download` or `cloud_download`

**Android Resource:**
- File: `res/drawable/ic_download.xml`
- Material Icons name: `ic_download` or `ic_get_app`

**Visual:** Downward arrow or download cloud icon

---

### 2.5 About Us Icon

**Icon:** Users / People / UserGroup

**Description:** Represents company information and team

**Material Design Icon:**
- Material Icons `people` or `groups`
- **Alternative:** `account_circle` or `person`

**Android Resource:**
- File: `res/drawable/ic_users.xml`
- Material Icons name: `ic_people` or `ic_groups`

**Visual:** Multiple people/users icon or group icon

---

### 2.6 FAQs Icon

**Icon:** HelpCircle / Help / QuestionMark

**Description:** Represents frequently asked questions and help

**Material Design Icon:**
- Material Icons `help_outline` or `help`
- **Alternative:** `quiz` or `contact_support`

**Android Resource:**
- File: `res/drawable/ic_help_circle.xml`
- Material Icons name: `ic_help_outline` or `ic_help`

**Visual:** Circle with question mark or help icon

---

### 2.7 Branches Icon

**Icon:** MapPin / Location / Place

**Description:** Represents branch locations and maps

**Material Design Icon:**
- Material Icons `place` or `location_on`
- **Alternative:** `pin_drop` or `map`

**Android Resource:**
- File: `res/drawable/ic_map_pin.xml`
- Material Icons name: `ic_place` or `ic_location_on`

**Visual:** Map pin or location marker icon

---

### 2.8 Contact Us Icon

**Icon:** Phone / PhoneCall

**Description:** Represents contact information and communication

**Material Design Icon:**
- Material Icons `phone` or `call`
- **Alternative:** `contact_phone` or `phone_enabled`

**Android Resource:**
- File: `res/drawable/ic_phone.xml`
- Material Icons name: `ic_phone` or `ic_call`

**Visual:** Phone handset or phone call icon

---

## 3. Authentication Button Icons

### 3.1 Login Button Icon

**Icon:** ArrowRight / ArrowForward / Login

**Description:** Arrow pointing right, indicating forward action or login

**Material Design Icon:**
- Material Icons `arrow_forward` or `arrow_right_alt`
- **Alternative:** `login` or `keyboard_arrow_right`

**Size:** 16dp x 16dp
**Color:** White `#FFFFFF` (on blue gradient background)
**Position:** Left side of button text, 8dp margin from text

**Android Resource:**
- File: `res/drawable/ic_arrow_right.xml`
- Material Icons name: `ic_arrow_forward`

**Visual:** Right-pointing arrow (→)

---

### 3.2 Register Button Icon

**Icon:** UserPlus / PersonAdd / AddUser

**Description:** User with plus sign, indicating adding/creating new account

**Material Design Icon:**
- Material Icons `person_add` or `add_circle_outline`
- **Alternative:** `person_add_alt_1` or `how_to_reg`

**Size:** 16dp x 16dp
**Color:** White `#FFFFFF` (on yellow gradient background)
**Position:** Left side of button text, 8dp margin from text

**Android Resource:**
- File: `res/drawable/ic_user_plus.xml`
- Material Icons name: `ic_person_add`

**Visual:** Person/user icon with plus sign

---

## 4. Profile Menu Icons

These icons appear in the profile dropdown menu when user is logged in.

**Common Specifications:**
- **Size:** 16dp x 16dp
- **Color:** Foreground color (varies by context)
- **Style:** Outlined

### 4.1 Profile Icon

**Icon:** User / Person / AccountCircle

**Material Design Icon:**
- Material Icons `person` or `account_circle`
- **Alternative:** `person_outline`

**Android Resource:**
- File: `res/drawable/ic_user.xml`
- Material Icons name: `ic_person`

**Visual:** Person/user silhouette

---

### 4.2 My Orders Icon

**Icon:** ShoppingBag / ShoppingCart / ShoppingBasket

**Material Design Icon:**
- Material Icons `shopping_bag` or `shopping_cart`
- **Alternative:** `local_mall` or `shopping_basket`

**Android Resource:**
- File: `res/drawable/ic_shopping_bag.xml`
- Material Icons name: `ic_shopping_bag`

**Visual:** Shopping bag or cart icon

---

### 4.3 Log Out Icon

**Icon:** LogOut / Exit / SignOut

**Material Design Icon:**
- Material Icons `logout` or `exit_to_app`
- **Alternative:** `power_settings_new` or `close`

**Size:** 16dp x 16dp
**Color:** Destructive red `#F44336` (for logout action)

**Android Resource:**
- File: `res/drawable/ic_logout.xml`
- Material Icons name: `ic_logout` or `ic_exit_to_app`

**Visual:** Exit arrow or logout symbol

---

## 5. Icon Sourcing and Creation

### 5.1 Material Design Icons (Recommended)

**Source:** [Material Design Icons](https://fonts.google.com/icons)

**How to Use:**
1. Visit https://fonts.google.com/icons
2. Search for the icon name (e.g., "package", "phone", "people")
3. Select the icon
4. Choose style: "Outlined" (preferred) or "Filled"
5. Download as SVG
6. Convert SVG to Android Vector Drawable XML

**Material Icons Library:**
- Add dependency: `implementation 'androidx.compose.material:material-icons-extended:1.x.x'`
- Or use Material Icons font in XML

---

### 5.2 Custom Icons (Washing Machine, Peso Coin)

**Washing Machine Icon:**
- **Option 1:** Use Material Icon `local_laundry_service` as placeholder
- **Option 2:** Create custom SVG:
  - Design: Circular outline (outer circle)
  - Inner circle (representing drum)
  - Optional: Small dots or lines inside (representing clothes)
  - Style: Outlined, 2dp stroke
  - Export as SVG, convert to vector drawable

**Peso Coin Icon:**
- **Option 1:** Use Material Icon `attach_money` or `payments` as fallback
- **Option 2:** Create custom SVG:
  - Design: Circular coin shape
  - Letter "P" or peso symbol "₱" in center
  - Optional: Border/outline around coin
  - Style: Outlined or filled
  - Export as SVG, convert to vector drawable

**Tools for Custom Icons:**
- Figma (design)
- Adobe Illustrator (design)
- Inkscape (free SVG editor)
- Android Studio Vector Asset Studio (create from scratch)

---

### 5.3 SVG to Vector Drawable Conversion

**Method 1: Android Studio**
1. Right-click `res/drawable` folder
2. New → Vector Asset
3. Choose "Local file (SVG, PSD)"
4. Select your SVG file
5. Adjust size if needed
6. Click "Next" → "Finish"

**Method 2: Online Converter**
- Use: https://inloop.github.io/svg2android/
- Upload SVG file
- Download generated XML
- Place in `res/drawable/` folder

**Method 3: Manual Conversion**
- Open SVG in text editor
- Convert SVG paths to Android vector drawable format
- Use `<path>` elements with `android:pathData` attribute

---

## 6. Android Implementation

### 6.1 Vector Drawable Structure

**Basic Template:**
```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="@android:color/black"
        android:pathData="M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10 10,-4.48 10,-10S17.52,2 12,2z"/>
</vector>
```

**With Tint Support:**
```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:aapt="http://schemas.android.com/aapt"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="@android:color/black"
        android:pathData="..."/>
</vector>
```

---

### 6.2 Using Icons in XML Layouts

**ImageView with Icon:**
```xml
<ImageView
    android:layout_width="40dp"
    android:layout_height="40dp"
    android:src="@drawable/ic_package"
    android:tint="#2A2530"
    android:alpha="0.8" />
```

**Button with Icon:**
```xml
<Button
    android:layout_width="128dp"
    android:layout_height="48dp"
    android:text="Log in"
    android:drawableStart="@drawable/ic_arrow_right"
    android:drawablePadding="8dp"
    android:drawableTint="@android:color/white" />
```

---

### 6.3 Using Icons in Jetpack Compose

**Basic Icon:**
```kotlin
Icon(
    imageVector = Icons.Default.Package,
    contentDescription = "Order Status",
    modifier = Modifier.size(40.dp),
    tint = Color(0xFF2A2530).copy(alpha = 0.8f)
)
```

**Custom Vector Drawable:**
```kotlin
Icon(
    painter = painterResource(id = R.drawable.ic_package),
    contentDescription = "Order Status",
    modifier = Modifier.size(40.dp),
    tint = Color(0xFF2A2530).copy(alpha = 0.8f)
)
```

**Button with Icon:**
```kotlin
Button(
    onClick = { /* Navigate to login */ },
    colors = ButtonDefaults.buttonColors(
        containerColor = Color.Transparent
    )
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
        Text("Log in", color = Color.White)
    }
}
```

---

### 6.4 Icon Color Application

**Dynamic Tinting:**
```kotlin
// In Compose
val iconColor = if (isSelected) 
    Color(0xFF673AB7) // Primary purple
else 
    Color(0xFF2A2530).copy(alpha = 0.8f) // Dark gray

Icon(
    imageVector = icon,
    tint = iconColor,
    modifier = Modifier.size(40.dp)
)
```

**Color State List (XML):**
```xml
<!-- res/color/icon_color_selector.xml -->
<selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:color="#673AB7" android:state_selected="true"/>
    <item android:color="#2A2530" android:alpha="0.8"/>
</selector>
```

---

## 7. Icon File Naming Convention

### 7.1 Naming Rules

**Format:** `ic_[icon_name]_[size]dp.xml`

**Examples:**
- `ic_washing_machine.xml` (default 24dp)
- `ic_washing_machine_32dp.xml` (32dp version)
- `ic_washing_machine_64dp.xml` (64dp version)
- `ic_package.xml` (grid menu icon, 40dp)
- `ic_arrow_right.xml` (button icon, 16dp)
- `ic_user.xml` (profile menu icon, 16dp)

**Size Suffixes:**
- Default: No suffix (assumed 24dp)
- Specific sizes: `_16dp`, `_32dp`, `_40dp`, `_48dp`, `_64dp`

---

### 7.2 Complete File List

**Logo Icons:**
- `ic_washing_machine.xml` (24dp default)
- `ic_washing_machine_32dp.xml` (header)
- `ic_washing_machine_64dp.xml` (centered logo)

**Grid Menu Icons (40dp):**
- `ic_package.xml` (Order Status)
- `ic_file_text.xml` (Create Order)
- `ic_peso_coin.xml` (Service Rates) - OR `ic_attach_money.xml`
- `ic_download.xml` (Download App)
- `ic_users.xml` (About Us)
- `ic_help_circle.xml` (FAQs)
- `ic_map_pin.xml` (Branches)
- `ic_phone.xml` (Contact Us)

**Button Icons (16dp):**
- `ic_arrow_right.xml` (Login button)
- `ic_user_plus.xml` (Register button)

**Profile Menu Icons (16dp):**
- `ic_user.xml` (Profile)
- `ic_shopping_bag.xml` (My Orders)
- `ic_logout.xml` (Log Out)

---

## 8. Quick Reference Checklist

### ✅ Icon Requirements Checklist

- [ ] Logo icon (washing machine) - custom or Material `local_laundry_service`
- [ ] 8 grid menu icons (all Material Icons available)
- [ ] 2 authentication button icons (Material Icons available)
- [ ] 3 profile menu icons (Material Icons available)
- [ ] All icons converted to Android Vector Drawable XML format
- [ ] Icons placed in `res/drawable/` folder
- [ ] Proper naming convention followed
- [ ] Tint colors configured correctly
- [ ] Sizes match specifications (40dp grid, 16dp buttons, 64dp logo)
- [ ] Custom icons (washing machine, peso coin) created or alternatives chosen

---

## 9. Material Icons Quick Reference

**Grid Menu Icons:**
1. `package` → `ic_package.xml`
2. `description` → `ic_file_text.xml`
3. `attach_money` → `ic_peso_coin.xml` (or custom)
4. `download` → `ic_download.xml`
5. `people` → `ic_users.xml`
6. `help_outline` → `ic_help_circle.xml`
7. `place` → `ic_map_pin.xml`
8. `phone` → `ic_phone.xml`

**Button Icons:**
- `arrow_forward` → `ic_arrow_right.xml`
- `person_add` → `ic_user_plus.xml`

**Profile Menu Icons:**
- `person` → `ic_user.xml`
- `shopping_bag` → `ic_shopping_bag.xml`
- `logout` → `ic_logout.xml`

---

## 10. Implementation Priority

### Phase 1: Essential Icons (Must Have)
1. Logo icon (washing machine) - **HIGH PRIORITY**
2. Grid menu icons (8 icons) - **HIGH PRIORITY**
3. Authentication button icons (2 icons) - **HIGH PRIORITY**

### Phase 2: Secondary Icons
4. Profile menu icons (3 icons) - **MEDIUM PRIORITY**

### Phase 3: Custom Icons (Can Use Alternatives)
5. Custom peso coin icon (can use `attach_money` as fallback)
6. Custom washing machine icon (can use `local_laundry_service` as fallback)

---

## 11. Testing Icons

**Visual Testing:**
- [ ] All icons display correctly at specified sizes
- [ ] Icons maintain clarity at different screen densities (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- [ ] Tint colors apply correctly
- [ ] Icons are properly aligned in layouts
- [ ] Icons scale correctly on tablets (larger sizes)

**Accessibility:**
- [ ] All icons have `contentDescription` attributes
- [ ] Icons are readable by screen readers
- [ ] Color contrast meets accessibility standards

---

**End of Icon Specifications Document**
