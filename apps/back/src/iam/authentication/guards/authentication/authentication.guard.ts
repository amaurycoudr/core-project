import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_KINDS, AuthKind } from 'src/iam/iam.constants';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AUTH_TYPE_KEY } from '../../decorators/authentication.decorator';

@Injectable()
export class AuthenticationGuard implements CanActivate {
    private static readonly defaultAuthType = AUTH_KINDS.Bearer;

    constructor(
        private readonly reflector: Reflector,
        private readonly accessTokenGuard: AccessTokenGuard,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const authTypes = this.reflector.getAllAndOverride<AuthKind[]>(AUTH_TYPE_KEY, [context.getHandler(), context.getClass()]) ?? [
            AuthenticationGuard.defaultAuthType,
        ];
        const authTypeGuardMap = {
            [AUTH_KINDS.Bearer]: this.accessTokenGuard,
            [AUTH_KINDS.None]: { canActivate: () => true },
        };
        const guards = authTypes.map((type) => authTypeGuardMap[type]).flat();
        let error = new UnauthorizedException();

        for (const instance of guards) {
            const canActivate = await Promise.resolve(instance.canActivate(context)).catch((err) => {
                error = err;
            });

            if (canActivate) {
                return true;
            }
        }
        throw error;
    }
}
