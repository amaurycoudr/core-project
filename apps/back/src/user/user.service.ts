import { Injectable } from '@nestjs/common';
import { COMMON_API_ERRORS, USER_API_ERRORS } from '@repo/contract';
import { eq } from 'drizzle-orm';
import { ERROR, SUCCESS } from 'src/config/const';
import { lower, UNIQUE_CONSTRAINT } from 'src/drizzle/drizzle.helper';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { CreateUser, users } from './schemas/user.schema';

@Injectable()
export class UserService {
    constructor(private readonly drizzleService: DrizzleService) {}

    async create({ email, username, password }: CreateUser) {
        try {
            const [user] = await this.drizzleService.db.insert(users).values({ email, username, password }).returning();
            return { data: user!, result: SUCCESS } as const;
        } catch (error) {
            if ((error as Record<string, unknown>).code === UNIQUE_CONSTRAINT) {
                return { data: USER_API_ERRORS.emailAlreadyUsed, result: ERROR } as const;
            }
            throw error;
        }
    }

    async findByEmail(email: string) {
        const [user] = await this.drizzleService.db
            .select()
            .from(users)
            .where(eq(lower(users.email), email.toLowerCase()));

        if (!user) {
            return { data: USER_API_ERRORS.unknownUser, result: ERROR } as const;
        }

        return { data: user, result: SUCCESS } as const;
    }

    async findOne(id: number) {
        const [user] = await this.drizzleService.db.select().from(users).where(eq(users.id, id));

        if (!user) {
            return { data: COMMON_API_ERRORS.NOT_FOUND, result: ERROR } as const;
        }

        return { data: user, result: SUCCESS } as const;
    }
}
