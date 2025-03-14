import { Controller } from "@nestjs/common";
import { contract } from "@repo/contract";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import { AUTH_KINDS } from "../iam.constants";
import { AuthenticationService } from "./authentication.service";
import { Auth } from "./decorators/authentication.decorator";

@Controller()
export class AuthenticationController {
	constructor(private readonly authenticationService: AuthenticationService) {}

	@TsRestHandler(contract.auth)
	@Auth(AUTH_KINDS.None)
	handler() {
		return tsRestHandler(contract.auth, {
			signIn: async ({ body }) => {
				const { result, data } = await this.authenticationService.signIn(body);

				if (result === "error") {
					return { status: 400, body: { message: data } };
				}

				return { status: 200, body: data };
			},
			signUp: async ({ body }) => {
				const { result, data } = await this.authenticationService.signUp(body);

				if (result === "error") {
					return { status: 400, body: { message: data } };
				}

				return { status: 201, body: data };
			},
			refreshTokens: async ({ body }) => {
				const { result, data } = await this.authenticationService.refreshTokens(body.refreshToken);

				if (result === "error") {
					return { status: 400, body: { message: data } };
				}

				return { status: 200, body: data };
			},
		});
	}
}
