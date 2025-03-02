import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Config } from 'src/config/config';

@Injectable()
export class DrizzleService {
    db;

    constructor(configService: ConfigService<Config>) {
        this.db = drizzle(
            `postgresql://${configService.get('POSTGRES_USER')}:${configService.get('POSTGRES_PASSWORD')}@${configService.get('POSTGRES_HOST')}:${configService.get('POSTGRES_PORT')}`,
        );
    }
}
