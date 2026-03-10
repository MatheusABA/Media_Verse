import { getTVDetail, getTVCredits, getSimilarSeries } from "../../../lib/tmdb"
import { MediaDetail } from "../../../components/MediaDetail"

export default async function SeriePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [detail, creditsData, similar] = await Promise.all([
    getTVDetail(id),
    getTVCredits(id),
    getSimilarSeries(id),
  ])

  return <MediaDetail detail={{ ...detail, media_type: "tv" }} credits={creditsData.cast} similar={similar} />
}