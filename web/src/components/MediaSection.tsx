import { MediaCard } from "./MediaCard"
import type { MediaItem } from "../lib/tmdb"

type Props = {
  title: string
  items: MediaItem[]
}

export function MediaSection({ title, items }: Props) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-extrabold mb-4 tracking-tight">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
        {items.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}