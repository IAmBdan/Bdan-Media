const { Pool } = require('pg');
const fs = require('fs');
// Load environment variables
require('dotenv').config();



const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    ssl: {
        ca: fs.readFileSync('./us-east-2-bundle.pem').toString(), // Use the correct region-specific certificate
    },
});

(async () => {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to the database');
        const res = await client.query('SELECT NOW()');
        console.log('Current Time:', res.rows[0]);
        client.release();
    } catch (error) {
        console.error('Database connection error:', error.message);
    } finally {
        pool.end();
    }
})();
