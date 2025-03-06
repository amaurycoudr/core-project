import { z } from 'zod';

export const MOVIE_QUEUE = 'movie-queue';

export const MOVIE_JOBS = {
    ADD_MOVIE_FROM_TMDB: 'ADD_MOVIE_FROM_TMDB',
} as const;

export type MovieJob = (typeof MOVIE_JOBS)[keyof typeof MOVIE_JOBS];

export const addMovieFromTmdb = z.object({
    tmdbId: z.number(),
    refresh: z.boolean(),
});

export type AddMovieFromTmdb = z.infer<typeof addMovieFromTmdb>;
