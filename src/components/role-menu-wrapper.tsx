'use client';

import { useState, useEffect } from 'react';
import { useAuthSession } from '@/hooks/use-auth-session';
import { isAdmin, isEmployee } from '@/lib/auth-helpers';
import { AdminMenu } from './admin-menu';
import { EmployeeMenu } from './employee-menu';

export function RoleMenuWrapper() {
  const { user, loading } = useAuthSession();
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [userIsEmployee, setUserIsEmployee] = useState(false);
  const [checkingRoles, setCheckingRoles] = useState(true);

  useEffect(() => {
    async function checkRoles() {
      if (loading) return;
      if (!user) {
        setUserIsAdmin(false);
        setUserIsEmployee(false);
        setCheckingRoles(false);
        return;
      }
      const [adminStatus, employeeStatus] = await Promise.all([
        isAdmin(user.id),
        isEmployee(user.id),
      ]);
      setUserIsAdmin(adminStatus);
      setUserIsEmployee(employeeStatus);
      setCheckingRoles(false);
    }
    checkRoles();
  }, [user, loading]);

  if (checkingRoles) {
    return null;
  }

  // If user has both roles, stack them vertically
  // Admin menu first (higher priority), then employee menu below
  if (userIsAdmin && userIsEmployee) {
    return (
      <div className="sticky top-0 z-50">
        <AdminMenu />
        <EmployeeMenu />
      </div>
    );
  }

  // If only admin, show admin menu (AdminMenu has its own sticky positioning)
  if (userIsAdmin) {
    return <AdminMenu />;
  }

  // If only employee, wrap in sticky container for consistent behavior
  if (userIsEmployee) {
    return (
      <div className="sticky top-0 z-50">
        <EmployeeMenu />
      </div>
    );
  }

  return null;
}

