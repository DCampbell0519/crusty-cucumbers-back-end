const Movie = require('../models/movie')

const { searchByTitle, getFullById } = require('../services/omdb')

/**
 * GET /api/movies/search?title=Inception
 * Controller goal:
 * - Validate the query param
 * - Ask OMDb service for search results (already normalized)
 * - Return the array to the client
 */

async function searchMovies(req, res) {
    try {
        const { title } = req.query
        if(!title || !title.trim()) {
            return res.status(400).json({ message: 'Query param "title" is required'})
        }
        const results = await searchByTitle(title)
        return res.json(results)
    } catch (err) {
        const status = err.status || 500
        return res.status(status).json({ message: err.message || 'Server error'})
    }
}

async function getMovie(req, res) {
    try {
        const { imdbID } = req.params

        if (!imdbID) {
            return res.status(400).json({ message: 'Param "imdbID" is required'})
        }
        const existing = await Movie.findOne({ imdbID })
        if (existing) {
            return res.json(existing)
        }
        const normalized = await getFullById(imdbID)
        const created = await Movie.create(normalized)
        return res.json(created)
    } catch (err) {
        if(err?.code === 11000 && err?.keyPattern?.imdbID) {
            const doc = await Movie.findOne({ imdbID: req.params.imdbID })
            if (doc) return res.json(doc)
        }
        const status = err.status || 500
        return res.status(status).json({ message: err.message || 'Server error'})
    }
}

module.exports = {
    searchMovies,
    getMovie,
}