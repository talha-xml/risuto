const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
  addAnime,
  getAnime,
  getStats,
  getRecentlyAdded,
  getAnimeById,
  updateAnime,
  deleteAnime
} = require('../controllers/animeController');

router.post('/', authMiddleware, addAnime);
router.get('/', authMiddleware, getAnime);
router.get('/stats', authMiddleware, getStats);
router.get('/recent', authMiddleware, getRecentlyAdded);
// IMPORTANT: place this before export
router.get('/:id', authMiddleware, getAnimeById);
router.put('/:id', authMiddleware, updateAnime);
router.delete('/:id', authMiddleware, deleteAnime);

module.exports = router;
