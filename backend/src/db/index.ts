import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { config } from "@/lib/config";

const pool = new pg.Pool({
  connectionString: config.databaseUrl,
});

export const db = drizzle(pool);
export { pool };
