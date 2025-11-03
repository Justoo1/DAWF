// Role-based permissions configuration
export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'ADMIN'

export type Permission =
  | 'view_dashboard'
  | 'view_employees'
  | 'manage_employees'
  | 'view_contributions'
  | 'manage_contributions'
  | 'view_expenses'
  | 'manage_expenses'
  | 'view_events'
  | 'manage_events'
  | 'view_conference_rooms'
  | 'manage_conference_rooms'
  | 'view_reports'
  | 'view_analytics'
  | 'view_policies'
  | 'manage_policies'

// Define permissions for each role
const rolePermissions: Record<UserRole, Permission[]> = {
  EMPLOYEE: [
    'view_events',
    'view_conference_rooms',
    'view_policies',
  ],
  MANAGER: [
    'view_dashboard',
    'view_employees',
    'view_events',
    'manage_events',
    'view_conference_rooms',
    'manage_conference_rooms',
    'view_policies',
  ],
  ADMIN: [
    'view_dashboard',
    'view_employees',
    'manage_employees',
    'view_contributions',
    'manage_contributions',
    'view_expenses',
    'manage_expenses',
    'view_events',
    'manage_events',
    'view_conference_rooms',
    'manage_conference_rooms',
    'view_reports',
    'view_analytics',
    'view_policies',
    'manage_policies',
  ],
}

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

/**
 * Check if a user role can access the admin panel
 */
export function canAccessAdmin(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MANAGER'
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] ?? []
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission))
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission))
}
