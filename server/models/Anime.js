const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    status: {
      type: String,
      enum: ['Plan to Watch', 'Watching', 'Incomplete', 'Completed', 'On Hold', 'Dropped'],
      default: 'Plan to Watch'
    },

    priority: {
      type: String,
      enum: ['Low', 'Normal', 'High'],
      default: 'Normal'
    },

    genres: [
      {
        type: String
      }
    ],

    notes: {
      type: String,
      default: ''
    },

    favorite: {
      type: Boolean,
      default: false
    },

    mature: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Anime', animeSchema);
