const router = require("express").Router();
const { searchMovies, getMovie } = require("../controllers/movies");

router.get("/search", searchMovies);
router.get("/:imdbID", getMovie);

module.exports = router;
