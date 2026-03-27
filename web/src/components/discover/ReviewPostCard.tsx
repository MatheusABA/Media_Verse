"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageCircle, ArrowBigUp, ArrowBigDown, Star, Film } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import { IMG_BASE } from "@/src/lib/tmdb";
import { getFullUrl } from "@/src/utils/imageUrl";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ReviewPostCard({ data }: { data: any }) {
  const { token, user } = useAuth();
  const [score, setScore] = useState(data.score || 0);
  const [myVote, setMyVote] = useState(data.myVote || 0);

  const isMovie = data.media?.type === "movie";
  const mediaLink = isMovie ? `/movie/${data.media?.id}` : `/serie/${data.media?.id}`;

  async function handleVote(value: number) {
    if (!token) {
      alert("Faça login para votar.");
      return;
    }
    
    // Toggle: Se clicar no mesmo botão que já votou, ele remove o voto (retorna a 0)
    const newValue = myVote === value ? 0 : value;

    // Atualização Otimista no Front-end
    setScore(score - myVote + newValue);
    setMyVote(newValue);

    try {
      await fetch(`${API_URL}/discover/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          targetId: data.id,
          type: "review",
          value: newValue
        })
      });
    } catch (err) {
      console.error("Erro ao votar", err);
      // Reverte em caso de erro
      setScore(score + myVote - newValue);
      setMyVote(myVote);
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6 flex gap-4 shadow-md transition hover:border-zinc-700">
      
      {/* Coluna de Votos Direita/Esquerda */}
      <div className="flex flex-col items-center gap-1 min-w-10">
        <button 
          onClick={() => handleVote(1)} 
          className={`p-1 rounded-md transition ${myVote === 1 ? "text-purple-500 bg-purple-500/10" : "text-zinc-500 hover:bg-zinc-800 hover:text-white"}`}
        >
          <ArrowBigUp size={24} fill={myVote === 1 ? "currentColor" : "none"} />
        </button>
        <span className={`font-bold text-sm ${myVote === 1 ? "text-purple-500" : myVote === -1 ? "text-red-500" : "text-zinc-300"}`}>
          {score}
        </span>
        <button 
          onClick={() => handleVote(-1)} 
          className={`p-1 rounded-md transition ${myVote === -1 ? "text-red-500 bg-red-500/10" : "text-zinc-500 hover:bg-zinc-800 hover:text-white"}`}
        >
          <ArrowBigDown size={24} fill={myVote === -1 ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex-1">
        {/* Cabeçalho do Usuário */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center border border-zinc-700">
            {data.user?.avatarUrl ? (
              <Image src={getFullUrl(data.user.avatarUrl) || ""} alt={data.user.username} className="w-full h-full object-cover" width={40} height={40} unoptimized/>
            ) : (
              <span className="text-zinc-500 font-bold uppercase">{data.user?.username?.charAt(0)}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-100">{data.user?.username}</span>
              <span className="text-xs text-zinc-500">escreveu uma review sobre</span>
            </div>
            <span className="text-xs text-zinc-500">
              {new Date(data.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Conteúdo da Review e Media Relacionada */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex mb-4 relative">
            {data.media?.posterUrl ? (
               <Link href={mediaLink} className="w-24 shrink-0 block relative">
                 <Image src={`${IMG_BASE}${data.media.posterUrl}`} alt={data.media.title} fill className="object-cover" />
               </Link>
            ) : (
                <div className="w-24 h-36 bg-zinc-800 shrink-0 flex items-center justify-center text-zinc-600"><Film size={24}/></div>
            )}
            
            <div className="p-4 flex-1">
                <Link href={mediaLink} className="font-bold text-lg text-white hover:text-purple-400 mb-1 inline-block">
                    {data.media?.title}
                </Link>
                {data.userMediaRating && (
                    <div className="flex items-center gap-1 text-yellow-400 mb-2">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < Math.floor(data.userMediaRating) ? "currentColor" : "none"} className={i < data.userMediaRating ? "text-yellow-400" : "text-zinc-700"} />
                        ))}
                    </div>
                )}
                <p className="text-zinc-300 text-sm leading-relaxed">{data.content}</p>
            </div>
        </div>

        {/* Botão de Comentários */}
        <div className="flex items-center gap-4 text-zinc-500 text-sm font-semibold">
           <button className="flex items-center gap-2 hover:text-zinc-300 transition">
              <MessageCircle size={18} /> {data.commentCount || 0} Comentários
           </button>
        </div>

      </div>
    </div>
  );
}