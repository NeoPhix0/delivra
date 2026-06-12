/**
 * AUTH GUARD - Protects routes based on authentication and role
 */

import React, { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'driver' | 'client' | null;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole = null }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (hasRedirected.current) return;

    const normalizedRole = role?.toLowerCase();

    if (!isAuthenticated) {
      hasRedirected.current = true;
      router.replace('/(auth)/welcome');
      return;
    }

    if (requiredRole && normalizedRole !== requiredRole.toLowerCase()) {
      hasRedirected.current = true;
      router.replace('/(auth)/welcome');
      return;
    }
  }, [loading, isAuthenticated, role, requiredRole]);

  if (loading) {
    return null;
  }

  const normalizedRole = role?.toLowerCase();

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && normalizedRole !== requiredRole.toLowerCase()) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;