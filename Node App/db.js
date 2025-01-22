const { Pool } = require('pg');
const fs = require('fs');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

// AWS S3 Configuration
const s3Client = new S3Client({
    region: 'us-east-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const bucketName = 'bdan-media-secrets';
const fileKey = 'us-east-2-bundle.pem';

// Function to get certificate from S3
const getCertificateFromS3 = async () => {
    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: fileKey,
        });
        const response = await s3Client.send(command);

        const chunks = [];
        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks).toString();
    } catch (error) {
        console.error('Error fetching SSL certificate from S3:', error);
        throw new Error('Failed to fetch SSL certificate');
    }
};

// Initialize database connection after fetching SSL certificate
const initializeDB = async () => {
    try {
        const caCert = await getCertificateFromS3();
        const pool = new Pool({
            host: process.env.PG_HOST,
            port: process.env.PG_PORT,
            database: process.env.PG_DATABASE,
            user: process.env.PG_USER,
            password: process.env.PG_PASSWORD,
            ssl: {
                ca: caCert,
            },
        });

        const client = await pool.connect();
        console.log('Successfully connected to the database');
        const res = await client.query('SELECT NOW()');
        console.log('Current Time:', res.rows[0]);
        client.release();

        return pool;
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1);
    }
};

// Export the query function
const poolPromise = initializeDB();

module.exports = {
    query: async (text, params) => {
        const pool = await poolPromise;
        return pool.query(text, params);
    },
};