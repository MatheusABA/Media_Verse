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

export type Genre = { id: number; name: string }

export type CastMember = {
  id: number
  name: string
  character: string
  profile_path: string | null
}

export type MovieDetail = {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  release_date: string
  runtime: number | null
  genres: Genre[]
  tagline: string
  status: string
  media_type: "movie"
}

export type TVDetail = {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  first_air_date: string
  number_of_seasons: number
  number_of_episodes: number
  genres: Genre[]
  tagline: string
  status: string
  media_type: "tv"
}

export type Credits = { cast: CastMember[] }

export const getMovieDetail = (id: string) =>
  tmdbFetch<MovieDetail>(`/movie/${id}`)

export const getTVDetail = (id: string) =>
  tmdbFetch<TVDetail>(`/tv/${id}`)

export const getMovieCredits = (id: string) =>
  tmdbFetch<Credits>(`/movie/${id}/credits`)

export const getTVCredits = (id: string) =>
  tmdbFetch<Credits>(`/tv/${id}/credits`)

export const getSimilarMovies = (id: string) =>
  tmdbFetch<TMDBResponse>(`/movie/${id}/similar`).then((r) => r.results)

export const getSimilarSeries = (id: string) =>
  tmdbFetch<TMDBResponse>(`/tv/${id}/similar`).then((r) => r.results)

export const searchMulti = async (query: string): Promise<MediaItem[]> => {
  const url = `${BASE_URL}/search/multi?language=pt-BR&api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  const data: TMDBResponse = await res.json();
  return data.results.filter(
    (item) => item.media_type === "movie" || item.media_type === "tv",
  );
};