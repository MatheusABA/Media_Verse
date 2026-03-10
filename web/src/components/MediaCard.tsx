import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { IMG_BASE, type MediaItem } from "../lib/tmdb"

export function MediaCard({ item }: { item: MediaItem }) {
  const title = item.title ?? item.name ?? "Sem título"
  const isSerie = item.media_type === "tv" || item.name;
  const type = isSerie ? "serie" : "movie";
  const href = `/${type}/${item.id}`;

  // Texto amigável para exibir
  const typeLabel = isSerie ? "Série" : "Filme";

  return (
    <Link href={href} className="group shrink-0 w-36 md:w-44">
      <div className="relative w-full aspect-2/3 rounded-xl overflow-hidden border-2 border-transparent group-hover:border-zinc-400 transition-all shadow-lg">
        {/* Tag do tipo */}
        <span className="absolute top-2 left-2 z-10 bg-zinc-900/80 text-xs text-white font-bold px-2 py-0.5 rounded-full shadow">
          {typeLabel}
        </span>
        {item.poster_path ? (
          <Image
            src={`${IMG_BASE}${item.poster_path}`}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 144px, 176px"
          />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm">
            Sem imagem
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
            <Star size={12} fill="currentColor" />
            {item.vote_average.toFixed(1)}
          </div>
        </div>
      </div>
      <p className="mt-2 text-sm font-semibold text-zinc-200 truncate">
        {title}
      </p>
    </Link>
  );
}