"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, X, Star } from "lucide-react";

const IMG_BASE = "https://image.tmdb.org/t/p/w200";

type MediaResult = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  media_type: "movie" | "tv";
  release_date?: string;
  first_air_date?: string;
  overview: string;
};

type StatusOption = "plan_to_watch" | "watching" | "watched" | "dropped";

const STATUS_LABELS: Record<StatusOption, string> = {
  plan_to_watch: "Pretendo assistir",
  watching: "Assistindo",
  watched: "Assistido",
  dropped: "Desistiu",
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    tmdbId: string;
    type: "movie" | "tv";
    title: string;
    posterUrl: string | null;
    releaseDate: string | null;
    description: string | null;
    status: StatusOption;
    rating: string | null;
  }) => Promise<void>;
};

export function AddMediaModal({ open, onClose, onSave }: Props) {
  const [step, setStep] = useState<"search" | "rate">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<MediaResult | null>(null);
  const [status, setStatus] = useState<StatusOption>("watched");
  const [rating, setRating] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    }
    setSearching(false);
  }

  function handleSelect(item: MediaResult) {
    setSelected(item);
    setStep("rate");
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    await onSave({
      tmdbId: String(selected.id),
      type: selected.media_type,
      title: selected.title || selected.name || "",
      posterUrl: selected.poster_path ? `${IMG_BASE}${selected.poster_path}` : null,
      releaseDate: selected.release_date || selected.first_air_date || null,
      description: selected.overview || null,
      status,
      rating: rating > 0 ? String(rating) : null,
    });
    setSaving(false);
    handleClose();
  }

  function handleClose() {
    setStep("search");
    setQuery("");
    setResults([]);
    setSelected(null);
    setStatus("watched");
    setRating(0);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col border border-zinc-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h2 className="text-lg font-extrabold">
            {step === "search" ? "Buscar filme ou série" : "Avaliar"}
          </h2>
          <button onClick={handleClose} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {step === "search" && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Search input */}
            <div className="flex gap-2 p-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Digite o nome..."
                className="flex-1 bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-400"
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-bold"
              >
                <Search size={16} />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {searching && <p className="text-zinc-500 text-sm">Buscando...</p>}
              {results.map((item) => (
                <button
                  key={`${item.media_type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-zinc-800 transition text-left"
                >
                  {item.poster_path ? (
                    <Image
                      src={`${IMG_BASE}${item.poster_path}`}
                      alt={item.title || item.name || ""}
                      width={40}
                      height={60}
                      className="rounded object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-10 h-15 bg-zinc-700 rounded flex items-center justify-center text-xs text-zinc-500">
                      ?
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-white">
                      {item.title || item.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {item.media_type === "movie" ? "Filme" : "Série"} ·{" "}
                      {(item.release_date || item.first_air_date || "").slice(0, 4)}
                    </p>
                  </div>
                </button>
              ))}
              {!searching && results.length === 0 && query && (
                <p className="text-zinc-500 text-sm">Nenhum resultado encontrado.</p>
              )}
            </div>
          </div>
        )}

        {step === "rate" && selected && (
          <div className="p-4 flex flex-col gap-4">
            {/* Selected media info */}
            <div className="flex items-center gap-3">
              {selected.poster_path && (
                <Image
                  src={`${IMG_BASE}${selected.poster_path}`}
                  alt={selected.title || selected.name || ""}
                  width={60}
                  height={90}
                  className="rounded object-cover"
                  unoptimized
                />
              )}
              <div>
                <p className="font-extrabold text-white">
                  {selected.title || selected.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {selected.media_type === "movie" ? "Filme" : "Série"} ·{" "}
                  {(selected.release_date || selected.first_air_date || "").slice(0, 4)}
                </p>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STATUS_LABELS) as StatusOption[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                      status === s
                        ? "bg-white text-black"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">
                Nota (opcional)
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating(n === rating ? 0 : n)}
                    className={`w-8 h-8 rounded-md text-xs font-bold transition ${
                      n <= rating
                        ? "bg-yellow-500 text-black"
                        : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end mt-2">
              <button
                onClick={() => setStep("search")}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold text-zinc-300"
              >
                Voltar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-extrabold text-white"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}