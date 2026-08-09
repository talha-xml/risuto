const Anime = require('../models/Anime');

// Add Anime

exports.addAnime = async (req, res) => {
  try {
    const { title, status, priority, genres, notes, favorite, mature } = req.body;

    const anime = await Anime.create({
      user: req.user.id,
      title,
      status,
      priority,
      genres,
      notes,
      favorite,
      mature
    });

    res.status(201).json({
      message: 'Anime added successfully.',
      anime
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get all anime of logged-in user

exports.getAnime = async (req, res) => {
  try {
    const anime = await Anime.find({
      user: req.user.id
    }).sort({
      createdAt: -1
    });

    res.status(200).json(anime);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Dashboard Statistics

exports.getStats = async (req, res) => {
  try {
    const anime = await Anime.find({
      user: req.user.id
    });

    const stats = {
      total: anime.length,
      incomplete: 0,
      completed: 0,
      watching: 0,
      plan: 0,
      hold: 0,
      dropped: 0
    };

    anime.forEach((item) => {
      switch (item.status) {
        case 'Completed':
          stats.completed++;
          break;

        case 'Watching':
          stats.watching++;
          break;

        case 'Incomplete':
          stats.incomplete++;
          break;

        case 'Plan to Watch':
          stats.plan++;
          break;

        case 'On Hold':
          stats.hold++;
          break;

        case 'Dropped':
          stats.dropped++;
          break;

        default:
          break;
      }
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Recently Added

exports.getRecentlyAdded = async (req, res) => {
  try {
    const anime = await Anime.find({
      user: req.user.id
    })

      .sort({
        createdAt: -1
      })

      .limit(5)

      .select('title');

    res.status(200).json(anime);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get single anime

exports.getAnimeById = async (req, res) => {
  try {
    const anime = await Anime.findOne({
      _id: req.params.id,

      user: req.user.id
    });

    if (!anime) {
      return res.status(404).json({
        message: 'Anime not found.'
      });
    }

    res.status(200).json(anime);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Update anime

exports.updateAnime = async (req, res) => {
  try {
    const anime = await Anime.findOne({
      _id: req.params.id,

      user: req.user.id
    });

    if (!anime) {
      return res.status(404).json({
        message: 'Anime not found.'
      });
    }

    const { title, notes, status, priority, genres, favorite, mature } = req.body;

    anime.title = title;

    anime.notes = notes;

    anime.status = status;

    anime.priority = priority;

    anime.genres = genres;

    anime.favorite = favorite;

    anime.mature = mature;

    await anime.save();

    res.status(200).json({
      message: 'Anime updated successfully.',

      anime
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Delete anime

exports.deleteAnime = async (req, res) => {
  try {
    const anime = await Anime.findOneAndDelete({
      _id: req.params.id,

      user: req.user.id
    });

    if (!anime) {
      return res.status(404).json({
        message: 'Anime not found.'
      });
    }

    res.status(200).json({
      message: 'Anime deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
