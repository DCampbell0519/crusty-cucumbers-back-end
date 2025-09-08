const Movie = require('../models/movie');
const { searchByTitle, getFullById } = require('../services/omdb')


async function searchMovies(req, res) {
  try {
    const { title, year } = req.query
    const results = await searchByTitle(title || '', year || undefined)
    return res.json(results)
  } catch (err) {
    const status = err.status || 500
    return res.status(status).json({ message: err.message || 'Server error' })
  }
}

async function getMovie(req, res) {
  try {
    const { imdbID } = req.params
    if (!imdbID) {
      return res.status(400).json({ message: 'Param "imdbID" is required' })
    }

    const existing = await Movie.findOne({ imdbID })
    console.log(existing)
    if (existing) return res.json(existing)

    const normalized = await getFullById(imdbID)
    try {
      const created = await Movie.create(normalized)
      return res.json(created)
    } catch (e) {
      if (e?.code === 11000 && e?.keyPattern?.imdbID) {
        const doc = await Movie.findOne({ imdbID })
        if (doc) return res.json(doc)
      }
      throw e
    }
  } catch (err) {
    const status = err.status || 500
    return res.status(status).json({ message: err.message || 'Server error' })
  }
}

module.exports = {
  searchMovies,
  getMovie,
}
