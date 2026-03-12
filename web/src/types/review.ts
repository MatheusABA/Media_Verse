export type ReviewedMedia = {
  id: string
  title: string
  posterUrl: string | null
  tmdbId: string | null
  rating: string | null
  reviewContent: string
  reviewCreatedAt: string
}

export type TopMediaItem = {
  id: string
  mediaId: string
  title: string
  posterUrl: string | null
  tmdbId: string | null
  position: number
  type: "movie" | "tv"
}