import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;
let useFallback = false;

const dbUrl = process.env.DATABASE_URL;

if (dbUrl) {
  try {
    pool = new Pool({
      connectionString: dbUrl,
      connectionTimeoutMillis: 3000, // Fail quickly if host not reachable
    });

    // Simple test query
    pool.query('SELECT 1')
      .then(() => {
        console.log('Database: Connected to PostgreSQL successfully.');
        useFallback = false;
      })
      .catch((err) => {
        console.warn('Database: PostgreSQL connection failed. Using in-memory fallback store.');
        console.warn('Reason:', err.message);
        useFallback = true;
      });
  } catch (err: any) {
    console.warn('Database: Failed to initialize PostgreSQL pool. Using in-memory fallback store.');
    console.warn('Error:', err.message);
    useFallback = true;
  }
} else {
  console.log('Database: No DATABASE_URL provided. Running in in-memory fallback mode.');
  useFallback = true;
}

export const query = async (text: string, params?: any[]) => {
  if (useFallback || !pool) {
    throw new Error('Database is in fallback mode. Direct queries not available.');
  }
  return pool.query(text, params);
};

export const isFallback = () => useFallback;
export const setFallback = (value: boolean) => { useFallback = value; };
export { pool };
