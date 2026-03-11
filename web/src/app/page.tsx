import { getTrending, getPopularMovies, getPopularSeries } from "../lib/tmdb";
import { HomeContent } from "../components/home/HomeContent";

export default async function Home() {
  const [trending, movies, series] = await Promise.all([
    getTrending(),
    getPopularMovies(),
    getPopularSeries(),
  ]);

  const hero = trending[0];

  return (
    <HomeContent
      hero={hero}
      trending={trending}
      movies={movies}
      series={series}
    />
  );
}