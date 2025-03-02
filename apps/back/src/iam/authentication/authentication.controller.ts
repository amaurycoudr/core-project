import { Controller } from '@nestjs/common';
import { contract } from '@repo/contract';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { AuthenticationService } from './authentication.service';
import { Auth } from './decorators/authentication.decorator';
import { AUTH_KINDS } from '../iam.constants';

@Controller()
export class AuthenticationController {
    constructor(private readonly authenticationService: AuthenticationService) {}

    @TsRestHandler(contract.auth)
    @Auth(AUTH_KINDS.None)
    handler() {
        return tsRestHandler(contract.auth, {
            signIn: async ({ body }) => {
                const { result, data } = await this.authenticationService.signIn(body);

                if (result === 'error') {
                    return { status: 400, body: { message: data } };
                }

                return { status: 200, body: data };
            },
            signUp: async ({ body }) => {
                const { result, data } = await this.authenticationService.signUp(body);

                if (result === 'error') {
                    return { status: 400, body: { message: data } };
                }

                return { status: 201, body: data };
            },
            refreshTokens: async ({ body }) => {
                const { result, data } = await this.authenticationService.refreshTokens(body.refreshToken);

                if (result === 'error') {
                    return { status: 400, body: { message: data } };
                }

                return { status: 200, body: data };
            },
        });
    }
}
