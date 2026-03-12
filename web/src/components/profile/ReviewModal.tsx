"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, FileText } from "lucide-react";

type UserMediaItem = {
  id: string;
  title: string;
  type: string;
  posterUrl: string | null;
  tmdbId: string | null;
  rating: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  mediaList: UserMediaItem[];
  fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  apiUrl: string;
};

export function ReviewModal({ open, onClose, mediaList, fetchWithAuth, apiUrl }: Props) {
  const [step, setStep] = useState<"select" | "write">("select");
  const [selected, setSelected] = useState<UserMediaItem | null>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("select");
      setSelected(null);
      setContent("");
      setExistingReviewId(null);
    }
  }, [open]);

  async function handleSelect(item: UserMediaItem) {
    setSelected(item);

    const res = await fetchWithAuth(`${apiUrl}/reviews/by-user-media/${item.id}`);
    if (res.ok) {
    const text = await res.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = null;
    }
    if (data?.id) {
        setExistingReviewId(data.id);
        setContent(data.content);
    } else {
        setExistingReviewId(null);
        setContent("");
    }
    }
    setStep("write");
  }

  async function handleSave() {
    if (!selected || !content.trim()) return;
    setSaving(true);
    await fetchWithAuth(`${apiUrl}/reviews`, {
      method: "POST",
      body: JSON.stringify({ userMediaId: selected.id, content }),
    });
    setSaving(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col border border-zinc-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            <FileText size={18} />
            {step === "select" ? "Selecionar mídia para review" : "Escrever review"}
          </h2>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {step === "select" && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {mediaList.length === 0 && (
              <p className="text-zinc-500 text-sm text-center mt-8">
                Você ainda não adicionou nenhuma mídia.
              </p>
            )}
            {mediaList.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-zinc-800 transition text-left border border-transparent hover:border-zinc-700"
              >
                <div className="relative w-10 h-14 rounded overflow-hidden bg-zinc-700 shrink-0">
                  {item.posterUrl ? (
                    <Image src={item.posterUrl} alt={item.title} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500 text-xs">?</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{item.title}</p>
                  <p className="text-xs text-zinc-500">
                    {item.type === "movie" ? "Filme" : "Série"}
                    {item.rating ? ` · Nota: ${item.rating}` : ""}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.type === "movie" ? "bg-blue-600" : "bg-purple-600"} text-white shrink-0`}>
                  {item.type === "movie" ? "Filme" : "Série"}
                </span>
              </button>
            ))}
          </div>
        )}

        {step === "write" && selected && (
          <div className="flex flex-col gap-4 p-4 flex-1">
            {/* Mídia selecionada */}
            <div className="flex items-center gap-3 bg-zinc-800 rounded-xl p-3">
              <div className="relative w-10 h-14 rounded overflow-hidden bg-zinc-700 shrink-0">
                {selected.posterUrl ? (
                  <Image src={selected.posterUrl} alt={selected.title} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-500 text-xs">?</div>
                )}
              </div>
              <div>
                <p className="font-bold text-white">{selected.title}</p>
                <p className="text-xs text-zinc-500">{selected.type === "movie" ? "Filme" : "Série"}</p>
              </div>
            </div>

            {existingReviewId && (
              <p className="text-xs text-yellow-400 font-bold">Você já tem uma review para essa mídia. Salvar irá atualizá-la.</p>
            )}

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva sua review..."
              rows={6}
              className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-400 resize-none"
            />

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setStep("select")}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold text-zinc-300"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !content.trim()}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-extrabold text-white disabled:opacity-50"
              >
                {saving ? "Salvando..." : existingReviewId ? "Atualizar review" : "Salvar review"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}