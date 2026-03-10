import { getTrending, getPopularMovies, getPopularSeries } from "../lib/tmdb";
import { HeroBanner } from "../components/HeroBanner";
import { MediaSection } from "../components/MediaSection";

export default async function Home() {
  const [trending, movies, series] = await Promise.all([
    getTrending(),
    getPopularMovies(),
    getPopularSeries(),
  ]);

  const hero = trending[0];

  return (
    <div>
      {hero && <HeroBanner item={hero} />}
      <MediaSection title="Em Alta Esta Semana" items={trending.slice(1, 15)} />
      <MediaSection title="Filmes Populares" items={movies.slice(0, 15)} />
      <MediaSection title="Séries Populares" items={series.slice(0, 15)} />
    </div>
  );
}
