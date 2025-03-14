import { type SQL, type Table, getTableColumns, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

export function lower(email: AnyPgColumn): SQL {
	return sql`lower(${email})`;
}

export const UNIQUE_CONSTRAINT = "23505";

export function conflictUpdateAllExcept<T extends Table, E extends (keyof T["$inferInsert"])[]>(table: T, except: E) {
	const columns = getTableColumns(table);
	const updateColumns = Object.entries(columns).filter(
		([col]) => !except.includes(col as keyof typeof table.$inferInsert),
	);

	return updateColumns.reduce(
		(acc, [colName, table]) => {
			acc[colName] = sql.raw(`excluded.${table.name}`);
			return acc;
		},
		{} as Record<string, SQL>,
	) as Omit<Record<keyof typeof table.$inferInsert, SQL>, E[number]>;
}
