"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, MapPin, Calendar, Film, Tv, Star, List } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { ProfileData } from "@/src/types/user";
import { ProfileHeader } from "@/src/components/profile/ProfileHeader";
import { ProfileStats } from "@/src/components/profile/ProfileStats";
import { ReviewedSection } from "@/src/components/profile/ReviewedSection";
import { uploadAvatar } from "@/src/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProfilePage() {
  const { token, isLoggedIn, initialized, fetchWithAuth } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchWithAuth(`${API_URL}/user/me/profile`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch profile");
        return r.json();
      })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
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
    } catch {
      alert("Erro ao enviar imagem");
    }
    setAvatarUploading(false);
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

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Link
          href="/reviews/new"
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-full shadow-lg transition text-sm uppercase"
        >
          Fazer review
        </Link>
      </div>
      <ProfileHeader
        user={user}
        memberSince={memberSince}
        onAvatarChange={handleAvatarChange}
        avatarUploading={avatarUploading}
      />
      <ProfileStats stats={stats} />
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
    </div>
  );
}
