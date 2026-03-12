"use client"

import Link from "next/link"
import { useAuth } from "../contexts/AuthContext"
import { useState } from "react"
import {
  House,
  Flame,
  Newspaper,
  Search,
  User,
  LogIn,
  LogOut,
  Plus,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  Star,
  FolderOpen,
  Heart,
} from "lucide-react";
import { usePathname } from "next/dist/client/components/navigation";
import Image from "next/image";
import { getFullUrl } from "../utils/imageUrl";

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: (color: string) => <House size={22} color={color} />,
  },
  {
    href: "/feed",
    label: "Feed",
    icon: (color: string) => <Newspaper size={22} color={color} />,
  },
  {
    href: "/trending",
    label: "Trending",
    icon: (color: string) => <Flame size={22} color={color} />,
  },
  {
    href: "/discover",
    label: "Descobrir",
    icon: (color: string) => <Search size={22} color={color} />,
  },
  {
    href: "/favorites",
    label: "Favoritos",
    icon: (color: string) => <Heart size={22} color={color} />,
  },
  {
    href: "/reviews",
    label: "Minhas Reviews",
    icon: (color: string) => <Star size={22} color={color} />,
  },
  {
    href: "/lists",
    label: "Minhas Listas",
    icon: (color: string) => <FolderOpen size={22} color={color} />,
  },
];

const iconActiveColors: Record<string, string> = {
  "/": "#60a5fa", // home: azul claro
  "/feed": "#4ade80", // feed: verde claro
  "/trending": "#f59e42", // trending: laranja
  "/discover": "#a16207", // descobrir: marrom
  "/favorites": "#ef4444", // favoritos: vermelho
  "/reviews": "#facc15", // reviews: amarelo
  "/lists": "#a78bfa", // lista: roxo
};

export function Sidebar() {
  const { isLoggedIn, user, logout } = useAuth();
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();

  return (
    <aside
      className={`h-screen-95% bg-zinc-900 border-r-4 border-black flex flex-col transition-all duration-200 rounded-2xl ml-2 my-2
        ${expanded ? "w-64" : "w-20"} shadow-2xl`}
    >
      <div className="flex items-center justify-between p-4 border-b-4 border-black">
        <span
          className={`font-extrabold text-2xl tracking-tighter select-none ${!expanded ? "hidden" : ""}`}
        >
          MediaVerse
        </span>
        <button
          className="ml-2 p-1 hover:bg-zinc-700 rounded"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? (
            <ArrowLeftFromLine size={22} />
          ) : (
            <ArrowRightFromLine size={22} />
          )}
        </button>
      </div>
      <nav className="flex flex-col gap-1 mt-4 flex-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const iconColor = isActive
            ? iconActiveColors[item.href] || "#a1a1aa"
            : "#a1a1aa";
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!expanded ? item.label : undefined}
              className={`flex items-center gap-3 px-4 py-3 font-bold text-lg rounded-md
              hover:ring-zinc-400 hover:bg-zinc-800 hover:py-5 transition-all
              ${isActive ? "bg-zinc-700 text-white" : "text-zinc-400"}
              ${!expanded && "justify-center px-0"}`}
            >
              {item.icon(iconColor)}
              {expanded && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t-4 border-black">
        {isLoggedIn ? (
          <div className="flex flex-col gap-4">
            <Link
              href="/profile"
              className={`w-full flex items-center border-zinc-400 bg-zinc-900 text-zinc-100 font-extrabold hover:bg-zinc-100 hover:text-black transition-all rounded-md
                ${!expanded ? "justify-center px-0" : "gap-2 hover:p-1"}`}
              title={!expanded ? "Perfil" : undefined}
            >
              {user?.avatarUrl ? (
                <Image
                  src={getFullUrl(user.avatarUrl) || ""}
                  alt="Avatar"
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <User size={22} />
              )}
              {expanded && <span>@{user?.username}</span>}
            </Link>
            <button
              onClick={logout}
              className={`w-full flex items-center border-red-500 bg-zinc-900 text-red-500 font-extrabold hover:bg-red-500 hover:text-red-200 transition-all uppercase rounded-md
                ${!expanded ? "justify-center px-0" : "gap-2 hover:p-1"}`}
              title={!expanded ? "Sair" : undefined}
            >
              <LogOut size={22} />
              {expanded && <span>Sair</span>}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link
              href="/login"
              className={`w-full border-zinc-400 bg-zinc-900 text-zinc-100 font-extrabold py-2 hover:bg-zinc-100 hover:text-black transition-all uppercase text-center rounded-md
                ${!expanded ? "flex justify-center items-center py-3" : ""}`}
              title={!expanded ? "Entrar" : undefined}
            >
              {expanded ? "Entrar" : <LogIn size={22} />}
            </Link>
            <Link
              href="/register"
              className={`w-full border-zinc-400 bg-zinc-900 text-white font-extrabold py-2 hover:bg-zinc-100 hover:text-black transition-all uppercase text-center rounded-md
                ${!expanded ? "flex justify-center items-center py-3" : ""}`}
              title={!expanded ? "Cadastrar" : undefined}
            >
              {expanded ? "Cadastrar" : <Plus size={22} />}
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}