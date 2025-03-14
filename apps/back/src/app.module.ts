import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { configSchema } from "./config/config";
import jwtConfig from "./config/jwt.config";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { IamModule } from "./iam/iam.module";
import { MoviesModule } from "./movies/movies.module";
import { RedisModule } from "./redis/redis.module";
import { TmdbModule } from "./tmdb/tmdb.module";
import { UserModule } from "./user/user.module";

@Module({
	imports: [
		ConfigModule.forRoot({ validate: configSchema.parse, isGlobal: true }),
		JwtModule.registerAsync({ ...jwtConfig.asProvider(), global: true }),
		BullModule.forRoot({
			connection: {
				host: configSchema.parse(process.env).REDIS_HOST,
				port: configSchema.parse(process.env).REDIS_PORT,
			},
		}),

		DrizzleModule,
		UserModule,
		IamModule,
		RedisModule,
		TmdbModule,
		MoviesModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
