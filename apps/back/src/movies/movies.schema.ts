import { relations } from 'drizzle-orm';
import { date, integer, pgEnum, pgTable, primaryKey, serial, text, unique, varchar } from 'drizzle-orm/pg-core';

export const GENDERS = ['unknown', 'woman', 'man', 'nonBinary'] as const;
export type Gender = (typeof GENDERS)[number];

const JOBS = ['actor', 'screenPlay', 'director', 'editor', 'directorOfPhotography', 'producer', 'unknown', 'composer'] as const;
export type Job = (typeof JOBS)[number];

export const genderEnum = pgEnum('gender', GENDERS);
export const jobEnum = pgEnum('job', JOBS);

export const movies = pgTable(
    'movie',
    {
        id: serial('id').primaryKey(),
        title: text('title').notNull(),
        releaseDate: date('releaseDate').notNull(),
        tmdbId: integer('tmdb_id').unique(),
        posterPath: text('posterPath'),
        originalLanguage: varchar('originalLanguage', { length: 50 }),
        overview: text('overview').notNull(),
        tagline: text('tagline').notNull(),
        duration: integer('duration').notNull(),
    },
    (t) => [unique('no_movie_duplicate').on(t.releaseDate, t.title)],
);

export const movieRelations = relations(movies, ({ many }) => ({
    cast: many(casts),
    crew: many(crews),
}));

export const casts = pgTable(
    'cast',
    {
        movieId: integer('movie_id')
            .notNull()
            .references(() => movies.id, { onDelete: 'cascade' }),
        personId: integer('person_id')
            .notNull()
            .references(() => persons.id, { onDelete: 'cascade' }),
        character: varchar('character', { length: 256 }).notNull(),
    },
    (t) => [primaryKey({ columns: [t.personId, t.movieId, t.character] })],
);

export type InsertCast = typeof casts.$inferInsert;

export const castRelations = relations(casts, ({ one }) => ({
    movie: one(movies, { fields: [casts.movieId], references: [movies.id] }),
    person: one(persons, { fields: [casts.personId], references: [persons.id] }),
}));

export const crews = pgTable(
    'crew',
    {
        movieId: integer('movie_id')
            .notNull()
            .references(() => movies.id, { onDelete: 'cascade' }),
        personId: integer('person_id')
            .notNull()
            .references(() => persons.id, { onDelete: 'cascade' }),
        job: jobEnum('job').notNull(),
    },
    (t) => [primaryKey({ columns: [t.personId, t.movieId, t.job] })],
);
export type InsertCrew = typeof crews.$inferInsert;

export const crewRelations = relations(crews, ({ one }) => ({
    movie: one(movies, { fields: [crews.movieId], references: [movies.id] }),
    person: one(persons, { fields: [crews.personId], references: [persons.id] }),
}));

export const persons = pgTable('person', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    birthday: date('birthday'),
    deathday: date('deathday'),
    gender: genderEnum('gender').notNull(),
    tmdbId: integer('tmdb_id').unique().notNull(),
    job: jobEnum('job').default('unknown'),
});

export type InsertPerson = typeof persons.$inferInsert;

export const personRelations = relations(persons, ({ many }) => ({
    actingJobs: many(casts),
    productionJobs: many(crews),
}));
