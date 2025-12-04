import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '../db/schema.js';

const connectionString = "postgresql://neondb_owner:npg_uz1CTgcEpVb7@ep-sparkling-morning-a1o7xk08-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

const pool = new Pool({ connectionString });

const db = drizzle(pool, { schema });

export default db;