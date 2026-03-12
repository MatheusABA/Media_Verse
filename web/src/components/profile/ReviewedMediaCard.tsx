import { TopMediaItem } from "@/src/types/review";
import { Star, X } from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";

export function ReviewedMediaCard({
  item,
  type,
  onRemove,
  index,
}: {
  item: TopMediaItem;
  type: "movie" | "tv";
  onRemove?: () => void;
  index?: number;
}) {
  const href = item.tmdbId
    ? `/${type === "movie" ? "movie" : "serie"}/${item.tmdbId}`
    : "#";

  const rankColors = [
    "bg-yellow-400 text-yellow-900", // Ouro
    "bg-zinc-300 text-zinc-800", // Prata
    "bg-orange-500 text-white", // Bronze
    "bg-zinc-700 text-white", // 4º e 5º
    "bg-zinc-700 text-white",
  ];

  return (
    <div className="relative group shrink-0 w-full">
      {typeof index === "number" && (
        <span
          className={`
            absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full text-xs font-black shadow
            ${rankColors[index] ?? "bg-zinc-700 text-white"}
          `}
          style={{ minWidth: 24, textAlign: "center" }}
        >
          {index + 1}
        </span>
      )}
      <NextLink href={href} className="block">
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
        <p className="mt-2 text-sm font-semibold text-zinc-200 wrap">
          {item.title}
        </p>
      </NextLink>

      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirm("Remover do Top 5?")) {
              onRemove();
            }
          }}
          className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-700 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition z-10"
          title="Remover do Top 5"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
