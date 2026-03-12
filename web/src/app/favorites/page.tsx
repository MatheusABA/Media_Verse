"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useAuth } from "@/src/contexts/AuthContext";
import Link from "next/link";
import { Heart } from "lucide-react"; // ou outro ícone

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type FavoriteItem = {
  id: string;
  mediaId: string;
  title: string;
  posterUrl: string | null;
  type: string;
  tmdbId: string | null;
  createdAt: string;
};

type Meta = {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

const TYPE_FILTERS = [
  { label: "Todos", value: "" },
  { label: "Filmes", value: "movie" },
  { label: "Séries", value: "tv" },
];

export default function FavoritesPage() {
  const { token, isLoggedIn, fetchWithAuth } = useAuth();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [meta, setMeta] = useState<Meta>({
    total: 0,
    page: 1,
    perPage: 20,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce para busca
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (typeFilter) params.set("type", typeFilter);
    if (debouncedSearch) params.set("search", debouncedSearch);

    fetchWithAuth(`${API_URL}/user-favorites?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setMeta(data.meta ?? { total: 0, page: 1, perPage: 20, totalPages: 1 });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, page, typeFilter, debouncedSearch]);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-400">
        <p className="text-lg font-bold">Você precisa estar logado.</p>
      </div>
    );
  }

  return (
    <div className="w-full py-6 px-2 sm:px-4">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-white mb-1">
          Meus Favoritos
        </h1>
        <div className="flex gap-2 flex-wrap">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setTypeFilter(f.value);
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition ${
                typeFilter === f.value
                  ? "bg-white text-black"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input de busca */}
      <div className="relative mb-6 max-w-md">
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl pl-4 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600 transition"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-zinc-500 text-sm">
          Carregando...
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
          <p className="font-bold text-base">Nenhum favorito encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow flex flex-col relative"
            >
              <Link
                href={`/${item.type === "movie" ? "movie" : "serie"}/${item.tmdbId}`}
                className="flex-1 flex flex-col"
              >
                <div className="relative w-full aspect-square bg-zinc-700">
                  {item.posterUrl ? (
                    <Image
                      src={item.posterUrl}
                      alt={item.title}
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
                <div className="p-3 flex-1 flex flex-col">
                  <span className="font-bold text-white text-sm mb-1 truncate">
                    {item.title}
                  </span>
                  <span className="text-xs text-zinc-400 uppercase">
                    {item.type === "movie" ? "Filme" : "Série"}
                  </span>
                </div>
              </Link>
              <button
                className="absolute top-2 right-2 bg-black/60 p-1 rounded hover:bg-red-600 transition"
                title="Remover dos favoritos"
                onClick={async (e) => {
                  e.preventDefault();
                  const confirmed = window.confirm(
                    "Tem certeza que deseja remover dos favoritos?",
                  );
                  if (!confirmed) return;
                  await fetchWithAuth(
                    `${API_URL}/user-favorites/${item.mediaId}`,
                    { method: "DELETE" },
                  );
                  setItems((prev) => prev.filter((f) => f.id !== item.id));
                }}
              >
                <Heart size={18} className="text-red-500 fill-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-5 py-2 bg-zinc-800 text-white font-bold rounded-lg disabled:opacity-40 hover:bg-zinc-700 transition text-sm"
          >
            ← Anterior
          </button>
          <span className="text-zinc-400 text-sm font-bold">
            Página {meta.page} de {meta.totalPages}
          </span>
          <button
            disabled={page === meta.totalPages}
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            className="px-5 py-2 bg-zinc-800 text-white font-bold rounded-lg disabled:opacity-40 hover:bg-zinc-700 transition text-sm"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
