import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test DB connection immediately
pool.connect()
  .then((client) => {
    console.log('✅ PostgreSQL connected successfully');
    client.release(); // Release the client back to the pool
  })
  .catch((err) => {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
    process.exit(1); // Exit the app if DB fails
  });

export default pool;