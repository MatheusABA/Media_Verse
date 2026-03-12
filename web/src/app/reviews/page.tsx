"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Search, FileText, User, Trash2, Edit2 } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { SimpleReviewModal } from "@/src/components/reviews/SimpleReviewModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type EvaluationItem = {
  userMediaId: string;
  status: string;
  rating: string | null;
  addedAt: string;
  mediaId: string;
  title: string;
  posterUrl: string | null;
  type: string;
  tmdbId: string | null;
  reviewId: string | null;
  reviewContent: string | null;
  reviewCreatedAt: string | null;
};

type Meta = {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

const STATUS_LABELS: Record<string, string> = {
  plan_to_watch: "Pretendo assistir",
  watching: "Assistindo",
  watched: "Assistido",
  dropped: "Desistiu",
};

const STATUS_COLORS: Record<string, string> = {
  watched: "bg-green-600",
  watching: "bg-blue-600",
  plan_to_watch: "bg-zinc-700",
  dropped: "bg-red-600",
};

const TYPE_FILTERS = [
  { label: "Todos", value: "" },
  { label: "Filmes", value: "movie" },
  { label: "Séries", value: "tv" },
];

const STATUS_FILTERS = [
  { label: "Qualquer status", value: "" },
  { label: "Assistido", value: "watched" },
  { label: "Assistindo", value: "watching" },
  { label: "Pretendo", value: "plan_to_watch" },
  { label: "Desistiu", value: "dropped" },
];

export default function ReviewsPage() {
  const { token, isLoggedIn, fetchWithAuth } = useAuth();
  const [items, setItems] = useState<EvaluationItem[]>([]);
  const [meta, setMeta] = useState<Meta>({
    total: 0,
    page: 1,
    perPage: 20,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<EvaluationItem | null>(null);
  const [reviewMode, setReviewMode] = useState<"create" | "edit">("create");

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
    setPage(1);
  }, [typeFilter, statusFilter]);

  const fetchEvaluations = () => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (typeFilter) params.set("type", typeFilter);
    if (statusFilter) params.set("status", statusFilter);

    fetchWithAuth(`${API_URL}/reviews/my-evaluations?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setMeta(data.meta ?? { total: 0, page: 1, perPage: 20, totalPages: 1 });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvaluations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, debouncedSearch, typeFilter, statusFilter]);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-400">
        <User size={48} />
        <p className="text-lg font-bold">Você precisa estar logado.</p>
        <Link
          href="/login"
          className="px-6 py-2 bg-white text-black font-extrabold rounded-full hover:bg-zinc-200 transition uppercase text-sm"
        >
          Entrar
        </Link>
      </div>
    );
  }

  const handleDeleteUserMedia = async (userMediaId: string, title: string) => {
    if (
      !window.confirm(
        `Tem certeza que deseja excluir "${title}"? Isso também apagará qualquer review associada.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetchWithAuth(
        `${API_URL}/user-media/${userMediaId}`,
        {
          method: "DELETE",
        },
      );
      if (response.ok) {
        setItems(items.filter((item) => item.userMediaId !== userMediaId));
      } else {
        alert("Erro ao excluir item");
      }
    } catch (error) {
      console.error("Erro ao deletar user_media:", error);
      alert("Erro ao excluir item");
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto py-6 px-2">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-white mb-1">
            Minhas Avaliações
          </h1>
          <p className="text-zinc-500 text-sm">
            {loading
              ? "..."
              : `${meta.total} ${meta.total === 1 ? "avaliação" : "avaliações"}`}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition ${
                typeFilter === f.value
                  ? "bg-white text-black"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
          <div className="w-px bg-zinc-700 self-stretch mx-1" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition ${
                statusFilter === f.value
                  ? "bg-white text-black"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-zinc-500 text-sm">
            Carregando...
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
            <FileText size={44} />
            <p className="font-bold text-base">Nenhuma avaliação encontrada.</p>
            {(search || typeFilter || statusFilter) && (
              <button
                onClick={() => {
                  setSearch("");
                  setTypeFilter("");
                  setStatusFilter("");
                }}
                className="text-xs text-zinc-400 underline underline-offset-2"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <Link
                key={item.userMediaId}
                href={`/${item.type === "movie" ? "movie" : "serie"}/${item.tmdbId}`}
                className="flex items-start gap-4 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition"
              >
                {/* Poster */}
                <div
                  className="relative w-11 shrink-0 rounded overflow-hidden bg-zinc-700"
                  style={{ aspectRatio: "2/3" }}
                >
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

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-extrabold text-white text-base truncate">
                      {item.title}
                    </p>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${
                        item.type === "movie" ? "bg-blue-600" : "bg-purple-600"
                      } text-white`}
                    >
                      {item.type === "movie" ? "Filme" : "Série"}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        STATUS_COLORS[item.status] ?? "bg-zinc-600"
                      } text-white`}
                    >
                      {STATUS_LABELS[item.status] ?? item.status}
                    </span>
                    {item.rating && (
                      <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold shrink-0 ml-auto">
                        <Star size={12} fill="currentColor" />
                        {parseFloat(item.rating).toFixed(1)}
                      </span>
                    )}
                  </div>

                  {item.reviewContent ? (
                    <div className="flex flex-col gap-2 mt-1">
                      <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                        {item.reviewContent}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded transition"
                          onClick={(e) => {
                            e.preventDefault();
                            setReviewMode("edit");
                            setReviewTarget(item);
                            setReviewModalOpen(true);
                          }}
                        >
                          <Edit2 size={14} />
                          Editar
                        </button>
                        <button
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteUserMedia(item.userMediaId, item.title);
                          }}
                        >
                          <Trash2 size={14} />
                          Excluir
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold rounded transition"
                        onClick={(e) => {
                          e.preventDefault();
                          setReviewMode("create");
                          setReviewTarget(item);
                          setReviewModalOpen(true);
                        }}
                      >
                        Fazer Review
                      </button>
                      <button
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteUserMedia(item.userMediaId, item.title);
                        }}
                      >
                        <Trash2 size={14} />
                        Excluir
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-zinc-600 mt-1.5">
                    Adicionado em{" "}
                    {new Date(item.addedAt).toLocaleDateString("pt-BR")}
                    {item.reviewCreatedAt && (
                      <span>
                        {" "}
                        · Review em{" "}
                        {new Date(item.reviewCreatedAt).toLocaleDateString(
                          "pt-BR",
                        )}
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
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
      <SimpleReviewModal
        open={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setReviewTarget(null);
          setReviewMode("create");
        }}
        onSave={() => {
          setReviewModalOpen(false);
          setReviewTarget(null);
          setReviewMode("create");
          fetchEvaluations();
        }}
        mediaTitle={reviewTarget?.title}
        userMediaId={reviewTarget?.userMediaId}
        reviewId={reviewTarget?.reviewId}
        reviewContent={reviewTarget?.reviewContent}
        fetchWithAuth={fetchWithAuth}
        apiUrl={API_URL}
      />
    </>
  );
}
