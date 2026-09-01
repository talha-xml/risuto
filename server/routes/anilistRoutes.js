const express = require('express');
const router = express.Router();

const { searchAnime } = require('../services/anilistService');

router.get('/test', async (req, res) => {
  try {
    const animeName = req.query.name || 'Attack on Titan';

    const anime = await searchAnime(animeName);

    res.status(200).json({
      success: true,
      anime
    });
  } catch (error) {
    console.error('ANILIST ERROR:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch anime from AniList.'
    });
  }
});

module.exports = router;
