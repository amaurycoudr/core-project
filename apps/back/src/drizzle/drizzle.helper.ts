import { AnyPgColumn } from 'drizzle-orm/pg-core';
import { sql, SQL } from 'drizzle-orm';

export function lower(email: AnyPgColumn): SQL {
    return sql`lower(${email})`;
}

export const UNIQUE_CONSTRAINT = '23505';
