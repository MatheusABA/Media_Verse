import Image from "next/image"
import { Star, Clock, Tv, Calendar } from "lucide-react"
import { IMG_BASE, type MovieDetail, type TVDetail, type CastMember, type MediaItem } from "../lib/tmdb"
import { MediaSection } from "./MediaSection"

type Props =
  | { detail: MovieDetail; credits: CastMember[]; similar: MediaItem[] }
  | { detail: TVDetail; credits: CastMember[]; similar: MediaItem[] }

export function MediaDetail({ detail, credits, similar }: Props) {
  const isMovie = "title" in detail
  const title = isMovie ? detail.title : detail.name
  const date = isMovie ? detail.release_date : detail.first_air_date
  const year = date ? new Date(date).getFullYear() : null

  return (
    <div>
      {/* Backdrop */}
      <div className="relative w-full h-90 rounded-2xl overflow-hidden mb-8 shadow-2xl">
        {detail.backdrop_path && (
          <Image
            src={`https://image.tmdb.org/t/p/w1280${detail.backdrop_path}`}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-black/30 to-transparent" />
      </div>

      {/* Main info */}
      <div className="flex gap-8 -mt-24 mb-10 relative z-10 px-2">
        {/* Poster */}
        <div className="hidden md:block shrink-0 w-44 h-64 rounded-xl overflow-hidden shadow-2xl border-2 border-zinc-700">
          {detail.poster_path ? (
            <Image
              src={`${IMG_BASE}${detail.poster_path}`}
              alt={title}
              width={176}
              height={264}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm">
              Sem imagem
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-end">
          {detail.tagline && (
            <p className="text-zinc-400 italic text-sm mb-1">{detail.tagline}</p>
          )}
          <h1 className="text-4xl font-extrabold leading-tight mb-2">{title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
            <span className="flex items-center gap-1 text-yellow-400 font-bold">
              <Star size={14} fill="currentColor" />
              {detail.vote_average.toFixed(1)}
            </span>
            {year && (
              <span className="flex items-center gap-1 text-zinc-400">
                <Calendar size={14} />
                {year}
              </span>
            )}
            {isMovie && detail.runtime && (
              <span className="flex items-center gap-1 text-zinc-400">
                <Clock size={14} />
                {Math.floor(detail.runtime / 60)}h {detail.runtime % 60}min
              </span>
            )}
            {!isMovie && (
              <span className="flex items-center gap-1 text-zinc-400">
                <Tv size={14} />
                {(detail as TVDetail).number_of_seasons} temporada(s) · {(detail as TVDetail).number_of_episodes} episódios
              </span>
            )}
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-4">
            {detail.genres.map((g) => (
              <span
                key={g.id}
                className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-700"
              >
                {g.name}
              </span>
            ))}
          </div>

          <p className="text-zinc-300 text-sm max-w-2xl leading-relaxed">{detail.overview}</p>
        </div>
      </div>

      {/* Cast */}
      {credits.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-extrabold mb-4">Elenco Principal</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {credits.slice(0, 12).map((actor) => (
              <div key={actor.id} className="shrink-0 w-24 text-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-2 border-2 border-zinc-700 bg-zinc-800">
                  {actor.profile_path ? (
                    <Image
                      src={`${IMG_BASE}${actor.profile_path}`}
                      alt={actor.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">?</div>
                  )}
                </div>
                <p className="text-xs font-bold text-zinc-200 truncate">{actor.name}</p>
                <p className="text-xs text-zinc-500 truncate">{actor.character}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Similar */}
      {similar.length > 0 && (
        <MediaSection
          title={isMovie ? "Filmes Similares" : "Séries Similares"}
          items={similar.slice(0, 15)}
        />
      )}
    </div>
  )
}