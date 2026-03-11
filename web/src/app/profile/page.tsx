"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, User, Heart } from "lucide-react";
import { Pencil } from "lucide-react";
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

type FavoriteItem = {
  id: string;
  mediaId: string;
  tmdbId: string | null;
  title: string;
  type: string;
  posterUrl: string | null;
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
  const [editMedia, setEditMedia] = useState<UserMediaItem | null>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

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

  useEffect(() => {
    if (!token) return;
    fetchWithAuth(`${API_URL}/user-favorites`)
      .then((r) => r.json())
      .then(setFavorites)
      .catch(() => {});
  }, [token, fetchWithAuth]);

  async function toggleFavorite(item: {
    tmdbId: string | null;
    type: string;
    title: string;
    posterUrl: string | null;
  }) {
    if (!item.tmdbId) return;
    const existing = favorites.find((f) => f.tmdbId === item.tmdbId);
    if (existing) {
      await fetchWithAuth(`${API_URL}/user-favorites/${existing.mediaId}`, {
        method: "DELETE",
      });
      setFavorites((prev) => prev.filter((f) => f.tmdbId !== item.tmdbId));
    } else {
      const res = await fetchWithAuth(`${API_URL}/user-favorites`, {
        method: "POST",
        body: JSON.stringify({
          tmdbId: item.tmdbId,
          type: item.type,
          title: item.title,
          posterUrl: item.posterUrl,
        }),
      });
      if (res.ok) {
        const newFav = await res.json();
        setFavorites((prev) => [
          {
            id: newFav.id,
            mediaId: newFav.mediaId,
            tmdbId: item.tmdbId,
            title: item.title,
            type: item.type,
            posterUrl: item.posterUrl,
            createdAt: newFav.createdAt,
          },
          ...prev,
        ]);
      }
    }
  }

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
    favorite: boolean;
  }) {
    const res = await fetchWithAuth(`${API_URL}/user-media`, {
      method: "POST",
      body: JSON.stringify(mediaData),
    });
    if (res.ok) {
      const listRes = await fetchWithAuth(`${API_URL}/user-media`);
      if (listRes.ok) setRecentMedia(await listRes.json());
    }

    const isCurrentlyFavorited = favorites.some(
      (f) => f.tmdbId === mediaData.tmdbId,
    );
    if (mediaData.favorite && !isCurrentlyFavorited) {
      const favRes = await fetchWithAuth(`${API_URL}/user-favorites`, {
        method: "POST",
        body: JSON.stringify({
          tmdbId: mediaData.tmdbId,
          type: mediaData.type,
          title: mediaData.title,
          posterUrl: mediaData.posterUrl,
          releaseDate: mediaData.releaseDate,
          description: mediaData.description,
        }),
      });
      if (favRes.ok) {
        const newFav = await favRes.json();
        setFavorites((prev) => [
          {
            id: newFav.id,
            mediaId: newFav.mediaId,
            tmdbId: mediaData.tmdbId,
            title: mediaData.title,
            type: mediaData.type,
            posterUrl: mediaData.posterUrl,
            createdAt: newFav.createdAt,
          },
          ...prev,
        ]);
      }
    } else if (!mediaData.favorite && isCurrentlyFavorited) {
      const existing = favorites.find((f) => f.tmdbId === mediaData.tmdbId);
      if (existing) {
        await fetchWithAuth(`${API_URL}/user-favorites/${existing.mediaId}`, {
          method: "DELETE",
        });
        setFavorites((prev) =>
          prev.filter((f) => f.tmdbId !== mediaData.tmdbId),
        );
      }
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
      <ProfileStats stats={{ ...stats, favoritesCount: favorites.length }} />

      <ReviewedSection
        title="Top 5 Filmes"
        items={reviewedMovies}
        type="movie"
      />

      <ReviewedSection title="Top 5 Séries" items={reviewedSeries} type="tv" />

      {/* Sessão de Favoritos */}
      {favorites.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2">
            <Heart size={20} className="text-red-500 fill-red-500" />
            Favoritos
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {favorites.slice(0, 10).map((item) => (
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
                  <span
                    className={`absolute bottom-1 left-1 px-2 py-0.5 rounded text-xs font-bold
                    ${item.type === "movie" ? "bg-blue-600" : "bg-purple-600"} text-white`}
                  >
                    {item.type === "tv" ? "Série" : "Filme"}
                  </span>
                  <button
                    className="absolute top-1 right-1 bg-black/60 p-1 rounded z-20 opacity-0 group-hover:opacity-100 transition"
                    title="Remover dos favoritos"
                    onClick={async (e) => {
                      e.preventDefault();
                      await toggleFavorite(item);
                    }}
                  >
                    <Heart size={16} className="text-red-500 fill-red-500" />
                  </button>
                </div>
                <p className="text-sm font-bold mt-1 truncate">{item.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recentMedia.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-extrabold mb-4">Últimos adicionados</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentMedia.slice(0, 10).map((item) => {
              const isFavorited = favorites.some(
                (f) => f.tmdbId === item.tmdbId,
              );
              return (
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
                    <span
                      className={`absolute bottom-1 left-1 px-2 py-0.5 rounded text-xs font-bold
                      ${item.type === "movie" ? "bg-blue-600" : "bg-purple-600"} text-white`}
                    >
                      {item.type === "tv" ? "Série" : "Filme"}
                    </span>
                    {item.rating && (
                      <span className="absolute top-1 right-1 bg-yellow-500 text-black text-xs font-extrabold px-1.5 py-0.5 rounded">
                        {item.rating}
                      </span>
                    )}
                    {/* Heart toggle */}
                    <button
                      className="absolute top-1 left-1 bg-black/60 p-1 rounded z-20 opacity-0 group-hover:opacity-100 transition"
                      title={
                        isFavorited ? "Remover dos favoritos" : "Favoritar"
                      }
                      onClick={async (e) => {
                        e.preventDefault();
                        await toggleFavorite(item);
                      }}
                    >
                      <Heart
                        size={16}
                        className={
                          isFavorited
                            ? "text-red-500 fill-red-500"
                            : "text-zinc-300"
                        }
                      />
                    </button>
                    <div className="absolute bottom-1 right-1 flex flex-col gap-1 z-20 opacity-0 group-hover:opacity-100 transition">
                      <button
                        className="bg-black/50 text-white p-1 rounded transition"
                        title="Editar avaliação"
                        onClick={(e) => {
                          e.preventDefault();
                          setEditMedia(item);
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="bg-red-600/80 text-white p-1 rounded hover:bg-red-700 transition"
                        title="Remover mídia"
                        onClick={async (e) => {
                          e.preventDefault();
                          if (
                            confirm(
                              "Tem certeza que deseja remover esta mídia?",
                            )
                          ) {
                            await fetchWithAuth(
                              `${API_URL}/user-media/${item.id}`,
                              {
                                method: "DELETE",
                              },
                            );
                            setRecentMedia((prev) =>
                              prev.filter((m) => m.id !== item.id),
                            );
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-bold mt-1 truncate">
                    {item.title}
                  </p>
                  <span
                    className={`
                      inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase
                      ${
                        item.status === "watched"
                          ? "bg-green-600 text-white"
                          : item.status === "watching"
                            ? "bg-blue-600 text-white"
                            : item.status === "plan_to_watch"
                              ? "bg-zinc-700 text-zinc-200"
                              : item.status === "dropped"
                                ? "bg-red-600 text-white"
                                : "bg-zinc-500 text-white"
                      }
                    `}
                  >
                    {STATUS_LABELS[item.status ?? ""] ?? item.status}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <AddMediaModal
        open={modalOpen || !!editMedia}
        onClose={() => {
          setModalOpen(false);
          setEditMedia(null);
        }}
        onSave={async (mediaData) => {
          await handleAddMedia(mediaData);
          setEditMedia(null);
        }}
        initialData={
          editMedia
            ? {
                title: editMedia.title,
                type: editMedia.type as "movie" | "tv",
                posterUrl: editMedia.posterUrl,
                tmdbId: editMedia.tmdbId ?? "",
                status: editMedia.status ?? "watched",
                rating: editMedia.rating ?? "",
                isFavorite: favorites.some(
                  (f) => f.tmdbId === editMedia.tmdbId,
                ),
              }
            : undefined
        }
      />
    </div>
  );
}
