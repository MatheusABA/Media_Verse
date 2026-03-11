import { ReviewedMedia } from "@/src/types/review"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { ReviewedMediaCard } from "./ReviewedMediaCard"

export function ReviewedSection({
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