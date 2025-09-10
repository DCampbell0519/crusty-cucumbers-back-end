const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    imdbID: {
      type: String,
      required: true,
      unique: true,
    },
    posterUrl: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    genre: {
      type: String,
    },
    director: {
      type: String,
    },
    runtimeMinutes: {
      type: Number,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    plot: {
      type: String,
    },
  },
  { timestamps: true }
);

const Movie = mongoose.models.Movie || mongoose.model("Movie", movieSchema);

module.exports = Movie;
