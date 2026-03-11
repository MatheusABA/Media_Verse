"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { ProfileData } from "@/src/types/user";
import { ProfileHeader } from "@/src/components/profile/ProfileHeader";
import { ProfileStats } from "@/src/components/profile/ProfileStats";
import { ReviewedSection } from "@/src/components/profile/ReviewedSection";
import { AddMediaModal } from "@/src/components/profile/AddMediaModal";
import { uploadAvatar } from "@/src/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type UserMediaItem = {
  id: string;
  title: string;
  type: string;
  posterUrl: string | null;
  tmdbId: string | null;
  status: string | null;
  rating: string | null;
  watchedAt: string | null;
  createdAt: string;
};

export default function ProfilePage() {
  const { token, isLoggedIn, initialized, fetchWithAuth, updateUser } =
    useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [recentMedia, setRecentMedia] = useState<UserMediaItem[]>([]);

  useEffect(() => {
    if (!token) return;
    fetchWithAuth(`${API_URL}/user/me/profile`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch profile");
        return r.json();
      })
      .then((profileData) => {
        setData(profileData);
        updateUser({
          id: profileData.user.id,
          username: profileData.user.username,
          email: profileData.user.email,
          bio: profileData.user.bio,
          avatarUrl: profileData.user.avatarUrl,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, fetchWithAuth]);

  useEffect(() => {
    if (!token) return;
    fetchWithAuth(`${API_URL}/user-media`)
      .then((r) => r.json())
      .then(setRecentMedia)
      .catch(() => {});
  }, [token, fetchWithAuth]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setAvatarUploading(true);
    try {
      const { avatarUrl } = await uploadAvatar(file, token);
      setData((prev) =>
        prev ? { ...prev, user: { ...prev.user, avatarUrl } } : prev,
      );
      updateUser({ avatarUrl });
    } catch {
      alert("Erro ao enviar imagem");
    }
    setAvatarUploading(false);
  }

  async function handleAddMedia(mediaData: {
    tmdbId: string;
    type: "movie" | "tv";
    title: string;
    posterUrl: string | null;
    releaseDate: string | null;
    description: string | null;
    status: string;
    rating: string | null;
  }) {
    const res = await fetchWithAuth(`${API_URL}/user-media`, {
      method: "POST",
      body: JSON.stringify(mediaData),
    });
    if (res.ok) {
      const listRes = await fetchWithAuth(`${API_URL}/user-media`);
      if (listRes.ok) setRecentMedia(await listRes.json());
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-400">
        <User size={48} />
        <p className="text-lg font-bold">
          Você precisa estar logado para ver seu perfil.
        </p>
        <Link
          href="/login"
          className="px-6 py-2 bg-white text-black font-extrabold rounded-full hover:bg-zinc-200 transition uppercase text-sm"
        >
          Entrar
        </Link>
      </div>
    );
  }

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        Carregando...
      </div>
    );
  }

  if (!data) return null;

  const { user, stats, reviewedMovies, reviewedSeries } = data;
  const memberSince = new Date(user.createdAt).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const STATUS_LABELS: Record<string, string> = {
    plan_to_watch: "Pretendo assistir",
    watching: "Assistindo",
    watched: "Assistido",
    dropped: "Desistiu",
  };

  return (
    <div>
      <ProfileHeader
        user={user}
        memberSince={memberSince}
        onAvatarChange={handleAvatarChange}
        avatarUploading={avatarUploading}
        actionButton={
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-full shadow-lg transition text-sm uppercase"
          >
            Adicionar mídia
          </button>
        }
      />
      <ProfileStats stats={stats} />

      {/* Últimos Vistos */}
      {recentMedia.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-extrabold mb-4">Últimos adicionados</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentMedia.slice(0, 10).map((item) => (
              <Link
                key={item.id}
                href={`/${item.type === "movie" ? "movie" : "serie"}/${item.tmdbId}`}
                className="shrink-0 w-36 group"
              >
                <div className="relative w-36 h-52 rounded-lg overflow-hidden bg-zinc-800">
                  {item.posterUrl ? (
                    <Image
                      src={item.posterUrl}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-600 text-xs">
                      Sem poster
                    </div>
                  )}
                  {item.rating && (
                    <span className="absolute top-1 right-1 bg-yellow-500 text-black text-xs font-extrabold px-1.5 py-0.5 rounded">
                      {item.rating}
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold mt-1 truncate">{item.title}</p>
                <p className="text-xs text-zinc-500">
                  {STATUS_LABELS[item.status ?? ""] ?? item.status}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ReviewedSection
        title="Filmes Favoritos"
        items={reviewedMovies}
        type="movie"
      />
      <ReviewedSection
        title="Séries Favoritas"
        items={reviewedSeries}
        type="tv"
      />

      <AddMediaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddMedia}
      />
    </div>
  );
}
