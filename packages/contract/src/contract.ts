import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const COMMON_API_ERRORS = {
	NOT_FOUND: "NOT_FOUND",
} as const;

export const USER_API_ERRORS = {
	unknownUser: "unknownUser",
	wrongPassword: "wrongPassword",
	emailAlreadyUsed: "emailAlreadyUsed",
	invalidRefreshToken: "invalidRefreshToken",
	missingRefreshToken: "missingRefreshToken",
} as const;

export type AuthErrors = (typeof USER_API_ERRORS)[keyof typeof USER_API_ERRORS];

const tokensSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
});

const authContract = c.router({
	signUp: {
		path: "/auth/sign-up",
		method: "POST",
		body: z.object({
			email: z.string().email(),
			password: z.string().min(8).max(50),
			username: z.string().min(3).max(20),
		}),
		responses: {
			201: tokensSchema,
			400: z.object({ message: z.literal(USER_API_ERRORS.emailAlreadyUsed) }),
		},
	},
	signIn: {
		path: "/auth/sign-in",
		method: "POST",
		body: z.object({ email: z.string(), password: z.string() }),
		responses: {
			200: tokensSchema,
			400: z.object({
				message: z.enum([USER_API_ERRORS.unknownUser, USER_API_ERRORS.wrongPassword]),
			}),
		},
	},
	refreshTokens: {
		path: "/auth/refresh-tokens",
		method: "POST",
		body: z.object({ refreshToken: z.string() }),
		responses: {
			200: tokensSchema,
			400: z.object({
				message: z.enum([
					USER_API_ERRORS.invalidRefreshToken,
					COMMON_API_ERRORS.NOT_FOUND,
					USER_API_ERRORS.missingRefreshToken,
				]),
			}),
		},
	},
});

const userContract = c.router({
	getMe: {
		path: "/users/me",
		method: "GET",
		description: "retrieve you own user",
		responses: {
			200: z.object({
				username: z.string(),
				email: z.string(),
				id: z.number(),
			}),
			404: z.object({ message: z.literal(COMMON_API_ERRORS.NOT_FOUND) }),
		},
	},
});

const movieContract = c.router({
	search: {
		path: "/movies/search",
		method: "GET",
		description: "search movie on TMDB",
		query: z.object({ page: z.number().nullish(), query: z.string().min(2) }),
		responses: {
			200: z.object({
				total: z.number(),
				page: z.number(),
				list: z.array(
					z.object({
						title: z.string(),
						posterUrl: z.string().nullish(),
						releaseDate: z.string(),
						tmdbId: z.number(),
					}),
				),
			}),
		},
	},
});

export const contract = c.router(
	{
		core: {
			getHealth: {
				path: "/health",
				method: "GET",
				responses: { 200: z.object({ status: z.string() }) },
			},
		},
		auth: authContract,
		user: userContract,
		movie: movieContract,
	},
	{
		strictStatusCodes: true,
		pathPrefix: "/api/v1",
		commonResponses: {
			500: z.object({
				statusCode: z.number(),
				message: z.literal("Internal server error"),
			}),
		},
	},
);
