const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: String,
  description: String,
  release_year: Number,
  duration_minutes: Number,
  poster_url: String,
  director: String,
  genre: String,
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  // other fields...
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);