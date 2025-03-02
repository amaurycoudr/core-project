import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { USER_API_ERRORS, contract } from '@repo/contract';
import { Config } from 'src/config/config';
import { ERROR, SUCCESS } from 'src/config/const';
import { User } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';
import { z } from 'zod';
import { ActiveUserData } from '../decorators/active-user.decorator';
import { HashingService } from '../hashing/hashing.service';
import { RefreshTokenIdsStorage } from './refresh-token-ids.storage/refresh-token-ids.storage';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly userService: UserService,
        private readonly hashingService: HashingService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService<Config, true>,
        private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
    ) {}

    signIn = async (signInPayload: z.infer<(typeof contract)['auth']['signIn']['body']>) => {
        const { result, data } = await this.userService.findByEmail(signInPayload.email);

        if (result === ERROR) {
            return { result, data } as const;
        }
        const user = data;

        const isPasswordEqual = await this.hashingService.compare(signInPayload.password, user.password);

        if (!isPasswordEqual) return { data: USER_API_ERRORS.wrongPassword, result: 'error' } as const;

        const tokens = await this.generateTokens(user);
        return { data: tokens, result: 'success' } as const;
    };

    signUp = async (signUpPayload: z.infer<(typeof contract)['auth']['signUp']['body']>) => {
        const { data, result } = await this.userService.create({
            ...signUpPayload,
            password: await this.hashingService.hash(signUpPayload.password),
        });

        if (result === ERROR) {
            return { data: USER_API_ERRORS.emailAlreadyUsed, result: ERROR } as const;
        }
        const tokens = await this.generateTokens(data);

        return { data: tokens, result: SUCCESS } as const;
    };

    refreshTokens = async (refreshToken: string) => {
        if (!refreshToken) {
            return { data: USER_API_ERRORS.missingRefreshToken, result: 'error' } as const;
        }

        const { id } = await this.jwtService.verifyAsync<ActiveUserData>(refreshToken, {
            secret: this.configService.get('JWT_SECRET'),
            ignoreExpiration: true,
        });

        const { data, result } = await this.userService.findOne(id);

        if (result === ERROR) {
            return { data, result };
        }
        const user = data;

        const isTokenIdValid = await this.refreshTokenIdsStorage.isTokenIdValid(id, refreshToken);

        if (!isTokenIdValid) {
            return { data: USER_API_ERRORS.invalidRefreshToken, result: 'error' } as const;
        }

        const tokens = await this.generateTokens(user);
        await this.refreshTokenIdsStorage.insert(user.id, tokens.refreshToken);

        return { data: tokens, result: 'success' } as const;
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
