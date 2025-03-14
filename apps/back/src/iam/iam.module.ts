import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { UserModule } from "src/user/user.module";
import { AuthenticationController } from "./authentication/authentication.controller";
import { AuthenticationService } from "./authentication/authentication.service";
import { AccessTokenGuard } from "./authentication/guards/access-token/access-token.guard";
import { AuthenticationGuard } from "./authentication/guards/authentication/authentication.guard";
import { RefreshTokenIdsStorage } from "./authentication/refresh-token-ids.storage/refresh-token-ids.storage";
import { BcryptService } from "./hashing/bcrypt.service";
import { HashingService } from "./hashing/hashing.service";

@Module({
	providers: [
		{ provide: HashingService, useClass: BcryptService },
		{ provide: APP_GUARD, useClass: AuthenticationGuard },
		AccessTokenGuard,
		AuthenticationService,
		RefreshTokenIdsStorage,
	],
	controllers: [AuthenticationController],
	imports: [UserModule],
})
export class IamModule {}
