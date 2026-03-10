"use client";
import { useRef } from "react";
import { MediaCard } from "./MediaCard";
import type { MediaItem } from "../lib/tmdb";

type Props = {
  title: string;
  items: MediaItem[];
};

export function MediaSection({ title, items }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="mb-10 relative">
      <h2 className="text-2xl font-extrabold mb-4 tracking-tight">{title}</h2>
      {/* Seta esquerda */}
      <button
        type="button"
        className="hidden md:flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-700 shadow-lg rounded-full w-10 h-10 transition"
        onClick={() => scroll("left")}
        aria-label="Scroll left"
      >
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      {/* Seta direita */}
      <button
        type="button"
        className="hidden md:flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-700 shadow-lg rounded-full w-10 h-10 transition"
        onClick={() => scroll("right")}
        aria-label="Scroll right"
      >
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-none"
        style={{ scrollBehavior: "smooth" }}
      >
        {items.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
