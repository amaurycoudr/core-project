import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import type { Queue } from "bullmq";
import { eq } from "drizzle-orm";
import { mapParallelAsyncWithLimit, uniqBy } from "rambdax";
import { conflictUpdateAllExcept } from "src/drizzle/drizzle.helper";
import { DrizzleService } from "src/drizzle/drizzle.service";
import { TmdbService } from "src/tmdb/tmdb.service";
import { type AddMovieFromTmdb, MOVIE_JOBS, MOVIE_QUEUE } from "./movies.jobs";
import { type InsertCast, type InsertCrew, type InsertPerson, casts, crews, movies, persons } from "./movies.schema";

@Injectable()
export class MoviesService {
	private readonly logger = new Logger(MoviesService.name, { timestamp: true });
	constructor(
		private readonly tmdbService: TmdbService,
		private readonly drizzleService: DrizzleService,
		@InjectQueue(MOVIE_QUEUE) private readonly movieQueue: Queue,
	) {}

	async addMovieFromTmdbToQueue(tmdbId: number, { refresh }: { refresh: boolean }) {
		await this.movieQueue.add(MOVIE_JOBS.ADD_MOVIE_FROM_TMDB, {
			tmdbId,
			refresh,
		} satisfies AddMovieFromTmdb);
	}

	async addMovieFromTmdb(tmdbId: number, { refresh }: { refresh: boolean }) {
		const { id } = await this.insertTmdbMovie(tmdbId);
		await this.insertTmdbCredit(tmdbId, id, { refresh });
	}

	async insertTmdbCredit(tmdbMovieId: number, movieId: number, { refresh }: { refresh: boolean }) {
		if (refresh) {
			await this.dropCrew(movieId);
			await this.dropCast(movieId);
			this.logger.log(`Cast Crew (TMDB_ID=${tmdbMovieId}) dropped`);
		}

		const { cast, crew } = await this.tmdbService.findCredit(tmdbMovieId);
		const filteredCrew = crew.filter(({ job }) => job !== "unknown");

		this.logger.log(`Credit(TMDB_ID=${tmdbMovieId}) fetched from TMDB`);

		const persons = uniqBy(({ tmdbId }) => tmdbId, [...filteredCrew, ...cast]);

		const personsDetails = await mapParallelAsyncWithLimit(
			async ({ tmdbId }) => {
				return await this.tmdbService.findPerson(tmdbId);
			},
			10,
			persons,
		);

		this.logger.log(`Credit(TMDB_ID=${tmdbMovieId}) ${persons.length} persons fetched from TMDB`);

		const insertedCrewPersons = await this.insertPersons(personsDetails);

		await this.insertCrew(
			filteredCrew.map(
				({ job, tmdbId }): InsertCrew => ({
					job,
					movieId,
					personId: insertedCrewPersons.find(({ tmdbId: personTmdbId }) => personTmdbId === tmdbId)!.id,
				}),
			),
		);

		this.logger.log(`Crew(TMDB_ID=${tmdbMovieId}) inserted`);

		await this.insertCast(
			cast.map(
				({ character, tmdbId }): InsertCast => ({
					character,
					movieId,
					personId: insertedCrewPersons.find(({ tmdbId: personTmdbId }) => personTmdbId === tmdbId)!.id,
				}),
			),
		);

		this.logger.log(`Cast(TMDB_ID=${tmdbMovieId}) inserted`);
	}

	async insertPersons(insertPersons: InsertPerson[]) {
		return await this.drizzleService.db
			.insert(persons)
			.values(insertPersons)
			.onConflictDoUpdate({
				target: persons.tmdbId,
				set: conflictUpdateAllExcept(persons, ["tmdbId", "id"]),
			})
			.returning();
	}

	async insertCrew(insertCrews: InsertCrew[]) {
		return await this.drizzleService.db.insert(crews).values(insertCrews).onConflictDoNothing().returning();
	}

	async insertCast(insertCasts: InsertCast[]) {
		return await this.drizzleService.db.insert(casts).values(insertCasts).onConflictDoNothing().returning();
	}

	async dropCrew(movieId: number) {
		return await this.drizzleService.db.delete(crews).where(eq(crews.movieId, movieId));
	}

	async dropCast(movieId: number) {
		return await this.drizzleService.db.delete(casts).where(eq(casts.movieId, movieId));
	}

	async insertTmdbMovie(tmdbMovieId: number) {
		const tmdbMovie = await this.tmdbService.findMovie(tmdbMovieId);
		this.logger.log(`Movie(TMDB_ID=${tmdbMovieId}) (${tmdbMovie.title}) fetched from TMDB`);
		const [movie] = await this.drizzleService.db
			.insert(movies)
			.values(tmdbMovie)
			.onConflictDoUpdate({ set: tmdbMovie, target: movies.tmdbId })
			.returning();
		return movie!;
	}

	async search(query: string, options: { page?: number | null }) {
		const { list, ...pagination } = await this.tmdbService.search(query, {
			page: options.page ?? 1,
		});

		const moviesWithUrl = list.map(({ posterPath, releaseDate, title, tmdbId }) => ({
			releaseDate,
			title,
			tmdbId,
			posterUrl: posterPath ? this.tmdbService.getImageUrl(posterPath, "w500") : undefined,
		}));
		return { ...pagination, list: moviesWithUrl };
	}

	findAll() {
		return "This action returns all movies";
	}

	async findOne(id: number) {
		const [movie] = await this.drizzleService.db.select({}).from(movies).where(eq(movies.id, id));
		return movie;
	}

	update(id: number) {
		return `This action updates a #${id} movie`;
	}

	remove(id: number) {
		return `This action removes a #${id} movie`;
	}
}
