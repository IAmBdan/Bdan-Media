const db = require('../../db');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const sectionFromId = async (req, res) => {
  const { sectionId } = req.query;
  if (!sectionId) return res.status(400).json({ error: 'sectionId is required' });

  try {
    const sectionResult = await db.query(`SELECT path FROM sections WHERE id = $1`, [sectionId]);
    if (sectionResult.rows.length === 0) return res.status(404).json({ error: 'Section not found' });

    const sectionPath = sectionResult.rows[0].path;
    const mediaResult = await db.query(
      `SELECT id, s3_key, type, width, height, tags, uploaded_at FROM media WHERE s3_key LIKE $1`,
      [`${sectionPath}/%`]
    );
    res.status(200).json(mediaResult.rows);
  } catch (error) {
    console.error('Error fetching media:', error.message);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
};

const sectionByPath = async (req, res) => {
  const { path } = req.query;
  if (!path) return res.status(400).json({ error: 'path is required' });

  try {
    const result = await db.query(
      `SELECT id, name, path, parent_id FROM sections WHERE path = $1`,
      [path]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Section not found' });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error resolving section by path:', error.message);
    res.status(500).json({ error: 'Failed to resolve section' });
  }
};

const fetchAllSections = async (req, res) => {
  try {
    const sections = await db.query(`SELECT id, name, path, parent_id, hidden FROM sections`);
    res.status(200).json(sections.rows);
  } catch (error) {
    console.error('Error fetching sections:', error.message);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
};

const toggleHideSection = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `UPDATE sections SET hidden = NOT COALESCE(hidden, false) WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Section not found' });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling section visibility:', error.message);
    res.status(500).json({ error: 'Failed to update section' });
  }
};

const createSection = async (req, res) => {
  const { name, path, parent_id } = req.body;
  if (!name || !path) return res.status(400).json({ error: 'name and path are required' });

  try {
    const existing = await db.query(`SELECT id FROM sections WHERE path = $1`, [path]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'A section with that path already exists' });

    const result = await db.query(
      `INSERT INTO sections (name, path, parent_id) VALUES ($1, $2, $3) RETURNING *`,
      [name, path, parent_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating section:', error.message);
    res.status(500).json({ error: 'Failed to create section' });
  }
};

const updateSection = async (req, res) => {
  const { id } = req.params;
  const { name, path } = req.body;
  if (!name && !path) return res.status(400).json({ error: 'At least one of name or path is required' });

  try {
    const result = await db.query(
      `UPDATE sections SET name = COALESCE($1, name), path = COALESCE($2, path) WHERE id = $3 RETURNING *`,
      [name, path, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Section not found' });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating section:', error.message);
    res.status(500).json({ error: 'Failed to update section' });
  }
};

const deleteSection = async (req, res) => {
  const { id } = req.params;

  try {
    const collectIds = async (sectionId) => {
      const children = await db.query(`SELECT id FROM sections WHERE parent_id = $1`, [sectionId]);
      let ids = [sectionId];
      for (const child of children.rows) {
        ids = ids.concat(await collectIds(child.id));
      }
      return ids;
    };

    const allIds = await collectIds(id);

    // Always delete all media from S3 + DB
    const mediaResult = await db.query(
      `SELECT s3_key FROM media WHERE section_id = ANY($1::int[])`,
      [allIds]
    );
    if (mediaResult.rows.length > 0) {
      await Promise.all(
        mediaResult.rows.map((item) =>
          s3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET_NAME, Key: item.s3_key }).promise()
        )
      );
      await db.query(`DELETE FROM media WHERE section_id = ANY($1::int[])`, [allIds]);
    }

    await db.query(`DELETE FROM sections WHERE id = ANY($1::int[])`, [allIds]);
    res.status(200).json({ message: 'Section and all media deleted', deletedIds: allIds });
  } catch (error) {
    console.error('Error deleting section:', error.message);
    res.status(500).json({ error: 'Failed to delete section' });
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
    if (mediaResult.rows.length === 0) return res.status(200).json({ message: 'No media found' });

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
  sectionByPath,
  fetchAllSections,
  sectionFromId,
  createSection,
  updateSection,
  deleteSection,
  toggleHideSection,
};