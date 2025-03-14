import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DrizzleService } from "./drizzle.service";

@Global()
@Module({
	providers: [DrizzleService, ConfigService],
	exports: [DrizzleService],
})
export class DrizzleModule {}
