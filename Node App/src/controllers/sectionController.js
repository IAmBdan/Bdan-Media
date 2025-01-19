
const db = require('../../db');
const express = require('express');
const router = express.Router();


const sectionFromId = async (req, res) => {
    const { sectionId } = req.query; // Get sectionId from query parameters

    console.log('getMediaBySection called');
    console.log('Query Params:', req.query);

    if (!sectionId) {
        console.error('Error: sectionId is required');
        return res.status(400).json({ error: 'sectionId is required' });
    }

    try {
        // Fetch sectionPath using sectionId
        const sectionResult = await db.query(
            `
            SELECT path FROM sections WHERE id = $1
        `,
            [sectionId]
        );

        if (sectionResult.rows.length === 0) {
            console.error(`No section found for sectionId: ${sectionId}`);
            return res.status(404).json({ error: 'Section not found' });
        }

        const sectionPath = sectionResult.rows[0].path;
        console.log(`Resolved sectionPath: ${sectionPath}`);

        // Fetch media based on the resolved sectionPath
        const mediaResult = await db.query(
            `
            SELECT id, s3_key, type, width, height, tags, uploaded_at 
            FROM media 
            WHERE s3_key LIKE $1
        `,
            [`${sectionPath}/%`]
        );

        console.log('Fetched media:', mediaResult.rows);
        res.status(200).json(mediaResult.rows);
    } catch (error) {
        console.error('Error fetching media:', error.message);
        res.status(500).json({ error: 'Failed to fetch media' });
    }
};

const sectionByPath = async (req, res) => {
    const { path } = req.query;

    console.log('Resolving section by path:', path);

    if (!path) {
        return res.status(400).json({ error: 'path is required' });
    }

    try {
        const sectionResult = await db.query(`
            SELECT id, name, path, parent_id
            FROM sections
            WHERE path = $1
        `, [path]);
        console.log('Received path in query:', path);
        if (sectionResult.rows.length === 0) {
            console.error(`No section found for path: ${path}`);
            return res.status(404).json({ error: 'Section not found' });
        }

        console.log('Resolved section:', sectionResult.rows[0]);
        res.status(200).json(sectionResult.rows[0]);
    } catch (error) {
        console.error('Error resolving section by path:', error.message);
        res.status(500).json({ error: 'Failed to resolve section' });
    }
};


const fetchAllSections = async (req, res) => {
    try {
        const sections = await db.query(`
            SELECT id, name, path, parent_id 
            FROM sections
        `);
        res.status(200).json(sections.rows);
    } catch (error) {
        console.error('Error fetching sections:', error.message);
        res.status(500).json({ error: 'Failed to fetch sections' });
    }
};

module.exports =  { sectionByPath, fetchAllSections, sectionFromId };