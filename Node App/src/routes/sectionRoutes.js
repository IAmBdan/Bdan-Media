const express = require('express');
const router = express.Router();
const db = require('../../db');
const { sectionByPath } = require('../controllers/sectionController');
const { fetchAllSections } = require('../controllers/sectionController');
const { sectionFromId } = require('../controllers/sectionController');

// Fetch all sections
router.get('/', fetchAllSections);

router.get('/section', sectionFromId);

router.get('/path', sectionByPath);

router.get('/media', async (req, res) => {
    const { sectionId } = req.query;

    console.log('Fetching media for sectionId:', sectionId);

    if (!sectionId) {
        return res.status(400).json({ error: 'sectionId is required' });
    }

    try {
        const mediaResult = await db.query(`
            SELECT id, s3_key, type, width, height, tags, uploaded_at
            FROM media
            WHERE section_id = $1
        `, [sectionId]);

        console.log('Fetched media:', mediaResult.rows);
        res.status(200).json(mediaResult.rows);
    } catch (error) {
        console.error('Error fetching media:', error.message);
        res.status(500).json({ error: 'Failed to fetch media' });
    }
});

module.exports = router;