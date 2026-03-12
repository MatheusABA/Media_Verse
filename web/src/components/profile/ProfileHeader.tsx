import Image from "next/image";
import {
  Clapperboard,
  TvMinimalPlay,
  MapPin,
  Calendar,
  Camera,
} from "lucide-react";
import { useRef, useState } from "react";
import { getFullUrl } from "@/src/utils/imageUrl";
import { ProfileStatsProps } from "./ProfileStats";

type ProfileHeaderProps = {
  user: {
    username: string;
    bio?: string | null;
    avatarUrl?: string | null;
    bannerUrl?: string | null;
    location?: string | null;
    createdAt: string;
  };
  memberSince: string;
  onAvatarChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBannerChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  avatarUploading?: boolean;
  bannerUploading?: boolean;
  actionButton?: React.ReactNode;
  extraActions?: React.ReactNode;
  stats: ProfileStatsProps["stats"];
};

export function ProfileHeader({
  user,
  memberSince,
  onAvatarChange,
  onBannerChange,
  avatarUploading = false,
  bannerUploading = false,
  actionButton,
  extraActions,
  stats,
}: ProfileHeaderProps) {
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [bannerHovered, setBannerHovered] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative mb-8 border-b border-zinc-800 pb-6 min-h-[220px] md:min-h-[300px]">
      {/* Banner no topo */}
      <div
        className="w-full h-40 md:h-82 rounded-xl overflow-hidden bg-zinc-800 relative "
        onMouseEnter={() => setBannerHovered(true)}
        onMouseLeave={() => setBannerHovered(false)}
      >
        {user.bannerUrl ? (
          <Image
            src={getFullUrl(user.bannerUrl) || ""}
            alt="Banner"
            fill
            className="object-cover"
            priority
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-zinc-800 to-zinc-900" />
        )}
        {/* Overlay de upload */}
        <label
          className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity cursor-pointer ${
            bannerHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={bannerInputRef}
            onChange={onBannerChange}
          />
          <Camera size={28} stroke="white" />
        </label>
        {bannerUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <svg
              className="animate-spin"
              width={32}
              height={32}
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="white"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="white"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Conteúdo do perfil */}
      <div className="relative flex items-end gap-5 px-2">
        {/* Avatar */}
        <div
          className="relative w-32 h-32 rounded-full bg-zinc-700 border-4 border-zinc-950 flex items-center justify-center shrink-0 shadow-xl overflow-hidden z-10"
          onMouseEnter={() => setAvatarHovered(true)}
          onMouseLeave={() => setAvatarHovered(false)}
        >
          {user.avatarUrl ? (
            <Image
              src={getFullUrl(user.avatarUrl) || ""}
              alt={user.username}
              width={96}
              height={96}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <span className="text-3xl font-extrabold text-zinc-300 uppercase">
              {user.username.charAt(0)}
            </span>
          )}
          <label
            className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity cursor-pointer ${
              avatarHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={avatarInputRef}
              onChange={onAvatarChange}
            />
            <Camera size={18} stroke="white" />
          </label>
          {avatarUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <svg
                className="animate-spin"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="white"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="white"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Info do usuário */}
        <div className="flex-1 flex flex-row items-end">
          {/* Bloco principal: username, bio, localização, etc. */}
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-extrabold leading-tight">
              @{user.username}
            </h1>
            {user.bio && (
              <p className="text-zinc-400 text-sm max-w-md">{user.bio}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-1 text-xs text-white">
              {user.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {user.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={12} /> Membro desde {memberSince}
              </span>
            </div>
            <div className="flex flex-row gap-5 align-baseline">
              <div className="flex flex-row gap-2">
                <p className="text-sm">-</p>
                <p className="text-sm font-light">Seguidores</p>
              </div>
              <div className="flex flex-row gap-2">
                <p className="text-sm">-</p>
                <p className="text-sm font-light">Seguindo</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 ml-8">
            <div className="flex items-center gap-2">
              <Clapperboard size={22} className="text-red-500" />
              <span className="text-2xl font-mono font-extrabold text-white">
                {stats.moviesWatched}
              </span>
              <span className="text-xs uppercase tracking-widest text-zinc-500">
                {stats.moviesWatched === 1
                  ? "Filme assistido"
                  : "Filmes assistidos"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TvMinimalPlay size={22} className="text-purple-500" />
              <span className="text-2xl font-mono font-extrabold text-white">
                {stats.seriesWatched}
              </span>
              <span className="text-xs uppercase tracking-widest text-zinc-500">
                {stats.seriesWatched === 1
                  ? "Série assistida"
                  : "Séries assistidas"}
              </span>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        {/* <div className="flex gap-2 mb-1">
          {extraActions}
          {actionButton}
        </div> */}
      </div>
    </div>
  );
}
