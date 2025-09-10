const axios = require("axios");
const API_KEY = process.env.OMDB_API_KEY;
const BASE_URL = "https://www.omdbapi.com/";

function isNA(value) {
  return !value || value === "N/A";
}

function safeString(value) {
  return isNA(value) ? undefined : String(value).trim();
}

function safeNumber(value) {
  if (isNA(value)) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

function parseRuntimeMinutes(runtimeStr) {
  if (isNA(runtimeStr)) return undefined;
  const match = String(runtimeStr).match(/(\d+)\s*min/i);
  return match ? Number(match[1]) : undefined;
}

function posterOrNull(poster) {
  return isNA(poster) ? null : poster;
}

function uniqByImdb(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    if (!seen.has(it.imdbID)) {
      seen.add(it.imdbID);
      out.push(it);
    }
  }
  return out;
}

function normalizeSearchItem(raw) {
  return {
    imdbID: raw.imdbID,
    title: safeString(raw.Title),
    year: safeNumber(raw.Year),
    posterUrl: posterOrNull(raw.Poster),
  };
}

function normalizeFull(raw) {
  return {
    imdbID: raw.imdbID,
    title: safeString(raw.Title),
    year: safeNumber(raw.Year),
    posterUrl: posterOrNull(raw.Poster),
    genre: safeString(raw.Genre),
    director: safeString(raw.Director),
    plot: safeString(raw.Plot),
    runtimeMinutes: parseRuntimeMinutes(raw.Runtime),
  };
}

async function searchByTitle(title, year) {
  if (!API_KEY) throw new Error("OMDB_API_KEY missing");

  if (title && title.trim().length >= 2) {
    const url = `${BASE_URL}?apikey=${API_KEY}&type=movie&s=${encodeURIComponent(
      title
    )}${year ? `&y=${year}` : ""}&page=1`;
    const { data } = await axios.get(url);
    if (data.Response === "False") {
      const err = new Error(data.Error || "Movie not found");
      err.status = 404;
      throw err;
    }
    const items = Array.isArray(data.Search) ? data.Search : [];
    return items.map(normalizeSearchItem);
  }

  const seeds = ["the", "a", "love"];
  const all = [];
  for (const seed of seeds) {
    const url = `${BASE_URL}?apikey=${API_KEY}&type=movie&s=${encodeURIComponent(
      seed
    )}${year ? `&y=${year}` : ""}&page=1`;
    const { data } = await axios.get(url);
    if (data.Response !== "False" && Array.isArray(data.Search)) {
      all.push(...data.Search.map(normalizeSearchItem));
    }
  }
  return uniqByImdb(all);
}

async function getFullById(imdbID) {
  if (!API_KEY) throw new Error("OMDB_API_KEY missing");
  if (!imdbID) {
    const err = new Error("missing imdbID");
    err.status = 400;
    throw err;
  }
  const url = `${BASE_URL}?apikey=${API_KEY}&i=${encodeURIComponent(
    imdbID
  )}&plot=full`;
  const { data } = await axios.get(url);
  if (data.Response === "False") {
    const err = new Error(data.Error || "Movie not found");
    err.status = 404;
    throw err;
  }
  return normalizeFull(data);
}

module.exports = {
  searchByTitle,
  getFullById,
};
