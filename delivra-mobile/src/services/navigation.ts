/**
 * UTILITAIRE DE NAVIGATION - Redirection centralisée par rôle
 * Évite la duplication du switch(role) dans _layout, login, AuthGuard
 */

import { router } from 'expo-router';

export type UserRole = 'admin' | 'driver' | 'client';

export const REDIRECT_MAP: Record<UserRole, string> = {
  admin: '/admin',
  driver: '/driver',
  client: '/(tabs)',
};

export const getRedirectPath = (role: UserRole): string => {
  return REDIRECT_MAP[role] || '/(tabs)';
};

export const redirectByRole = (role: UserRole) => {
  const path = getRedirectPath(role);
  router.replace(path as any);
};
