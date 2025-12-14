-- Verification script to check salary payment integration
-- Run this in Supabase SQL Editor to verify data consistency

-- 1. Check all daily salary payments
SELECT 
  id,
  employee_id,
  date,
  amount,
  is_paid,
  created_at,
  updated_at
FROM public.daily_salary_payments
ORDER BY date DESC, employee_id;

-- 2. Check employee profile IDs
SELECT 
  id,
  email,
  role,
  first_name,
  last_name
FROM public.profiles
WHERE role = 'employee';

-- 3. Verify employee_id matches profile id
SELECT 
  dsp.employee_id,
  dsp.date,
  dsp.is_paid,
  p.id as profile_id,
  p.email,
  CASE 
    WHEN dsp.employee_id = p.id THEN 'MATCH' 
    ELSE 'MISMATCH' 
  END as id_match
FROM public.daily_salary_payments dsp
LEFT JOIN public.profiles p ON dsp.employee_id = p.id
ORDER BY dsp.date DESC;

-- 4. Check for any payments with employee_id that doesn't exist in profiles
SELECT 
  dsp.employee_id,
  dsp.date,
  dsp.is_paid
FROM public.daily_salary_payments dsp
LEFT JOIN public.profiles p ON dsp.employee_id = p.id
WHERE p.id IS NULL;

-- 5. Count payments by status
SELECT 
  is_paid,
  COUNT(*) as count,
  COUNT(DISTINCT employee_id) as unique_employees,
  COUNT(DISTINCT date) as unique_dates
FROM public.daily_salary_payments
GROUP BY is_paid;

