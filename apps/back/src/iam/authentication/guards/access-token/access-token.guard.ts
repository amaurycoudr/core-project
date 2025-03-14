import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { Config } from "src/config/config";
import type { ActiveUserData } from "src/iam/decorators/active-user.decorator";
import { REQUEST_USER_KEY } from "src/iam/iam.constants";

@Injectable()
export class AccessTokenGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService<Config>,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const request = context.switchToHttp().getRequest();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const token = this.extractTokenFromHeader(request);
		if (!token) {
			throw new UnauthorizedException();
		}
		try {
			const payload = await this.jwtService.verifyAsync<ActiveUserData>(token, {
				secret: this.configService.get("JWT_SECRET"),
				audience: this.configService.get("JWT_TOKEN_AUDIENCE"),
				issuer: this.configService.get("JWT_TOKEN_ISSUER"),
			});
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			request[REQUEST_USER_KEY] = payload;
		} catch {
			throw new UnauthorizedException();
		}
		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [_, token] = (request.headers as { authorization?: string }).authorization?.split(" ") ?? [];
		return token;
	}
}
