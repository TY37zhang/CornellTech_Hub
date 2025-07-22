import { user_role } from '@prisma/client';

interface UserWithElevation {
  role?: user_role | string | null;
  is_admin?: boolean;
  is_mod?: boolean;
}

// Check if user has admin privileges
export function isAdmin(user: UserWithElevation | boolean | null | undefined): boolean {
  if (typeof user === 'boolean') return user;
  if (!user) return false;
  return user.is_admin === true;
}

// Check if user has moderator privileges
export function isMod(user: UserWithElevation | boolean | null | undefined): boolean {
  if (typeof user === 'boolean') return user;
  if (!user) return false;
  return user.is_mod === true;
}

// Check if user can moderate (admin or mod)
export function canModerate(user: UserWithElevation | null | undefined): boolean {
  if (!user) return false;
  return user.is_admin === true || user.is_mod === true;
}

// Check if user has faculty role
export function isFaculty(role: user_role | string | null | undefined): boolean {
  return role === 'faculty';
}

// Check if user has staff role
export function isStaff(role: user_role | string | null | undefined): boolean {
  return role === 'staff';
}

// Check if user has student role (default)
export function isStudent(role: user_role | string | null | undefined): boolean {
  return role === 'student' || !role;
}

// Check if user has enhanced permissions (faculty, staff, admin, or mod)
export function hasEnhancedPermissions(user: UserWithElevation | null | undefined): boolean {
  if (!user) return false;
  return user.is_admin === true || 
         user.is_mod === true || 
         user.role === 'faculty' || 
         user.role === 'staff';
}

// Get display name for a role
export function getRoleDisplayName(role: user_role | string | null | undefined): string {
  switch (role) {
    case 'faculty':
      return 'Faculty';
    case 'staff':
      return 'Staff';
    case 'student':
    default:
      return 'Student';
  }
}

// Get elevation display name
export function getElevationDisplayName(user: UserWithElevation | null | undefined): string | null {
  if (!user) return null;
  if (user.is_admin) return 'Administrator';
  if (user.is_mod) return 'Moderator';
  return null;
}

// Get full role display (role + elevation)
export function getFullRoleDisplay(user: UserWithElevation | null | undefined): string {
  if (!user) return 'Student';
  
  const baseRole = getRoleDisplayName(user.role);
  const elevation = getElevationDisplayName(user);
  
  if (elevation) {
    return `${baseRole} (${elevation})`;
  }
  
  return baseRole;
}

// Get primary display name (elevation takes precedence)
export function getPrimaryRoleDisplayName(user: UserWithElevation | null | undefined): string {
  if (!user) return 'Student';
  
  const elevation = getElevationDisplayName(user);
  if (elevation) return elevation;
  
  return getRoleDisplayName(user.role);
}