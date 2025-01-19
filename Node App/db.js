const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');


const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl: {
        ca: fs.readFileSync('us-east-2-bundle.pem').toString(), 
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
    } 
})();

module.exports = {
    query: (text, params) => pool.query(text, params),
};
