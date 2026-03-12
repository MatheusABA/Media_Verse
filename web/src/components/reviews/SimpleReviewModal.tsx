import { useState } from "react";

export function SimpleReviewModal({ open, onClose, onSave, mediaTitle, userMediaId, fetchWithAuth, apiUrl }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await fetchWithAuth(`${apiUrl}/reviews`, {
      method: "POST",
      body: JSON.stringify({ userMediaId, content }),
    });
    setLoading(false);
    setContent("");
    onSave?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 rounded-xl p-6 w-full max-w-md shadow-xl flex flex-col gap-4"
      >
        <h2 className="text-xl font-bold text-white mb-2">Fazer Review</h2>
        <p className="text-zinc-400 text-sm mb-2">Para: <span className="font-bold">{mediaTitle}</span></p>
        <textarea
          className="w-full h-32 bg-zinc-800 text-white rounded p-2 resize-none"
          placeholder="Escreva sua review..."
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-zinc-700 text-white"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-purple-600 text-white font-bold"
            disabled={loading || !content.trim()}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}