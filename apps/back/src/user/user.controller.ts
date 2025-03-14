import { Controller } from "@nestjs/common";
import { contract } from "@repo/contract";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import { ERROR } from "src/config/const";
import { ActiveUser, type ActiveUserData } from "src/iam/decorators/active-user.decorator";
import { UserService } from "./user.service";

@Controller()
export class UserController {
	constructor(private readonly userService: UserService) {}

	@TsRestHandler(contract.user)
	async handler(@ActiveUser() activeUser: ActiveUserData) {
		return tsRestHandler(contract.user, {
			getMe: async () => {
				const { data, result } = await this.userService.findOne(activeUser.id);

				if (result === ERROR) {
					return { body: { message: data }, status: 404 };
				}

				const { password: _password, ...returnedUser } = data;

				return { status: 200, body: returnedUser };
			},
		});
	}
}
