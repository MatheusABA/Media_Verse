import Image from "next/image";
import Link from "next/link";
import { Star, Play } from "lucide-react";
import { IMG_BASE, type MediaItem } from "../lib/tmdb";

export function HeroBanner({ item }: { item: MediaItem }) {
  const title = item.title ?? item.name ?? "";
  const type = item.media_type === "tv" ? "serie" : "movie";

  return (
    <div className="relative w-full h-105 rounded-2xl overflow-hidden mb-10 shadow-2xl">
      {item.backdrop_path && (
        <Image
          src={`https://image.tmdb.org/t/p/w1280${item.backdrop_path}`}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 p-8 max-w-lg">
        <p className="text-xs uppercase tracking-widest text-zinc-400 mb-1">
          Em Alta Esta Semana
        </p>
        <h1 className="text-4xl font-extrabold mb-2 leading-tight">{title}</h1>
        <div className="flex items-center gap-2 text-yellow-400 text-sm font-bold mb-3">
          <Star size={14} fill="currentColor" />
          {item.vote_average.toFixed(1)}
        </div>
        <p className="text-zinc-300 text-sm line-clamp-2 mb-4">
          {item.overview}
        </p>
        <Link
          href={`/${type}/${item.id}`}
          className="inline-flex items-center gap-2 bg-white text-black font-extrabold px-6 py-2 rounded-full hover:bg-zinc-200 hover:px-8 hover:py-3 transition-all uppercase text-sm"
        >
          <Play size={16} fill="currentColor" /> Ver Detalhes
        </Link>
      </div>
    </div>
  );
}
