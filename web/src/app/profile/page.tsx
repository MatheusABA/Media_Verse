"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, User, Heart, FileText, Star } from "lucide-react";
import { Pencil } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { ProfileData } from "@/src/types/user";
import { ProfileHeader } from "@/src/components/profile/ProfileHeader";
import { ProfileStats } from "@/src/components/profile/ProfileStats";
import { ReviewedSection } from "@/src/components/profile/ReviewedSection";
import { AddMediaModal } from "@/src/components/profile/AddMediaModal";
import { uploadAvatar, uploadBanner } from "@/src/lib/api";
import { ReviewModal } from "@/src/components/profile/ReviewModal";
import { TopMediaItem } from "@/src/types/review";

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
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [topMedia, setTopMedia] = useState<{
    movies: TopMediaItem[];
    series: TopMediaItem[];
  }>({ movies: [], series: [] });

  const [bannerUploading, setBannerUploading] = useState(false);

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
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchWithAuth(`${API_URL}/user-media`)
      .then((r) => r.json())
      .then(setRecentMedia)
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchWithAuth(`${API_URL}/user-favorites`)
      .then((r) => r.json())
      .then(setFavorites)
      .catch(() => {});
  }, [token]);

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

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setBannerUploading(true);
    try {
      const { bannerUrl } = await uploadBanner(file, token);
      setData((prev) =>
        prev ? { ...prev, user: { ...prev.user, bannerUrl } } : prev,
      );
      updateUser({ bannerUrl });
    } catch {
      alert("Erro ao enviar banner");
    }
    setBannerUploading(false);
  }

async function refreshProfile() {
  if (!token) return;
  const res = await fetchWithAuth(`${API_URL}/user/me/profile`);
  if (res.ok) {
    const profileData = await res.json();
    setData(profileData);
    updateUser({
      id: profileData.user.id,
      username: profileData.user.username,
      email: profileData.user.email,
      bio: profileData.user.bio,
      avatarUrl: profileData.user.avatarUrl,
    });
  }
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
      await refreshProfile();
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

  const editModalData = useMemo(
    () =>
      editMedia
        ? {
            title: editMedia.title,
            type: editMedia.type as "movie" | "tv",
            posterUrl: editMedia.posterUrl,
            tmdbId: editMedia.tmdbId ?? "",
            status: editMedia.status ?? "watched",
            rating: editMedia.rating ?? "",
            isFavorite: favorites.some((f) => f.tmdbId === editMedia.tmdbId),
          }
        : undefined,
    [editMedia, favorites],
  );

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

  const lastReview =
    [
      ...reviewedMovies.map((r) => ({ ...r, mediaType: "movie" as const })),
      ...reviewedSeries.map((r) => ({ ...r, mediaType: "tv" as const })),
    ].sort(
      (a, b) =>
        new Date(b.reviewCreatedAt).getTime() -
        new Date(a.reviewCreatedAt).getTime(),
    )[0] ?? null;

  return (
    <div>
      <ProfileHeader
        user={user}
        memberSince={memberSince}
        onAvatarChange={handleAvatarChange}
        avatarUploading={avatarUploading}
        onBannerChange={handleBannerChange}
        bannerUploading={bannerUploading}
        extraActions={
          <button
            onClick={() => setReviewModalOpen(true)}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-lg shadow-lg transition text-sm uppercase"
          >
            Fazer Review
          </button>
        }
        actionButton={
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-lg shadow-lg transition text-sm uppercase"
          >
            Adicionar mídia
          </button>
        }
        stats={stats}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <ProfileStats
            stats={{ ...stats, favoritesCount: favorites.length }}
            onAddMedia={() => setModalOpen(true)}
            onAddReview={() => setReviewModalOpen(true)}
          />
          <ReviewedSection
            title="Top 5 Filmes"
            items={topMedia.movies}
            type="movie"
          />

          <ReviewedSection
            title="Top 5 Séries"
            items={topMedia.series}
            type="tv"
          />

          {recentMedia.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-extrabold mb-4">
                Últimos adicionados
              </h2>
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
                                await refreshProfile();
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

          {lastReview && (
            <section className="mb-8">
              <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2">
                <FileText size={20} className="text-purple-400" />
                Minha última review
              </h2>
              <Link
                href={`/${lastReview.mediaType === "movie" ? "movie" : "serie"}/${lastReview.tmdbId}`}
                className="flex items-start gap-4 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700 rounded-xl p-3 transition group"
              >
                <div className="relative w-12 h-18 shrink-0 rounded-lg overflow-hidden bg-zinc-700">
                  {lastReview.posterUrl ? (
                    <Image
                      src={lastReview.posterUrl}
                      alt={lastReview.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                      ?
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-white truncate">
                      {lastReview.title}
                    </p>
                    {lastReview.rating && (
                      <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold shrink-0">
                        <Star size={12} fill="currentColor" />
                        {parseFloat(lastReview.rating).toFixed(1)}
                      </span>
                    )}
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${lastReview.mediaType === "movie" ? "bg-blue-600" : "bg-purple-600"} text-white`}
                    >
                      {lastReview.mediaType === "movie" ? "Filme" : "Série"}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 line-clamp-2">
                    {lastReview.reviewContent}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    {new Date(lastReview.reviewCreatedAt).toLocaleDateString(
                      "pt-BR",
                    )}
                  </p>
                </div>
              </Link>
            </section>
          )}
        </div>
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-zinc-900 rounded-xl p-4">
            <h3 className="text-base font-bold mb-3 text-zinc-200">
              Estatísticas pessoais
            </h3>
            <p className="text-zinc-500 text-sm italic">Em breve...</p>
          </div>
        </aside>
      </div>
      <AddMediaModal
        key={editMedia?.id ?? (modalOpen ? "add-new" : "closed")}
        open={modalOpen || !!editMedia}
        onClose={() => {
          setModalOpen(false);
          setEditMedia(null);
        }}
        onSave={async (mediaData) => {
          await handleAddMedia(mediaData);
          setEditMedia(null);
        }}
        initialData={editModalData}
      />

      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        mediaList={recentMedia}
        fetchWithAuth={fetchWithAuth}
        apiUrl={API_URL ?? ""}
      />
    </div>
  );
}
