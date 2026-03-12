"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Star } from "lucide-react";

type MediaItem = {
  id: string;
  title: string;
  type: string;
  posterUrl: string | null;
  tmdbId: string | null;
  status: string | null;
  rating: string | null;
};

type TopMediaItem = {
  id: string;
  type: string;
  position: number;
  mediaId: string;
  title: string;
  posterUrl: string | null;
  tmdbId: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  mediaList: MediaItem[];
  currentTop: TopMediaItem[];
  type: "movie" | "tv";
  onSave: (media: MediaItem, position: number) => Promise<void>;
};

export function TopMediaModal({
  open,
  onClose,
  mediaList,
  currentTop,
  type,
  onSave,
}: Props) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const filteredMedia = mediaList.filter((m) => m.type === type);

  useEffect(() => {
    if (open) {
      setSelectedMedia(null);
      setSelectedPosition(1);
    }
  }, [open]);

  if (!open) return null;

  async function handleSave() {
    if (!selectedMedia) return;
    setSaving(true);
    await onSave(selectedMedia, selectedPosition);
    setSaving(false);
    onClose();
  }

  const isPositionOccupied = (pos: number) => {
    return currentTop.some((item) => item.position === pos);
  };

  const getMediaAtPosition = (pos: number) => {
    return currentTop.find((item) => item.position === pos);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setSearching(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.trim() === "") {
        setSearchResults([]);
        setSearching(false);
        return;
      }
      setSearchResults(
        filteredMedia.filter((m) =>
          m.title.toLowerCase().includes(value.toLowerCase()),
        ),
      );
      setSearching(false);
    }, 400);
  };

  const handleClear = () => {
    setSearch("");
    setSearchResults([]);
    setSearching(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-zinc-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h2 className="text-lg font-extrabold">
            Adicionar ao Top 5 {type === "movie" ? "Filmes" : "Séries"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Busca */}
          <div>
            <label className="block text-sm font-bold mb-2 text-zinc-300">
              Busque{" "}
              {type === "movie" ? "algum dos filmes" : "alguma das séries"} que
              você já avaliou:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                className="w-full p-2 border border-zinc-700 rounded-lg"
              />
              {search && (
                <button
                  onClick={handleClear}
                  className="px-3 py-2 bg-zinc-700 text-white rounded-lg font-bold"
                  title="Limpar busca"
                >
                  Limpar
                </button>
              )}
            </div>
            {searching && (
              <div className="mt-2 text-zinc-400 text-xs">Buscando...</div>
            )}
            {search && searchResults.length === 0 && !searching && (
              <div className="mt-2 text-zinc-400 text-xs">
                Nenhum resultado encontrado.
              </div>
            )}
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => setSelectedMedia(result)}
                    className="w-full p-2 border border-zinc-700 rounded-lg text-left"
                  >
                    {result.title}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Seletor de Posição */}
          <div>
            <label className="block text-sm font-bold mb-2 text-zinc-300">
              Escolha a posição (1-5):
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((pos) => {
                const occupied = isPositionOccupied(pos);
                const mediaAtPos = getMediaAtPosition(pos);
                return (
                  <button
                    key={pos}
                    onClick={() => setSelectedPosition(pos)}
                    className={`
                      flex-1 p-3 rounded-lg border-2 transition relative
                      ${
                        selectedPosition === pos
                          ? "border-purple-500 bg-purple-500/20"
                          : occupied
                            ? "border-yellow-600/50 bg-yellow-600/10"
                            : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                      }
                    `}
                    title={
                      occupied && mediaAtPos
                        ? `Ocupado por: ${mediaAtPos.title}`
                        : undefined
                    }
                  >
                    <span className="text-xl font-bold">#{pos}</span>
                    {occupied && (
                      <span className="absolute top-1 right-1 text-xs text-yellow-400">
                        ★
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {isPositionOccupied(selectedPosition) && (
              <p className="text-xs text-yellow-400 mt-2">
                ⚠️ Esta posição já está ocupada. Ao salvar, o item atual será
                substituído.
              </p>
            )}
          </div>

          {/* Lista de Mídias */}
          <div>
            <label className="block text-sm font-bold mb-2 text-zinc-300">
              Ou escolha entre{" "}
              {type === "movie"
                ? "um dos últimos filmes avaliados"
                : "uma das últimas séries avaliadas"}
              :
            </label>
            {(search ? searchResults : filteredMedia).length === 0 ? (
              <p className="text-zinc-500 text-sm italic">
                Você ainda não adicionou nenhum{" "}
                {type === "movie" ? "filme" : "série"} à sua lista.
              </p>
            ) : (
              <div className="grid grid-cols-5 md:grid-cols-5 gap-2 max-h-80 overflow-y-auto">
                {(search ? searchResults : filteredMedia).map((media) => {
                  const isSelected = selectedMedia?.id === media.id;
                  const isInTop = currentTop.some(
                    (item) => item.mediaId === media.id,
                  );
                  return (
                    <button
                      key={media.id}
                      onClick={() => setSelectedMedia(media)}
                      className={`
                        relative rounded-lg overflow-hidden border-2 transition flex flex-col items-center w-full
                        ${
                          isSelected
                            ? "border-purple-500 ring-2 ring-purple-500"
                            : isInTop
                              ? "border-green-600"
                              : "border-zinc-700 hover:border-zinc-600"
                        }
                      `}
                    >
                      <div className="relative w-20 aspect-2/3">
                        {media.posterUrl ? (
                          <Image
                            src={media.posterUrl}
                            alt={media.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs">
                            Sem poster
                          </div>
                        )}
                        {isInTop && (
                          <div className="absolute top-1 right-1 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                            No Top
                          </div>
                        )}
                        {media.rating && (
                          <div className="absolute bottom-1 left-1 bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Star size={10} fill="currentColor" />
                            {parseFloat(media.rating).toFixed(1)}
                          </div>
                        )}
                      </div>
                      <p className="w-full px-1 py-1 text-[11px] font-semibold truncate text-zinc-200 text-center bg-zinc-900/60">
                        {media.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-zinc-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-bold transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedMedia || saving}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}