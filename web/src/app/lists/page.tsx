"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Plus, ListVideo, Trash2, Lock, Globe } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ListType = {
  id: string;
  title: string;
  description: string | null;
  visibility: "public" | "private";
  createdAt: string;
};

export default function ListsPage() {
  const { token, isLoggedIn } = useAuth();
  const [lists, setLists] = useState<ListType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  
  // Estado do Form do Modal
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  useEffect(() => {
    if (!token) return;
    fetchLists();
  }, [token]);

  async function fetchLists() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLists(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleCreateList(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !title.trim()) return;

    try {
      const res = await fetch(`${API_URL}/lists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, visibility }),
      });

      if (res.ok) {
        setModalOpen(false);
        setTitle("");
        setDescription("");
        setVisibility("public");
        fetchLists(); // Atualiza a grid
      }
    } catch (err) {
      console.error("Erro ao criar lista", err);
    }
  }

  async function handleDeleteList(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Tem certeza que deseja deletar esta lista? Todas as mídias nela continuarão salvas no seu perfil, mas a lista sumirá.")) return;
    
    try {
      const res = await fetch(`${API_URL}/lists/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLists((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filteredLists = lists.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4 text-zinc-400">
        <ListVideo size={48} />
        <p className="text-lg font-bold">Faça login para ver e criar suas listas.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <ListVideo className="text-purple-500" /> Minhas Listas
          </h1>
          <p className="text-zinc-400 mt-1">Crie pastas e organize filmes e séries do seu jeito.</p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Buscar lista..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-purple-500 transition"
            />
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition shrink-0"
          >
            <Plus size={20} /> Nova Lista
          </button>
        </div>
      </div>

      {/* GRID DE LISTAS */}
      {loading ? (
        <div className="text-center text-zinc-500 py-10">Carregando listas...</div>
      ) : filteredLists.length === 0 ? (
        <div className="text-center text-zinc-500 py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
          <ListVideo size={48} className="mx-auto text-zinc-700 mb-4" />
          <p className="text-lg font-bold text-zinc-400">Nenhuma lista encontrada.</p>
          {search === "" && <p className="text-sm mt-2">Clique em "Nova Lista" para começar a organizar.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLists.map((list) => (
            <Link
              key={list.id}
              href={`/lists/${list.id}`}
              className="group bg-zinc-900 border border-zinc-800 hover:border-purple-500 rounded-xl overflow-hidden transition duration-300 shadow-lg relative flex flex-col h-48"
            >
              <div className="p-5 flex-1 relative z-10 bg-gradient-to-t from-zinc-900 to-zinc-900/40">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-extrabold text-xl text-white line-clamp-2 group-hover:text-purple-400 transition">
                    {list.title}
                  </h3>
                  <button
                    onClick={(e) => handleDeleteList(list.id, e)}
                    className="text-zinc-500 hover:text-red-500 bg-black/40 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition"
                    title="Excluir Lista"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {list.description && (
                  <p className="text-sm text-zinc-400 line-clamp-2 mb-4">{list.description}</p>
                )}
                <div className="absolute bottom-5 left-5 flex items-center gap-3 text-xs text-zinc-500 font-bold uppercase">
                  <span className="flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded">
                    {list.visibility === "public" ? <Globe size={12} /> : <Lock size={12} />}
                    {list.visibility === "public" ? "Pública" : "Privada"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* MODAL DE CRIAR LISTA */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 relative">
            <h2 className="text-2xl font-extrabold text-white mb-6">Nova Lista</h2>
            <form onSubmit={handleCreateList} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-1">Nome da Lista *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-800 border-none text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Filmes de terror dos anos 80"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-1">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-800 border-none text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] resize-none"
                  placeholder="Opcional. Uma breve descrição sobre a lista..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Visibilidade</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={visibility === "public"}
                      onChange={() => setVisibility("public")}
                      className="accent-purple-500"
                    />
                    <span className="text-white text-sm flex items-center gap-1"><Globe size={14}/> Pública</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={visibility === "private"}
                      onChange={() => setVisibility("private")}
                      className="accent-purple-500"
                    />
                    <span className="text-white text-sm flex items-center gap-1"><Lock size={14}/> Privada</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg font-bold text-zinc-300 hover:bg-zinc-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="px-5 py-2.5 rounded-lg font-bold bg-purple-600 hover:bg-purple-700 text-white transition disabled:opacity-50"
                >
                  Criar Lista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}