"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import { Telescope, Loader2 } from "lucide-react";
import ReviewPostCard from "@/src/components/discover/ReviewPostCard";
import ListPostCard from "@/src/components/discover/ListPostCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DiscoverPage() {
  const { token } = useAuth();
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch(`${API_URL}/discover`, {
          // Token ? Puxamos o feed personalizado do usuário : Puxamos o feed geral
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          setFeedItems(data);
          console.log(JSON.stringify(data, null, 2));
        }
      } catch (err) {
        console.error("Erro ao carregar o feed", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
  }, [token]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-white flex items-center justify-center gap-3 mb-2">
          <Telescope className="text-purple-500" size={36} /> Discover
        </h1>
        <p className="text-zinc-400 text-lg">
          Descubra o que a comunidade está assistindo e criando.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
          <Loader2 className="animate-spin text-purple-500" size={40} />
          <p className="font-semibold">Carregando feed...</p>
        </div>
      ) : feedItems.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl py-20 text-center">
          <p className="text-zinc-500 font-bold mb-2">O feed está vazio.</p>
          <p className="text-sm text-zinc-600">
            Escreva uma avaliação ou crie uma lista pública para aparecer aqui.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {feedItems.map((item) =>
            item.type === "review" ? (
              <ReviewPostCard key={`rev-${item.id}`} data={item} />
            ) : (
              <ListPostCard key={`lst-${item.id}`} data={item} />
            ),
          )}
        </div>
      )}
    </div>
  );
}
