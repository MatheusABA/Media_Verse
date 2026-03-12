import { ReviewedMedia } from "@/src/types/review";
import { Star } from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";

export function ReviewedMediaCard({ item, type }: { item: ReviewedMedia; type: "movie" | "tv" }) {
  const href = item.tmdbId ? `/${type === "movie" ? "movie" : "serie"}/${item.tmdbId}` : "#"

  return (
    <NextLink href={href} className="group shrink-0 w-36 md:w-44">
      <div className="relative w-full aspect-2/3 rounded-xl overflow-hidden border-2 border-transparent group-hover:border-zinc-400 transition-all shadow-lg">
        {item.posterUrl ? (
          <Image
            src={item.posterUrl}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 144px, 176px"
          />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm">
            Sem imagem
          </div>
        )}
        {item.rating && (
          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-2 flex items-center gap-1 text-yellow-400 text-xs font-bold">
            <Star size={12} fill="currentColor" />
            {parseFloat(item.rating).toFixed(1)}
          </div>
        )}
      </div>
      <p className="mt-2 text-sm font-semibold text-zinc-200 truncate">
        {item.title}
      </p>
    </NextLink>
  );
}