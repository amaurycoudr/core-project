import { integer, pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { lower } from "src/drizzle/drizzle.helper";

export const users = pgTable(
	"users",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		email: varchar({ length: 320 }).notNull(),
		username: varchar({ length: 50 }).notNull(),
		password: varchar({ length: 100 }).notNull(),
	},
	(table) => [
		uniqueIndex("emailUniqueIndex").on(lower(table.email)),
		uniqueIndex("usernameUniqueIndex").on(lower(table.username)),
	],
);

export type User = typeof users.$inferSelect;

export type CreateUser = typeof users.$inferInsert;
