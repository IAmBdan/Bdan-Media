const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

// Test function to list S3 buckets
const testS3Access = async () => {
    try {
        const result = await s3.listBuckets().promise();
        console.log('S3 Buckets:', result.Buckets);
    } catch (error) {
        console.error('Error accessing S3:', error.message);
    }
};

// Test function to list objects in your bucket
const testBucketObjects = async () => {
    try {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
        };
        const result = await s3.listObjectsV2(params).promise();
        console.log('Objects in Bucket:', result.Contents);
    } catch (error) {
        console.error('Error accessing bucket:', error.message);
    }
};

// Run the tests
(async () => {
    await testS3Access();
    await testBucketObjects();
})();
