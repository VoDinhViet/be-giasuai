import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserRole } from '../constants/role.constant';
import { JwtPayloadType } from '../api/auth/types/jwt-payload.type';
import { ROLES_KEY } from '../decorators/roles.decorator';
import {
  Permission,
  getPermissionCodesByRole,
  type PermissionCode,
} from '../constants/permission.constant';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionCode[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (
      (!requiredPermissions || requiredPermissions.length === 0) &&
      (!requiredRoles || requiredRoles.length === 0)
    ) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayloadType | undefined;

    if (!user) {
      return false;
    }

    if (requiredPermissions && requiredPermissions.length > 0) {
      const userPermissions = getPermissionCodesByRole(user.role);
      const hasSystemManage = userPermissions.includes(
        Permission.SYSTEM_MANAGE,
      );
      const hasRequiredPermission = requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasSystemManage && !hasRequiredPermission) {
        throw new ForbiddenException(
          'Ban khong co quyen truy cap tai nguyen nay',
        );
      }

      return true;
    }

    if (!requiredRoles.includes(user.role as UserRole)) {
      throw new ForbiddenException(
        'Ban khong co quyen truy cap tai nguyen nay',
      );
    }

    return true;
  }
}
