"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { User, MapPin, Calendar, Film, Tv, Star, List, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// ─── Types ────────────────────────────────────────────────────────────────────

type ReviewedMedia = {
  id: string
  title: string
  posterUrl: string | null
  tmdbId: string | null
  rating: string | null
  reviewContent: string
  reviewCreatedAt: string
}

type ProfileData = {
  user: {
    id: string
    username: string
    email: string
    bio: string | null
    avatarUrl: string | null
    location: string | null
    createdAt: string
  }
  stats: {
    moviesWatched: number
    seriesWatched: number
    reviewsCount: number
    listsCount: number
  }
  reviewedMovies: ReviewedMedia[]
  reviewedSeries: ReviewedMedia[]
}

// ─── Reviewed Media Card ──────────────────────────────────────────────────────

function ReviewedMediaCard({ item, type }: { item: ReviewedMedia; type: "movie" | "tv" }) {
  const href = item.tmdbId ? `/${type === "movie" ? "movie" : "serie"}/${item.tmdbId}` : "#"

  return (
    <Link href={href} className="group shrink-0 w-36 md:w-44">
      <div className="relative w-full aspect-2/3 rounded-xl overflow-hidden border-2 border-transparent group-hover:border-zinc-400 transition-all shadow-lg">
        {item.posterUrl ? (
          <Image
            src={item.posterUrl}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 144px, 176px"
          />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm">
            Sem imagem
          </div>
        )}
        {item.rating && (
          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-2 flex items-center gap-1 text-yellow-400 text-xs font-bold">
            <Star size={12} fill="currentColor" />
            {parseFloat(item.rating).toFixed(1)}
          </div>
        )}
      </div>
      <p className="mt-2 text-sm font-semibold text-zinc-200 truncate">{item.title}</p>
    </Link>
  )
}

// ─── Reviewed Section (carousel) ─────────────────────────────────────────────

function ReviewedSection({
  title,
  items,
  type,
}: {
  title: string
  items: ReviewedMedia[]
  type: "movie" | "tv"
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    const el = scrollRef.current
    if (el) {
      setCanScrollLeft(el.scrollLeft > 0)
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", checkScroll)
    window.addEventListener("resize", checkScroll)
    return () => {
      el.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [items])

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: direction === "right" ? 200 : -200, behavior: "smooth" })
  }

  return (
    <section className="mb-10 relative">
      <h2 className="text-xl font-extrabold mb-4 tracking-tight">{title}</h2>

      {items.length === 0 ? (
        <p className="text-zinc-500 text-sm italic">{title.includes("Série") ? "Adicione alguma série nos seus favoritos":"Adicione algum filme nos seus favoritos"}</p>
      ) : (
        <>
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll("left")}
              className="hidden md:flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-700 shadow-lg rounded-full w-10 h-10 transition"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} stroke="white" />
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll("right")}
              className="hidden md:flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-700 shadow-lg rounded-full w-10 h-10 transition"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} stroke="white" />
            </button>
          )}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-none"
            style={{ scrollBehavior: "smooth" }}
          >
            {items.map((item) => (
              <ReviewedMediaCard key={item.id} item={item} type={type} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { token, isLoggedIn } = useAuth()
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    fetch(`${API_URL}/user/me/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [token])

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-400">
        <User size={48} />
        <p className="text-lg font-bold">Você precisa estar logado para ver seu perfil.</p>
        <Link
          href="/login"
          className="px-6 py-2 bg-white text-black font-extrabold rounded-full hover:bg-zinc-200 transition uppercase text-sm"
        >
          Entrar
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        Carregando...
      </div>
    )
  }

  if (!data) return null

  const { user, stats, reviewedMovies, reviewedSeries } = data
  const memberSince = new Date(user.createdAt).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  })

  return (
    <div>
      {/* Botão Fazer review */}
      <div className="flex justify-end mb-6">
        <Link
          href="/reviews/new"
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-full shadow-lg transition text-sm uppercase"
        >
          Fazer review
        </Link>
      </div>
      {/* Header */}
      <div className="flex items-end gap-6 mb-8 pb-8 border-b border-zinc-800">
        <div className="w-24 h-24 rounded-full bg-zinc-700 border-4 border-zinc-600 flex items-center justify-center shrink-0 shadow-xl overflow-hidden">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.username}
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-3xl font-extrabold text-zinc-300 uppercase">
              {user.username.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold leading-tight">{user.username}</h1>
          {user.bio && <p className="text-zinc-400 text-sm max-w-md">{user.bio}</p>}
          <div className="flex flex-wrap gap-4 mt-1 text-xs text-zinc-500">
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {user.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={12} /> Membro desde {memberSince}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: <Film size={20} />, label: "Filmes Assistidos", value: stats.moviesWatched },
          { icon: <Tv size={20} />, label: "Séries Assistidas", value: stats.seriesWatched },
          { icon: <Star size={20} />, label: "Reviews", value: stats.reviewsCount },
          { icon: <List size={20} />, label: "Listas", value: stats.listsCount },
        ].map(({ icon, label, value }) => (
          <div
            key={label}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2"
          >
            <div className="text-zinc-400">{icon}</div>
            <span className="text-2xl font-extrabold">{value}</span>
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wide">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Filmes e Séries com Review */}
      <ReviewedSection title="Filmes Favoritos" items={reviewedMovies} type="movie" />
      <ReviewedSection title="Séries Favoritas" items={reviewedSeries} type="tv" />
    </div>
  )
}