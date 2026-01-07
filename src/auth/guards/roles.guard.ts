import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (request.url.includes('/auth/login') || request.url.includes('/auth/register')) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    this.logger.debug(`Required roles: ${JSON.stringify(requiredRoles)}`);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    this.logger.debug(`Request object keys: ${Object.keys(request).join(',')}`);

    const user = request.user?.user || request.user;

    if (!user) {
      this.logger.error('No user found in request');
      this.logger.error(`Available request keys: ${Object.keys(request).join(', ')}`);
      throw new UnauthorizedException('User not authenticated');
    }

    this.logger.debug(`User from request: ${JSON.stringify(user)}`);

    if (Array.isArray(user.role)) {
      return user.role.some(role => requiredRoles.includes(role));
    }

    const hasAccess = requiredRoles.includes(user.role);
    this.logger.log(`Access ${hasAccess ? 'granted' : 'denied'} to user with role ${user.role}`);
    return hasAccess;
  }
}
