# Reimbursement Feature Implementation

## Overview
This document describes the reimbursement feature that allows personal expenses (Racky, Karaya, Richard) to be reimbursed and transferred to RKR (business expenses).

## Database Changes

### Migration File
`src/docs/add-reimbursement-feature.sql`

**New Columns Added:**
- `reimbursement_status` (TEXT): `'pending'`, `'reimbursed'`, or `NULL` (for RKR expenses)
- `reimbursed_at` (TIMESTAMP): When the expense was reimbursed
- `reimbursed_by` (UUID): User ID who processed the reimbursement

**Index Created:**
- `idx_expenses_reimbursement_status` for efficient filtering

## API Functions

### Updated Functions
- `addExpense()`: Automatically sets `reimbursement_status = 'pending'` for personal expenses, `NULL` for RKR

### New Functions
- `reimburseExpense(expenseId, userId)`: Reimburses a single expense
- `bulkReimburseExpenses(expenseIds[], userId)`: Reimburses multiple expenses at once
- `getPendingReimbursements()`: Returns summary of pending reimbursements per person

## UI Features

### Expenses Tracker Component

#### 1. Pending Reimbursements Summary Card
- Shows pending amounts for Racky, Karaya, and Richard
- Displays total pending amount
- Bulk reimburse button (when expenses are selected)

#### 2. Enhanced Expense Summary Card
- Shows all expenses including reimbursed
- Displays reimbursed total separately
- Maintains per-person totals

#### 3. Filter Dropdown
- **All Expenses**: Shows everything
- **Pending Reimbursements**: Only pending personal expenses
- **Reimbursed**: Only reimbursed expenses
- **Business Expenses (RKR)**: Only RKR expenses (not reimbursed)

#### 4. Status Badges
- **Pending**: Orange badge with clock icon
- **Reimbursed**: Green badge with checkmark icon
- **Business**: Gray badge for RKR expenses

#### 5. Reimburse Button
- Appears on pending expenses only
- Opens confirmation dialog
- Shows expense details before confirming

#### 6. Bulk Reimburse
- Checkbox column when filter is "Pending Reimbursements"
- Select all checkbox in header
- Bulk reimburse button in pending summary card
- Processes multiple expenses at once

#### 7. Enhanced Table
- Color-coded rows (orange for pending, green for reimbursed)
- Status column with badges
- Tooltips showing reimbursement date
- Selection checkboxes for bulk operations

## Workflow

### Creating an Expense
1. Admin creates expense with `expense_for = 'Racky'/'Karaya'/'Richard'`
2. System automatically sets `reimbursement_status = 'pending'`
3. Expense appears in table with "Pending" badge

### Reimbursing an Expense
1. Admin clicks "Reimburse" button on pending expense
2. Confirmation dialog appears
3. Admin confirms
4. System updates:
   - `expense_for` → `'RKR'`
   - `reimbursement_status` → `'reimbursed'`
   - `reimbursed_at` → current timestamp
   - `reimbursed_by` → current user ID
5. Expense now shows as "Reimbursed" and counted as RKR

### Bulk Reimbursement
1. Admin filters to "Pending Reimbursements"
2. Selects multiple expenses using checkboxes
3. Clicks "Reimburse Selected" button
4. All selected expenses are reimbursed at once

## Finance Calculations

### Pending Reimbursements
- Sum of all expenses where `reimbursement_status = 'pending'`
- Shown separately in pending summary card
- Not counted as business expenses yet

### Reimbursed Expenses
- Sum of all expenses where `reimbursement_status = 'reimbursed'`
- Now counted as RKR expenses
- Shown in expense summary as "Reimbursed" total

### Business Expenses (RKR)
- Expenses where `expense_for = 'RKR'` OR `reimbursement_status = 'reimbursed'`
- Both are counted as business expenses

## Usage Instructions

### To Reimburse a Single Expense:
1. Navigate to Admin → Expenses
2. Find the pending expense
3. Click the green checkmark button (Reimburse)
4. Confirm in the dialog

### To Bulk Reimburse:
1. Navigate to Admin → Expenses
2. Select "Pending Reimbursements" from filter
3. Check the boxes for expenses to reimburse
4. Click "Reimburse Selected" button in the pending summary card
5. Confirm the action

### To View Reimbursement Status:
- Use the filter dropdown to view:
  - All expenses
  - Only pending reimbursements
  - Only reimbursed expenses
  - Only business expenses (RKR)

## Notes

- RKR expenses automatically have `reimbursement_status = NULL` (not applicable)
- Personal expenses default to `reimbursement_status = 'pending'`
- Once reimbursed, expenses cannot be "un-reimbursed" (would require manual database update)
- Reimbursed expenses maintain audit trail with timestamp and user ID

