import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

export default pool;