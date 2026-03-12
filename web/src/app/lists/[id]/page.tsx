"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  ArrowLeft,
  Trash2,
  ListVideo,
  Globe,
  Lock,
  Search,
  PlusCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { MediaCard } from "@/src/components/MediaCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Media = {
  id: string; // ID interno do banco
  tmdbId: string;
  type: "movie" | "tv";
  title: string;
  posterUrl: string | null;
};

type ListItem = {
  id: string; // ID único real de vínculo entre a lista e a mídia (listItems)
  media: Media;
};

type ListDetail = {
  id: string;
  title: string;
  description: string | null;
  visibility: "public" | "private";
  userId: string;
};

export default function ListDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { token, user } = useAuth();

  const [list, setList] = useState<ListDetail | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de Busca para Adicionar Filme/Série
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    async function fetchListDetails() {
      try {
        const res = await fetch(`${API_URL}/lists/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setList(data.list);
          setItems(data.items);
        } else {
          router.push("/lists");
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes da lista", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchListDetails();
  }, [id, token, router]);

  // Efeito de Busca (Debounced em 500ms)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          // Exibir apenas os 5 primeiros resultados
          setSearchResults(data.results.slice(0, 5));
        }
      } catch (err) {
        console.error("Erro na busca local", err);
      } finally {
        setSearchLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function handleAddMedia(tmdbMedia: any) {
    if (!token) return;

    const payload = {
      tmdbId: String(tmdbMedia.id),
      type: tmdbMedia.media_type,
      title: tmdbMedia.title || tmdbMedia.name,
      posterUrl: tmdbMedia.poster_path,
      releaseDate: tmdbMedia.release_date || tmdbMedia.first_air_date || null,
      description: tmdbMedia.overview || null,
    };

    try {
      const res = await fetch(`${API_URL}/lists/${id}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const createdListItem = await res.json();

        // Evitar duplicações na UI se o usuário clicar duas vezes
        if (items.some((i) => i.media.tmdbId === payload.tmdbId)) {
          setSearchQuery("");
          return;
        }

        // Adiciona à tela instantaneamente (O 'createdListItem.id' é o que deleta depois)
        setItems((prev) => [
          {
            id: createdListItem.id,
            media: {
              id: createdListItem.mediaId,
              tmdbId: payload.tmdbId,
              type: payload.type as "movie" | "tv",
              title: payload.title,
              posterUrl: payload.posterUrl || null,
            },
          },
          ...prev,
        ]);

        // Limpa a busca
        setSearchQuery("");
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Erro ao adicionar item na lista", err);
    }
  }

  async function handleRemoveItem(itemId: string) {
    if (!token || !confirm("Remover esta mídia da lista?")) return;

    // Use o itemId que vem do 'listItems.id' no DB
    try {
      const res = await fetch(`${API_URL}/lists/${id}/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        // Tira o item da UI
        setItems((prev) => prev.filter((item) => item.id !== itemId));
      }
    } catch (err) {
      console.error("Erro ao remover item", err);
    }
  }

  if (loading) return <div className="text-center text-zinc-500 py-10">Carregando lista...</div>;
  if (!list) return null;

  const isOwner = user?.id === list.userId;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <Link href="/lists" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition mb-6">
        <ArrowLeft size={20} /> Voltar para Minhas Listas
      </Link>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 text-xs text-zinc-500 font-bold uppercase mb-2">
          {list.visibility === "public" ? (
             <span className="flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded text-green-400">
               <Globe size={14}/> Pública
             </span>
          ) : (
             <span className="flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded text-red-400">
               <Lock size={14}/> Privada
             </span>
          )}
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-2">{list.title}</h1>
        {list.description && <p className="text-zinc-400 text-lg">{list.description}</p>}
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ListVideo className="text-purple-500" /> Itens na Lista ({items.length})
        </h2>

        {/* BUSCADOR DE MIDIAS (Apenas se o dono estiver vendo) */}
        {isOwner && (
          <div className="relative w-full md:w-80 z-20">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-zinc-400" size={18} />
              <input
                type="text"
                placeholder="Adicionar filme ou série..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-purple-500 transition"
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 animate-spin text-purple-500" size={18} />
              )}
            </div>

            {/* CAIXA DE RESULTADOS DE BUSCA */}
            {searchQuery && searchResults.length > 0 && (
              <ul className="absolute top-12 left-0 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden">
                {searchResults.map((resItem) => {
                  const title = resItem.title || resItem.name;
                  const year = (resItem.release_date || resItem.first_air_date || "").split("-")[0];

                  return (
                    <li key={resItem.id}>
                      <button
                        onClick={() => handleAddMedia(resItem)}
                        className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-zinc-700 transition"
                      >
                        <div className="flex flex-col">
                          <span className="text-white font-medium text-sm line-clamp-1">{title}</span>
                          <span className="text-zinc-400 text-xs mt-0.5 capitalize">
                            {resItem.media_type === "movie" ? "Filme" : "Série"} {year && `• ${year}`}
                          </span>
                        </div>
                        <PlusCircle size={18} className="text-purple-500 shrink-0" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center text-zinc-500 py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
          <p className="text-lg font-bold text-zinc-400">Esta lista está vazia.</p>
          {isOwner && <p className="text-sm mt-2">Use a barra de pesquisa acima para começar a adicionar filmes e séries.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 z-0">
          {items.map((item) => (
            <div key={item.id} className="relative group flex flex-col items-center">
              <MediaCard
                item={{
                  id: Number(item.media.tmdbId),
                  title: item.media.title,
                  poster_path: item.media.posterUrl || null,
                  backdrop_path: null,
                  vote_average: -1,
                  overview: "",
                  media_type: item.media.type,
                }}
              />
              {isOwner && (
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition duration-200 shadow-xl z-10 scale-90 hover:scale-100"
                  title="Remover da lista"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}