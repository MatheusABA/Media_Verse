import { getMovieDetail, getMovieCredits, getSimilarMovies } from "../../../lib/tmdb"
import { MediaDetail } from "../../../components/MediaDetail"

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [detail, creditsData, similar] = await Promise.all([
    getMovieDetail(id),
    getMovieCredits(id),
    getSimilarMovies(id),
  ])

  return <MediaDetail detail={{ ...detail, media_type: "movie" }} credits={creditsData.cast} similar={similar} />
}