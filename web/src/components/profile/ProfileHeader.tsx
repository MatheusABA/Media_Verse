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
  bannerInputKey?: number;
  stats: ProfileStatsProps["stats"];
};

export function ProfileHeader({
  user,
  memberSince,
  onAvatarChange,
  onBannerChange,
  avatarUploading = false,
  bannerUploading = false,
  stats,
  bannerInputKey,
}: ProfileHeaderProps) {
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [bannerHovered, setBannerHovered] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative mb-2  border-b border-zinc-800 pb-4">
      {/* Banner com card de perfil sobreposto */}
      <div
        className="w-full h-92 aspect-16/5 rounded-xl overflow-hidden bg-zinc-800 relative"
        onMouseEnter={() => setBannerHovered(true)}
        onMouseLeave={() => setBannerHovered(false)}
      >
        {/* Imagem do banner */}
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
          <div className="absolute inset-0 bg-linear-to-br from-zinc-800 to-zinc-900" />
        )}

        {/* Overlay de upload do banner */}
        <label
          className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity cursor-pointer z-20 ${
            bannerHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <input
            key={bannerInputKey}
            type="file"
            accept="image/*"
            className="hidden"
            ref={bannerInputRef}
            onChange={onBannerChange}
          />
          <Camera size={28} stroke="white" />
        </label>

        {bannerUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30">
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

        {/* Card de perfil */}
        <div
          className="absolute bottom-0 left-0 right-0 p-3 z-30"
          onMouseEnter={(e) => {
            e.stopPropagation();
            setBannerHovered(false);
          }}
        >
          <div className="bg-zinc-900/80 backdrop-blur-md rounded-xl p-4 flex items-center gap-5">
            {/* Avatar */}
            <div
              className="relative w-20 h-20 rounded-full bg-zinc-700 border-4 border-zinc-950 flex items-center justify-center shrink-0 shadow-xl overflow-hidden"
              onMouseEnter={() => setAvatarHovered(true)}
              onMouseLeave={() => setAvatarHovered(false)}
            >
              {user.avatarUrl ? (
                <Image
                  src={getFullUrl(user.avatarUrl) || ""}
                  alt={user.username}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : (
                <span className="text-2xl font-extrabold text-zinc-300 uppercase">
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
                <Camera size={16} stroke="white" />
              </label>
              {avatarUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <svg
                    className="animate-spin"
                    width={20}
                    height={20}
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
            <div className="flex-1 flex flex-row items-center">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-extrabold leading-tight text-white">
                  @{user.username}
                </h1>
                {user.bio && (
                  <p className="text-zinc-300 text-sm max-w-md">{user.bio}</p>
                )}
                <div className="flex flex-wrap gap-4 mt-0.5 text-xs text-zinc-300">
                  {user.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {user.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> Membro desde {memberSince}
                  </span>
                </div>
                <div className="flex flex-row gap-5">
                  <div className="flex flex-row gap-2">
                    <p className="text-sm text-white">-</p>
                    <p className="text-sm font-light text-zinc-300">
                      Seguidores
                    </p>
                  </div>
                  <div className="flex flex-row gap-2">
                    <p className="text-sm text-white">-</p>
                    <p className="text-sm font-light text-zinc-300">Seguindo</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start gap-2 ml-auto">
                <div className="flex items-center gap-2">
                  <Clapperboard size={18} className="text-red-500" />
                  <span className="text-xl font-mono font-extrabold text-white">
                    {stats.moviesWatched}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-zinc-400">
                    {stats.moviesWatched === 1
                      ? "Filme assistido"
                      : "Filmes assistidos"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TvMinimalPlay size={18} className="text-purple-500" />
                  <span className="text-xl font-mono font-extrabold text-white">
                    {stats.seriesWatched}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-zinc-400">
                    {stats.seriesWatched === 1
                      ? "Série assistida"
                      : "Séries assistidas"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
