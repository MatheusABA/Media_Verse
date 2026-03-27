"use client";

import Link from "next/link";
import { MessageCircle, ArrowBigUp, ArrowBigDown, ListVideo } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/src/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ListPostCard({ data }: { data: any }) {
  const { token } = useAuth();
  const [score, setScore] = useState(data.score || 0);
  const [myVote, setMyVote] = useState(data.myVote || 0);

  async function handleVote(value: number) {
    if (!token) {
      alert("Faça login para votar.");
      return;
    }
    
    const newValue = myVote === value ? 0 : value;
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
          type: "list",
          value: newValue
        })
      });
    } catch (err) {
      console.error("Erro ao votar", err);
      setScore(score + myVote - newValue);
      setMyVote(myVote);
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6 flex gap-4 shadow-md transition hover:border-zinc-700">
      
      {/* Votos */}
      <div className="flex flex-col items-center gap-1 min-w-[40px]">
        <button 
          onClick={() => handleVote(1)} 
          className={`p-1 rounded-md transition ${myVote === 1 ? "text-green-500 bg-green-500/10" : "text-zinc-500 hover:bg-zinc-800 hover:text-white"}`}
        >
          <ArrowBigUp size={24} fill={myVote === 1 ? "currentColor" : "none"} />
        </button>
        <span className={`font-bold text-sm ${myVote === 1 ? "text-green-500" : myVote === -1 ? "text-red-500" : "text-zinc-300"}`}>
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
        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center border border-zinc-700">
             {data.user?.avatarUrl ? (
              <img src={data.user.avatarUrl} alt={data.user.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-zinc-500 font-bold uppercase">{data.user?.username?.charAt(0)}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-100">{data.user?.username}</span>
              <span className="text-xs text-zinc-500">criou uma nova lista</span>
            </div>
            <span className="text-xs text-zinc-500">
              {new Date(data.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Content Box da Lista */}
        <Link href={`/lists/${data.id}`} className="block bg-zinc-950 border border-zinc-800 rounded-xl p-5 mb-4 hover:border-purple-500 transition group cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/20 text-purple-500 rounded-lg group-hover:bg-purple-500 group-hover:text-white transition">
                    <ListVideo size={20} />
                </div>
                <h3 className="font-extrabold text-xl text-white group-hover:text-purple-400 transition">{data.title}</h3>
            </div>
            {data.description && (
                <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{data.description}</p>
            )}
        </Link>

        {/* Comentários */}
        <div className="flex items-center gap-4 text-zinc-500 text-sm font-semibold">
           <button className="flex items-center gap-2 hover:text-zinc-300 transition">
              <MessageCircle size={18} /> {data.commentCount || 0} Comentários
           </button>
        </div>

      </div>
    </div>
  );
}