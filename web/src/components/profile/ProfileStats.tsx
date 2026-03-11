import { Film, Tv, Star, List, Heart } from "lucide-react";

type ProfileStatsProps = {
  stats: {
    moviesWatched: number;
    seriesWatched: number;
    reviewsCount: number;
    listsCount: number;
    favoritesCount?: number;
  };
};

export function ProfileStats({ stats }: ProfileStatsProps) {
  const items = [
    {
      icon: <Film size={20} color="red" />,
      label: "Filmes Assistidos",
      value: stats.moviesWatched,
    },
    {
      icon: <Tv size={20} color="purple" />,
      label: "Séries Assistidas",
      value: stats.seriesWatched,
    },
    {
      icon: <Heart size={20} color="red" />,
      label: "Favoritos",
      value: stats.favoritesCount ?? 0,
    },
    {
      icon: <Star size={20} color="yellow" />,
      label: "Reviews",
      value: stats.reviewsCount,
    },
    {
      icon: <List size={20} color="green" />,
      label: "Listas",
      value: stats.listsCount,
    },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 mb-10 gap-4">
      {items.map(({ icon, label, value }) => (
        <div
          key={label}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2"
        >
          <div className="text-zinc-400">{icon}</div>
          <span className="text-2xl font-extrabold">{value}</span>
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wide">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
