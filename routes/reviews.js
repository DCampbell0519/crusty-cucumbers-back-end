const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const { requireAuth } = require('../middleware/auth');

// Helper to recalc average rating and total reviews for a movie
async function recalcMovieRating(movieId) {
  const reviews = await Review.find({ movieId });
  const totalReviews = reviews.length;
  const averageRating = totalReviews === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

  await Movie.findByIdAndUpdate(movieId, { averageRating, totalReviews });
}

// POST /api/movies/:id/reviews - create review
router.post('/movies/:id/reviews', requireAuth, async (req, res) => {
  try {
    const movieId = req.params.id;
    const { rating, reviewText } = req.body;
    const userId = req.user._id;

    if (!rating || !reviewText) {
      return res.status(400).json({ error: 'Rating and reviewText are required' });
    }


    const review = new Review({ userId, movieId, rating, reviewText });
    await review.save();

    await recalcMovieRating(movieId);

    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/movies/:id/reviews - get reviews for a movie
router.get('/movies/:id/reviews', async (req, res) => {
  try {
    const movieId = req.params.id;
    const reviews = await Review.find({ movieId }).populate('userId', 'username');
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/reviews/:id - update review (ownership check)
router.put('/reviews/:id', requireAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, reviewText } = req.body;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (!review.userId.equals(userId)) return res.status(403).json({ error: 'Not authorized' });

    if (rating) review.rating = rating;
    if (reviewText) review.reviewText = reviewText;

    await review.save();
    await recalcMovieRating(review.movieId);

    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/reviews/:id - delete review (ownership check)
router.delete('/reviews/:id', requireAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (!review.userId.equals(userId)) return res.status(403).json({ error: 'Not authorized' });

    await Review.findByIdAndDelete(reviewId);
    await recalcMovieRating(review.movieId);

    res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;