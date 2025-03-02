import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configSchema } from './config/config';
import { DrizzleModule } from './drizzle/drizzle.module';
import { IamModule } from './iam/iam.module';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';
import jwtConfig from './config/jwt.config';

@Module({
    imports: [
        ConfigModule.forRoot({ validate: configSchema.parse, isGlobal: true }),
        JwtModule.registerAsync({ ...jwtConfig.asProvider(), global: true }),
        DrizzleModule,
        UserModule,
        IamModule,
        RedisModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
