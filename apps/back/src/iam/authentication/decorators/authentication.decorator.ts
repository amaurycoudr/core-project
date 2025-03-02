import { SetMetadata } from '@nestjs/common';
import { AuthKind } from '../../iam.constants';

export const AUTH_TYPE_KEY = 'authType';

export const Auth = (...authTypes: AuthKind[]) => SetMetadata(AUTH_TYPE_KEY, authTypes);
