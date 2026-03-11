import Image from "next/image";
import { MapPin, Calendar } from "lucide-react";
import { useRef, useState } from "react";
import { getFullUrl } from "@/src/utils/imageUrl";

type ProfileHeaderProps = {
  user: {
    username: string;
    bio?: string | null;
    avatarUrl?: string | null;
    location?: string | null;
    createdAt: string;
  };
  memberSince: string;
  onAvatarChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  avatarUploading?: boolean;
};

export function ProfileHeader({
  user,
  memberSince,
  onAvatarChange,
  avatarUploading = false,
}: ProfileHeaderProps) {
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-end gap-6 mb-8 pb-8 border-b border-zinc-800">
      <div
        className="relative w-24 h-24 rounded-full bg-zinc-700 border-4 border-zinc-600 flex items-center justify-center shrink-0 shadow-xl overflow-hidden group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
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
        {/* Overlay de upload */}
        <label
          className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity cursor-pointer ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={inputRef}
            onChange={onAvatarChange}
          />
          <svg
            width={32}
            height={32}
            fill="none"
            stroke="white"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M12 16v-4m0 0V8m0 4h4m-4 0H8m12 4v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" />
          </svg>
        </label>
        {/* Overlay de loading */}
        {avatarUploading && (
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
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold leading-tight">
          {user.username}
        </h1>
        {user.bio && (
          <p className="text-zinc-400 text-sm max-w-md">{user.bio}</p>
        )}
        <div className="flex flex-wrap gap-4 mt-1 text-xs text-zinc-500">
          {user.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {user.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={12} /> Membro desde {memberSince}
          </span>
        </div>
      </div>
    </div>
  );
}
