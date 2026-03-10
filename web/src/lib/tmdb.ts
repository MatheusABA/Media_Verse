const BASE_URL = "https://api.themoviedb.org/3"
export const IMG_BASE = "https://image.tmdb.org/t/p/w500"

const API_KEY = process.env.TMDB_API_KEY

async function tmdbFetch<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}?language=pt-BR&api_key=${API_KEY}`
  const res = await fetch(url, {
    headers: {
      accept: "application/json",
    },
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`)
  return res.json()
}

export type MediaItem = {
  id: number
  title?: string         
  name?: string         
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  media_type?: "movie" | "tv"
  release_date?: string
  first_air_date?: string
  overview: string
}

type TMDBResponse = { results: MediaItem[] }

export const getTrending = () =>
  tmdbFetch<TMDBResponse>("/trending/all/week").then((r) => r.results)

export const getPopularMovies = () =>
  tmdbFetch<TMDBResponse>("/movie/popular").then((r) => r.results)

export const getPopularSeries = () =>
  tmdbFetch<TMDBResponse>("/tv/popular").then((r) => r.results)