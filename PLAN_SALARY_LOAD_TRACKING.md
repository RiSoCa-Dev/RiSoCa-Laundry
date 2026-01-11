# Plan: Make Loads Editable in Daily Salary Calculation

## Overview
Remove Load Details dialog from orders dashboard. Make loads editable directly in the Employee Salary page table. When loads are marked as "not done", they appear as separate entries in the next day's salary calculation with the same order number and customer, but can be assigned to a different employee.

## Phase 1: Remove Load Details Dialog from Orders Dashboard

### 1.1 Update `src/components/order-list.tsx`
- Remove `LoadDetailsDialog` import (line 54)
- Remove `isLoadDialogOpen` state from `OrderRow` component (line 124)
- Remove `isLoadDialogOpen` state from `OrderCard` component (line 784)
- Remove `<LoadDetailsDialog>` component instances (lines 749-754 and 1528-1533)
- Remove click handlers from load count Badge (line 480) - remove `onClick`, `onKeyDown`, `cursor-pointer`, `hover:*` classes
- Remove click handlers from load count span in OrderCard (line 1228) - remove `onClick`, `onKeyDown`, `cursor-pointer`, `hover:*` classes
- Make load count display static (no interactive styling)

## Phase 2: Database Schema Update

### 2.1 Add incomplete loads tracking to `daily_salary_payments` table
Add new JSONB column `incomplete_loads` to store load completion data per day/employee.

Structure:
```json
{
  "RKR363": {
    "loadCount": 3,
    "notDoneLoads": [1],  // Load indices (0-based) that are not done
    "nextDayEmployeeId": "emp456"  // Employee assigned for next day (optional)
  }
}
```

SQL Migration:
```sql
ALTER TABLE daily_salary_payments 
ADD COLUMN incomplete_loads JSONB DEFAULT '{}'::jsonb;
```

## Phase 3: Type System Updates

### 3.1 Update `src/components/employee-salary/types.ts`
Add incomplete loads type:
```typescript
export type IncompleteLoadData = {
  [orderId: string]: {
    loadCount: number;
    notDoneLoads: number[];  // 0-based indices
    nextDayEmployeeId?: string | null;
  };
};

export type DailyPaymentStatus = {
  [employeeId: string]: {
    is_paid: boolean;
    amount: number;
    incomplete_loads?: IncompleteLoadData;
  };
};
```

### 3.2 Update `src/components/employee-salary/fetch-data.ts`
- Update `fetchAllDailyPayments` to select `incomplete_loads` column
- Update `fetchDailyPayments` to select `incomplete_loads` column
- Map `incomplete_loads` field in return objects

## Phase 4: Make Loads Column Editable in Salary Table

### 4.1 Update `src/components/employee-salary.tsx`
- Add state for editing loads: `editingLoadsOrderId`, `editingLoadsValue`, `editingIncompleteLoads`, `savingLoads`
- In the table's Loads column (line ~622), make it editable:
  - When not editing: Show load count as text with edit icon (hover to show)
  - When editing: Show input field and checkboxes for each load (1, 2, 3...)
  - Each load has a checkbox: "Not Done" (checked = not done for this day)
  - Show employee selector for next day assignment (if any loads are marked as not done)
  - Save/Cancel buttons

### 4.2 Create Load Editing UI
In the Loads cell:
- Normal state: Display "3 loads" with edit icon (appears on hover)
- Edit state: 
  - Input field showing total loads (editable)
  - For each load (1 to N), show checkbox "Load X - Not Done"
  - If any checked, show employee selector dropdown "Assign to (next day)"
  - Save button (Check icon) and Cancel button (X icon)

### 4.3 Create save handler
- Function `handleLoadsSave(orderId, date, employeeId, loadCount, notDoneLoads, nextDayEmployeeId)`
- Save to `daily_salary_payments` table: `incomplete_loads` JSONB field
- Structure: `{ [orderId]: { loadCount, notDoneLoads, nextDayEmployeeId } }`

## Phase 5: Update Salary Calculation Logic

### 5.1 Update `src/components/employee-salary/calculate-salary.ts`
Modify `calculateEmployeeLoads` function:
- For each order, check if there's incomplete load data for this date/employee
- If incomplete loads exist, subtract not-done loads from count
- Example: Order has 3 loads, Load 2 (index 1) is not done → count 2 loads instead of 3

```typescript
// In calculateEmployeeLoads
const dateKey = format(startOfDay(new Date(order.orderDate)), 'yyyy-MM-dd');
const incompleteData = dailyPayments?.[dateKey]?.[employee.id]?.incomplete_loads?.[order.id];
if (incompleteData) {
  const completedLoads = order.load - incompleteData.notDoneLoads.length;
  // Divide by number of assigned employees if multiple
  const dividedLoad = order.assignedEmployeeIds?.length 
    ? completedLoads / order.assignedEmployeeIds.length 
    : completedLoads;
  customerLoadsForEmployee += dividedLoad;
} else {
  // Normal calculation
  // ...
}
```

## Phase 6: Display Incomplete Loads in Next Day

### 6.1 Create function to generate incomplete load entries
Create `generateIncompleteLoadEntries(orders, dailyPayments, date)` function:
- For each day, check previous day's incomplete loads
- For each incomplete load entry:
  - Create a "virtual order" object with:
    - Same order ID
    - Same customer name
    - Load count = 1 (one incomplete load)
    - Employee ID = nextDayEmployeeId (from incomplete_loads data)
    - Date = current date (next day)
  - Add to orders array for salary calculation

### 6.2 Update `src/components/employee-salary/calculate-salary.ts`
- Create `mergeIncompleteLoads` function that takes orders and dailyPayments
- For each date, look at previous day's incomplete loads
- Add incomplete loads as separate order entries for current day
- These entries should appear in the salary table as separate rows

### 6.3 Update `src/components/employee-salary.tsx`
- In `groupOrdersByDate`, after grouping orders by date, merge incomplete loads from previous day
- Display incomplete loads as separate table rows with visual distinction:
  - Same order ID and customer name
  - Load count = 1
  - Employee from nextDayEmployeeId
  - Maybe add badge "Carried Over" or "Incomplete"

## Phase 7: Update Payment Handlers

### 7.1 Create `saveIncompleteLoads` function in `src/components/employee-salary/payment-handlers.ts`
- Function signature: `saveIncompleteLoads(employeeId, date, incompleteLoads, toast, onSuccess)`
- Update `daily_salary_payments` table: UPSERT with `incomplete_loads` JSONB field
- Structure: `{ [orderId]: { loadCount, notDoneLoads, nextDayEmployeeId } }`

### 7.2 Update auto-save logic in `src/components/employee-salary/auto-save-salaries.ts`
- Preserve existing `incomplete_loads` when auto-saving salaries
- Don't overwrite incomplete loads data during auto-save

## Implementation Steps

1. **Phase 1**: Remove Load Details Dialog from orders dashboard
2. **Phase 2**: Add database column (requires SQL migration)
3. **Phase 3**: Update types and fetch functions
4. **Phase 4**: Make loads column editable in salary table
5. **Phase 5**: Update salary calculation to exclude incomplete loads
6. **Phase 6**: Display incomplete loads in next day's table
7. **Phase 7**: Create save handler for incomplete loads

## Key Implementation Details

### Inline Load Editing UI
- Loads cell shows "3 loads" normally
- On hover, edit icon appears
- Click to edit: Shows input for total loads + checkboxes for each load
- Checkbox label: "Load X - Not Done"
- If any checked, show employee dropdown: "Assign incomplete loads to: [Employee]"
- Save button only enabled if changes detected

### Incomplete Load Display
- Incomplete loads appear as separate rows in next day's table
- Row shows: Same Order ID, Same Customer, Load count = 1, New Employee, Date = next day
- Visual distinction: Badge "Carried Over" or different background color
- Salary calculation: These count as 1 load for the assigned employee

### Data Flow
1. User marks Load 2 as "not done" for Order RKR363 on Jan 10
2. Save to `daily_salary_payments[Jan 10][employeeId].incomplete_loads = { "RKR363": { loadCount: 3, notDoneLoads: [1], nextDayEmployeeId: "emp456" } }`
3. Jan 10 salary calculation: Order RKR363 counts as 2 loads (instead of 3)
4. Jan 11 salary table: Shows new row for RKR363 with 1 load, assigned to emp456
5. Jan 11 salary calculation: This incomplete load counts as 1 load for emp456
