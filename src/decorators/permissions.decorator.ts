import { SetMetadata } from '@nestjs/common';

import type { PermissionType } from '../constants/permission.constant';

export const PERMISSIONS_KEY = 'permissions';

export const Permissions = (...permissions: PermissionType[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
