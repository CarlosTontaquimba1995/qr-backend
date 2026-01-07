import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { CurrentUser as CurrentUserInterface } from '../interfaces/current-user.interface';

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): CurrentUserInterface => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user?.user || request.user;

        if (!user?.id) {
            throw new UnauthorizedException('Usuario no autenticado');
        }

        return user as CurrentUserInterface;
    },
);
