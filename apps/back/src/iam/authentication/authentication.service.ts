import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AUTH_ERRORS, AuthErrors, contract } from '@repo/contract';
import { eq } from 'drizzle-orm';
import { Config } from 'src/config/config';
import { lower, UNIQUE_CONSTRAINT } from 'src/drizzle/drizzle.helper';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { User, users } from 'src/user/schemas/user.schema';
import { z } from 'zod';
import { ActiveUserData } from '../decorators/active-user.decorator';
import { HashingService } from '../hashing/hashing.service';
import { RefreshTokenIdsStorage } from './refresh-token-ids.storage/refresh-token-ids.storage';

type Tokens = { accessToken: string; refreshToken: string };
type SignInUpResponse = { result: 'error'; data: AuthErrors } | { result: 'success'; data: Tokens };
@Injectable()
export class AuthenticationService {
    constructor(
        private readonly drizzleService: DrizzleService,
        private readonly hashingService: HashingService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService<Config, true>,
        private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
    ) {}

    signIn = async (signInPayload: z.infer<(typeof contract)['auth']['signIn']['body']>) => {
        const [user] = await this.drizzleService.db
            .select()
            .from(users)
            .where(eq(lower(users.email), signInPayload.email.toLowerCase()));

        if (!user) return { data: AUTH_ERRORS.unknownUser, result: 'error' } satisfies SignInUpResponse;

        const isPasswordEqual = await this.hashingService.compare(signInPayload.password, user.password);

        if (!isPasswordEqual) return { data: AUTH_ERRORS.wrongPassword, result: 'error' } satisfies SignInUpResponse;

        const tokens = await this.generateTokens(user);
        return { data: tokens, result: 'success' } satisfies SignInUpResponse;
    };

    signUp = async (signUpPayload: z.infer<(typeof contract)['auth']['signUp']['body']>) => {
        const hashedPassword = await this.hashingService.hash(signUpPayload.password);

        try {
            const [user] = await this.drizzleService.db
                .insert(users)
                .values({ email: signUpPayload.email, username: signUpPayload.username, password: hashedPassword })
                .returning();

            const tokens = await this.generateTokens(user);

            return { data: tokens, result: 'success' } satisfies SignInUpResponse;
        } catch (error) {
            if ((error as Record<string, unknown>).code === UNIQUE_CONSTRAINT) {
                return { data: AUTH_ERRORS.emailAlreadyUsed, result: 'error' } satisfies SignInUpResponse;
            }
            throw error;
        }
    };

    refreshTokens = async (refreshToken: string) => {
        if (!refreshToken) {
            return { data: AUTH_ERRORS.missingRefreshToken, result: 'error' } satisfies SignInUpResponse;
        }

        const { id } = await this.jwtService.verifyAsync<ActiveUserData>(refreshToken, {
            secret: this.configService.get('JWT_SECRET'),
            ignoreExpiration: true,
        });

        const [user] = await this.drizzleService.db.select().from(users).where(eq(users.id, id));

        if (!user) {
            return { data: AUTH_ERRORS.unknownUser, result: 'error' } satisfies SignInUpResponse;
        }

        const isTokenIdValid = await this.refreshTokenIdsStorage.isTokenIdValid(id, refreshToken);

        if (!isTokenIdValid) {
            return { data: AUTH_ERRORS.invalidRefreshToken, result: 'error' } satisfies SignInUpResponse;
        }

        const tokens = await this.generateTokens(user);
        await this.refreshTokenIdsStorage.insert(user.id, tokens.refreshToken);

        return { data: tokens, result: 'success' } satisfies SignInUpResponse;
    };

    private generateTokens = async (user: User) => {
        const accessToken = await this.signToken({ email: user.email, id: user.id }, this.configService.get('JWT_ACCESS_TOKEN_TTL'));
        const refreshToken = await this.signToken({ email: user.email, id: user.id }, this.configService.get('JWT_REFRESH_TOKEN_TTL'));

        await this.refreshTokenIdsStorage.insert(user.id, refreshToken);

        return { accessToken, refreshToken };
    };

    private signToken = async ({ email, id }: { email: string; id: number }, expiresIn?: number | string) =>
        await this.jwtService.signAsync({ id, email } satisfies ActiveUserData, {
            audience: this.configService.get('JWT_TOKEN_AUDIENCE'),
            issuer: this.configService.get('JWT_TOKEN_ISSUER'),
            secret: this.configService.get('JWT_SECRET'),
            expiresIn,
        });
}
