const AWS = require('aws-sdk');
const db = require('../../db');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const generatePresignedUrls = async (req, res) => {
  const { files, sectionPath } = req.body;
  if (!Array.isArray(files) || files.length === 0 || !sectionPath) {
    return res.status(400).json({ error: 'Files and sectionPath are required' });
  }

  try {
    const urls = await Promise.all(
      files.map(async (file) => {
        const params = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `${sectionPath}/${file.fileName}`,
          Expires: 300,
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
  const { media } = req.body;
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
        const values = [s3_key, sectionPath, tags && tags.length > 0 ? tags : null, type, width, height, uploaded_by];
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
  const { sectionPath, sortBy = 'id', order = 'random', fileType, tags } = req.query;

  const validSortFields = ['id', 'type', 'width', 'height', 'uploaded_at'];
  const validOrderValues = ['asc', 'desc', 'random'];

  if (!sectionPath) return res.status(400).json({ error: 'sectionPath is required' });
  if (!validSortFields.includes(sortBy) || !validOrderValues.includes(order.trim())) {
    return res.status(400).json({ error: 'Invalid sorting parameters' });
  }

  try {
    let query = `
      SELECT id, s3_key, section_id, tags, type, width, height, uploaded_at
      FROM media
      WHERE section_id = (SELECT id FROM sections WHERE path = $1)
    `;
    const values = [sectionPath];

    if (fileType) {
      query += ` AND type = $${values.length + 1}`;
      values.push(fileType);
    }

    if (tags) {
      query += ` AND tags && $${values.length + 1}`;
      values.push(tags.split(','));
    }

    query += order.trim() === 'random' ? ` ORDER BY RANDOM()` : ` ORDER BY ${sortBy} ${order.trim()}`;

    const result = await db.query(query, values);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching media:', error.message);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
};

const deleteMedia = async (req, res) => {
  const { ids } = req.body;
  if (!ids || ids.length === 0) return res.status(400).json({ error: 'No media IDs provided' });

  try {
    const mediaItems = await db.query('SELECT s3_key FROM media WHERE id = ANY($1)', [ids]);

    await Promise.all(
      mediaItems.rows.map((item) =>
        s3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET_NAME, Key: item.s3_key }).promise()
      )
    );

    await db.query('DELETE FROM media WHERE id = ANY($1)', [ids]);
    res.status(200).json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error.message);
    res.status(500).json({ error: 'Failed to delete media' });
  }
};

const deleteAllMediaInSection = async (req, res) => {
  const { sectionPath } = req.body;
  if (!sectionPath) return res.status(400).json({ error: 'sectionPath is required' });

  try {
    const mediaResult = await db.query(
      `SELECT id, s3_key FROM media WHERE section_id = (SELECT id FROM sections WHERE path = $1)`,
      [sectionPath]
    );

    if (mediaResult.rows.length === 0) {
      return res.status(200).json({ message: 'No media found for this section' });
    }

    await Promise.all(
      mediaResult.rows.map((item) =>
        s3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET_NAME, Key: item.s3_key }).promise()
      )
    );

    const ids = mediaResult.rows.map((r) => r.id);
    await db.query(`DELETE FROM media WHERE id = ANY($1)`, [ids]);

    res.status(200).json({ message: `Deleted ${ids.length} media items` });
  } catch (error) {
    console.error('Error deleting all media:', error.message);
    res.status(500).json({ error: 'Failed to delete media' });
  }
};

module.exports = {
  generatePresignedUrls,
  saveMediaMetadata,
  getMediaBySection,
  deleteMedia,
  deleteAllMediaInSection,
};