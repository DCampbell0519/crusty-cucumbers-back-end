const express = require("express");
const router = express.Router();
const Review = require("../models/review");
const Movie = require("../models/movie");
const verifyToken = require("../middleware/verify-token.js");

async function recalcMovieRating(movieId) {
  const reviews = await Review.find({ movieId });
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  await Movie.findByIdAndUpdate(movieId, { averageRating, totalReviews });
}

router.post("/movies/:id/reviews", verifyToken, async (req, res) => {
  try {
    const movieId = req.params.id;
    const { rating, reviewText } = req.body;
    const userId = req.user._id;
    if (!rating || !reviewText) {
      return res
        .status(400)
        .json({ error: "Rating and reviewText are required" });
    }
    const review = new Review({ userId, movieId, rating, reviewText });
    await review.save();
    await recalcMovieRating(movieId);
    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/movies/:id/reviews", async (req, res) => {
  try {
    const movieId = req.params.id;
    const reviews = await Review.find({ movieId }).populate(
      "userId",
      "username"
    );
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/reviews/:id", verifyToken, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, reviewText } = req.body;
    const userId = req.user._id;
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ error: "Review not found" });
    if (!review.userId.equals(userId))
      return res.status(403).json({ error: "Not authorized" });
    if (rating) review.rating = rating;
    if (reviewText) review.reviewText = reviewText;
    await review.save();
    await recalcMovieRating(review.movieId);
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/reviews/:id", verifyToken, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user._id;
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ error: "Review not found" });
    if (!review.userId.equals(userId))
      return res.status(403).json({ error: "Not authorized" });
    await Review.findByIdAndDelete(reviewId);
    await recalcMovieRating(review.movieId);
    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
