const express = require('express');
const router = express.Router();
const db = require('../../db');
const authenticate = require('../middleware/auth');
const {
  sectionByPath,
  fetchAllSections,
  sectionFromId,
  createSection,
  updateSection,
  deleteSection,
  toggleHideSection,
} = require('../controllers/sectionController');

// Public
router.get('/',        fetchAllSections);
router.get('/section', sectionFromId);
router.get('/path',    sectionByPath);

router.get('/media', async (req, res) => {
  const { sectionId } = req.query;
  if (!sectionId) return res.status(400).json({ error: 'sectionId is required' });
  try {
    const result = await db.query(
      `SELECT id, s3_key, type, width, height, tags, uploaded_at FROM media WHERE section_id = $1`,
      [sectionId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching media:', error.message);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// Admin only
router.post('/',        authenticate, createSection);
router.put('/:id',      authenticate, updateSection);
router.patch('/:id/hide', authenticate, toggleHideSection);
router.delete('/:id',   authenticate, deleteSection);

module.exports = router;