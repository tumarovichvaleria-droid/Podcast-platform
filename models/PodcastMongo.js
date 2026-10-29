const mongoose = require('mongoose');


const episodeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  durationMinutes: { type: Number, required: true, min: 1 },
  playsCount: { type: Number, default: 0, min: 0 },
  audioUrl: { type: String, trim: true },
  description: { type: String, default: 'Описание отсутствует' },
  isExplicit: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});


const podcastSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: 'Описание отсутствует' },
  author: { type: String, trim: true },
  coverUrl: { type: String, trim: true },
  tags: [{ type: String, trim: true }],
  episodes: [episodeSchema], 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PodcastMongo', podcastSchema);