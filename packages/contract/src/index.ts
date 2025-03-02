import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export const AUTH_ERRORS = {
    unknownUser: 'unknownUser',
    wrongPassword: 'wrongPassword',
    emailAlreadyUsed: 'emailAlreadyUsed',
    invalidRefreshToken: 'invalidRefreshToken',
    missingRefreshToken: 'missingRefreshToken',
} as const;

export type AuthErrors = (typeof AUTH_ERRORS)[keyof typeof AUTH_ERRORS];

const tokensSchema = z.object({ accessToken: z.string(), refreshToken: z.string() });

const authContract = c.router({
    signUp: {
        path: '/auth/sign-up',
        method: 'POST',
        body: z.object({ email: z.string().email(), password: z.string().min(8).max(50), username: z.string().min(3).max(20) }),
        responses: {
            201: tokensSchema,
            400: z.object({ message: z.literal(AUTH_ERRORS.emailAlreadyUsed) }),
        },
    },
    signIn: {
        path: '/auth/sign-in',
        method: 'POST',
        body: z.object({ email: z.string(), password: z.string() }),
        responses: {
            200: tokensSchema,
            400: z.object({ message: z.enum([AUTH_ERRORS.unknownUser, AUTH_ERRORS.wrongPassword]) }),
        },
    },
    refreshTokens: {
        path: '/auth/refresh-tokens',
        method: 'POST',
        body: z.object({ refreshToken: z.string() }),
        responses: {
            200: tokensSchema,
            400: z.object({ message: z.enum([AUTH_ERRORS.invalidRefreshToken, AUTH_ERRORS.unknownUser, AUTH_ERRORS.missingRefreshToken]) }),
        },
    },
});

export const contract = c.router(
    {
        core: {
            getHealth: {
                path: '/health',
                method: 'GET',
                responses: { 200: z.object({ status: z.string() }) },
            },
        },
        auth: authContract,
    },
    {
        strictStatusCodes: true,
        pathPrefix: '/api/v1',
        commonResponses: {
            500: z.object({ statusCode: z.number(), message: z.literal('Internal server error') }),
        },
    },
);
