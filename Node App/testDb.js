const { Pool } = require('pg');
const fs = require('fs');
const AWS = require('aws-sdk');
require('dotenv').config();

// AWS Configuration
AWS.config.update({
    region: 'us-east-2' // Ensure the correct AWS region
});

const s3 = new AWS.S3();
const bucketName = 'bdan-media-secrets';
const certKey = 'us-east-2-bundle.pem';  // Ensure this matches the uploaded file name in S3
const localCertPath = './us-east-2-bundle.pem';

// Function to download PEM file from S3
const downloadCertificate = async () => {
    try {
        const params = {
            Bucket: bucketName,
            Key: certKey
        };

        const data = await s3.getObject(params).promise();
        fs.writeFileSync(localCertPath, data.Body);
        console.log('Certificate downloaded successfully.');
    } catch (error) {
        console.error('Error downloading PEM certificate:', error.message);
        throw error;
    }
};

// Function to connect to PostgreSQL
const connectToDatabase = async () => {
    try {
        await downloadCertificate();

        const pool = new Pool({
            user: process.env.PG_USER,
            host: process.env.PG_HOST,
            database: process.env.PG_DATABASE,
            password: process.env.PG_PASSWORD,
            port: process.env.PG_PORT,
            ssl: {
                ca: fs.readFileSync(localCertPath).toString(),
            },
        });

        const client = await pool.connect();
        console.log('Successfully connected to the database');
        const res = await client.query('SELECT NOW()');
        console.log('Current Time:', res.rows[0]);
        client.release();
        pool.end();
    } catch (error) {
        console.error('Database connection error:', error.message);
    }
};

// Start the connection process
connectToDatabase();