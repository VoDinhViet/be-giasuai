import { UserRole } from './role.constant';

export const Permission = {
  SYSTEM_MANAGE: 'system:manage',
  USERS_READ: 'users:read',
  USERS_MANAGE: 'users:manage',
  COURSES_READ: 'courses:read',
  COURSES_MANAGE: 'courses:manage',
  CLASSES_READ: 'classes:read',
  CLASSES_MANAGE: 'classes:manage',
  FILES_UPLOAD: 'files:upload',
} as const;

export type PermissionCode = (typeof Permission)[keyof typeof Permission];

export const ROLE_PERMISSIONS: Record<UserRole, readonly PermissionCode[]> = {
  [UserRole.ADMIN]: [
    Permission.SYSTEM_MANAGE,
    Permission.USERS_READ,
    Permission.USERS_MANAGE,
    Permission.COURSES_READ,
    Permission.COURSES_MANAGE,
    Permission.CLASSES_READ,
    Permission.CLASSES_MANAGE,
    Permission.FILES_UPLOAD,
  ],
  [UserRole.INSTRUCTOR]: [
    Permission.COURSES_READ,
    Permission.COURSES_MANAGE,
    Permission.CLASSES_READ,
    Permission.CLASSES_MANAGE,
    Permission.FILES_UPLOAD,
  ],
  [UserRole.LEARNER]: [Permission.CLASSES_READ, Permission.FILES_UPLOAD],
};

export function getPermissionCodesByRole(role: string): PermissionCode[] {
  if (!isRole(role)) {
    return [];
  }

  return [...ROLE_PERMISSIONS[role]];
}

function isRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}
