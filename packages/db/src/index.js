import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
export * from "./schema";
export function createDbConnection(connectionString) {
    const client = postgres(connectionString, { max: 10 });
    return drizzle(client, { schema });
}
