const AWS = require('aws-sdk');
const db = require('../../db');
const sharp = require('sharp'); 
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const generatePresignedUrls = async (req, res) => {
    const { files, sectionPath } = req.body; // Include sectionPath
    console.log('Incoming Request Body:', req.body);
    if (!Array.isArray(files) || files.length === 0 || !sectionPath) {
        console.error('Validation Error: Missing files or sectionPath');

        return res.status(400).json({ error: 'Files and sectionPath are required' });
    }

    try {
        const urls = await Promise.all(
            files.map(async (file) => {

                const params = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: `${sectionPath}/${file.fileName}`, // Prefix with sectionPath
                    Expires: 300, // 5 minutes
                    ContentType: file.fileType,
                };
                const presignedUrl = await s3.getSignedUrlPromise('putObject', params);
                return { fileName: file.fileName, url: presignedUrl };
            })
        );

        res.status(200).json({ urls });
    } catch (error) {
        console.error('Error generating pre-signed URLs:', error.message);
        res.status(500).json({ error: 'Failed to generate pre-signed URLs' });
    }
};



const saveMediaMetadata = async (req, res) => {
    const { media } = req.body; // Array of { s3_key, sectionPath, tags, type, width, height, uploaded_by }

    if (!Array.isArray(media) || media.length === 0) {
        return res.status(400).json({ error: 'No media metadata provided' });
    }

    try {
        const query = `
    INSERT INTO media (s3_key, section_id, tags, type, width, height, uploaded_by)
    VALUES ($1, (SELECT id FROM sections WHERE path = $2), $3, $4, $5, $6, $7)
    RETURNING *;
`;
        const savedMedia = await Promise.all(
            media.map(async (file) => {
                const { s3_key, sectionPath, tags, type, width, height, uploaded_by } = file;
                const values = [s3_key, sectionPath,
                    tags && tags.length > 0 ? tags : null, // Handle empty tags 
                     type, width, height, uploaded_by];

                     console.log('SQL Query:', query);
                     console.log('Values:', values);    
                const result = await db.query(query, values);
                return result.rows[0];
            })
        );

        res.status(201).json(savedMedia);
    } catch (error) {
        console.error('Error saving media metadata:', error.message);
        res.status(500).json({ error: 'Failed to save media metadata' });
    }
};


const getMediaBySection = async (req, res) => {
    console.log('getMediaBySection called');
    console.log('Query Params:', req.query);

    const { sectionPath, sortBy = 'id', order = 'random', fileType, tags } = req.query; // Extract parameters
    console.log('Request Query Parameters:', req.query);
    //params 
    // Validate the sortBy and order parameters
    const validSortFields = ['id', 'type', 'width', 'height', 'uploaded_at'];
    const validOrderValues = ['asc', 'desc', 'random'];

    if (!sectionPath) {
        return res.status(400).json({ error: 'sectionPath is required' });
    }

    if (!validSortFields.includes(sortBy) || !validOrderValues.includes(order.trim())) {
        return res.status(400).json({ error: 'Invalid sorting parameters' });
    }

    try {
        console.log('Constructing query...');
        let query = `
            SELECT id, s3_key, section_id, tags, type, width, height, uploaded_at
            FROM media
            WHERE section_id = (SELECT id FROM sections WHERE path = $1)
        `;
        const values = [sectionPath];

        // Filter by file type if provided
        if (fileType) {
            query += ` AND type = $${values.length + 1}`;
            values.push(fileType);
        }

        // Filter by tags if provided
        if (tags) {
            const tagList = tags.split(','); // Split comma-separated tags
            query += ` AND tags && $${values.length + 1}`; // Use PostgreSQL's overlap operator (&&) for arrays
            values.push(tagList);
        }

        // Add sorting
        if (order.trim() === 'random') {
            query += ` ORDER BY RANDOM()`;
        } else {
            query += ` ORDER BY ${sortBy} ${order.trim()}`;
        }

        console.log('Executing query:', query);
        console.log('Query values:', values);

        const result = await db.query(query, values);

        console.log('Query result:', result.rows);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching media by section with sorting and filtering:', error.message);
        res.status(500).json({ error: 'Failed to fetch media' });
    }
};

const deleteMedia = async (req, res) => {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
        return res.status(400).json({ error: 'No media IDs provided' });
    }

    try {
        const mediaItems = await db.query('SELECT s3_key FROM media WHERE id = ANY($1)', [ids]);

        const s3DeletePromises = mediaItems.rows.map((item) =>
            s3.deleteObject({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: item.s3_key,
            }).promise()
        );

        await Promise.all(s3DeletePromises);
        await db.query('DELETE FROM media WHERE id = ANY($1)', [ids]);

        res.status(200).json({ message: 'Media deleted successfully' });
    } catch (error) {
        console.error('Error deleting media:', error.message);
        res.status(500).json({ error: 'Failed to delete media' });
    }
};









module.exports = { generatePresignedUrls, saveMediaMetadata, getMediaBySection, deleteMedia };
