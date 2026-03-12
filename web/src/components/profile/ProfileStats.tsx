import { Star, FolderOpen, Heart, Plus, Pencil } from "lucide-react";

export type ProfileStatsProps = {
  stats: {
    reviewsCount: number;
    listsCount: number;
    favoritesCount?: number;
    moviesWatched?: number;
    seriesWatched?: number;
  };
  onAddMedia?: () => void;
  onAddReview?: () => void;
};

export function ProfileStats({
  stats,
  onAddMedia,
  onAddReview,
}: ProfileStatsProps) {
  const actionCards = [
    {
      icon: <Plus size={24} />,
      label: "Adicionar mídia",
      onClick: onAddMedia,
      bg: "bg-green-900 hover:bg-green-600",
    },
    {
      icon: <Pencil size={24} />,
      label: "Fazer review",
      onClick: onAddReview,
      bg: "bg-purple-900 hover:bg-purple-600",
    },
  ];

  // Cards de estatísticas normais
  const statCards = [
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
      icon: <FolderOpen size={20} color="green" />,
      label: "Listas",
      value: stats.listsCount,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 mb-10 gap-3 w-240">
      {actionCards.map(({ icon, label, onClick, bg }) => (
        <button
          key={label}
          onClick={onClick}
          className={`flex flex-col items-center justify-center min-h-22.5 rounded-lg ${bg} transition text-white font-bold gap-2 focus:outline-none focus:ring-2 focus:ring-purple-400`}
          type="button"
        >
          {icon}
          <span className="text-xs uppercase tracking-wide">{label}</span>
        </button>
      ))}
      {statCards.map(({ icon, label, value }) => (
        <div
          key={label}
          className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex flex-col gap-1 items-center min-h-22.5"
        >
          <div className="text-zinc-400">{icon}</div>
          <span className="text-xl font-extrabold">{value}</span>
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wide text-center">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
