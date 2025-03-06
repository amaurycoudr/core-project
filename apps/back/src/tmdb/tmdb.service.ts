import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { Gender, Job } from 'src/movies/movies.schema';
import { z } from 'zod';

// let a = await get(TmdbService).search("La ord")

@Injectable()
export class TmdbService {
    private axiosClient: AxiosInstance;
    private TMDB_API_URL = 'https://api.themoviedb.org/3/';
    constructor(private config: ConfigService) {
        this.axiosClient = axios.create({ baseURL: this.TMDB_API_URL });
        this.axiosClient.defaults.headers.common['Authorization'] = `Bearer ${this.config.get('TMDB_API_ACCESS_TOKEN')}`;
        this.axiosClient.defaults.params = { language: 'fr-FR' };
    }
    private TMDB_ENDPOINTS = {
        credits: (id: number) => `/movie/${id}/credits`,
        movie: (id: number) => `/movie/${id}`,
        person: (id: number) => `person/${id}`,
        searchMovie: () => '/search/movie',
    };

    async findMovie(tmdbId: number) {
        const result = await this.axiosClient.get(this.TMDB_ENDPOINTS.movie(tmdbId));
        return z.object({ data: this.tmdbMovieDetailsSchema() }).parse(result).data;
    }

    async findPerson(tmdbId: number) {
        const result = await this.axiosClient.get(this.TMDB_ENDPOINTS.person(tmdbId));
        return z.object({ data: this.tmdbPersonDetailSchema() }).parse(result).data;
    }
    async findCredit(tmdbId: number) {
        const result = await this.axiosClient.get(this.TMDB_ENDPOINTS.credits(tmdbId));
        return z.object({ data: this.tmdbMovieCreditSchema() }).parse(result).data;
    }
    async search(query: string) {
        const result = await this.axiosClient.get(this.TMDB_ENDPOINTS.searchMovie(), {
            params: { query },
        });

        return z
            .object({ data: z.object({ results: z.array(this.tmdbSearchMovie()) }) })
            .parse(result)
            .data.results.slice(0, 10);
    }

    private tmdbSearchMovie = () =>
        z
            .object({
                id: z.number(),
                original_title: z.string(),
                overview: z.string(),
                poster_path: z.string().nullable(),
                release_date: z.string(),
                title: z.string(),
            })
            .transform(({ release_date, poster_path, original_title, ...obj }) => ({
                ...obj,
                releaseDate: release_date,
                posterPath: poster_path,
                originalTitle: original_title,
            }));

    private tmdbPersonDetailSchema = () =>
        z
            .object({
                birthday: z.string().nullable(),
                deathday: z.string().nullable(),
                gender: z.number().transform(this.getGenderFromTmdb),
                id: z.number(),
                known_for_department: z.string(),
                name: z.string(),
            })
            .transform(({ birthday, deathday, gender, id, known_for_department, name }) => ({
                birthday,
                deathday,
                gender,
                tmdbId: id,
                job: this.getJobFromTmbDepartment(known_for_department),
                name,
            }));

    private tmdbMovieCreditSchema = () =>
        z.object({
            cast: z.array(z.object({ id: z.number(), character: z.string() }).transform(({ character, id }) => ({ tmdbId: id, character }))),
            crew: z.array(z.object({ id: z.number(), job: z.string() }).transform(({ id, job }) => ({ tmdbId: id, job: this.getJobFromTmdb(job) }))),
        });
    private tmdbMovieDetailsSchema = () =>
        z
            .object({
                backdrop_path: z.string().nullable(),
                original_language: z.string(),
                original_title: z.string(),
                id: z.number(),
                overview: z.string(),
                poster_path: z.string().nullable(),
                release_date: z.string(),
                runtime: z.number(),
                tagline: z.string(),
                title: z.string(),
            })
            .transform(({ backdrop_path, original_language, original_title, id, overview, poster_path, release_date, runtime, tagline, title }) => ({
                backdropPath: backdrop_path,
                originalLanguage: original_language,
                tmdbId: id,
                originalTitle: original_title,
                overview,
                posterPath: poster_path,
                releaseDate: release_date,
                duration: runtime,
                tagline,
                title,
            }));

    private getGenderFromTmdb = (tmdbGender: number) => {
        const genderRecord: Record<number, Gender> = {
            0: 'unknown',
            1: 'woman',
            2: 'man',
            3: 'nonBinary',
        };

        return genderRecord[tmdbGender] ?? 'unknown';
    };

    private getJobFromTmdb = (job: string): Job => {
        const jobByTmdbJob: Record<string, Job> = {
            Producer: 'producer',
            'Original Music Composer': 'composer',
            Screenplay: 'screenPlay',
            Director: 'director',
            Editor: 'editor',
            'Director of Photography': 'directorOfPhotography',
            Actor: 'actor',
        };
        return jobByTmdbJob[job] ?? 'unknown';
    };

    private getJobFromTmbDepartment = (department: string): Job => {
        const jobFromTmbDepartment: Record<string, Job> = {
            Acting: 'actor',
            Production: 'producer',
            Directing: 'director',
            Camera: 'directorOfPhotography',
            Sound: 'composer',
            Writing: 'screenPlay',
            Editing: 'editor',
        };

        return jobFromTmbDepartment[department] ?? 'unknown';
    };
}
