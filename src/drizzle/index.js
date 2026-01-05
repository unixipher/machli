import 'dotenv/config';
import { drizzle as drizzleORM } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const drizzle = drizzleORM(pool, { schema });
