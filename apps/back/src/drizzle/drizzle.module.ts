import { Global, Module } from '@nestjs/common';
import { DrizzleService } from './drizzle.service';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
    providers: [DrizzleService, ConfigService],
    exports: [DrizzleService],
})
export class DrizzleModule {}
