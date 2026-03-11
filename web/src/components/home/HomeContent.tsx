"use client";
import { WelcomeSection } from "./WelcomeSection";
import { HeroBanner } from "../HeroBanner";
import { MediaSection } from "../MediaSection";
import { useAuth } from "../../contexts/AuthContext";

export function HomeContent({ hero, trending, movies, series }: any) {
  const { isLoggedIn, user } = useAuth();

  return (
    <div>
      <WelcomeSection isLoggedIn={isLoggedIn} userData={user}/>
      {hero && <HeroBanner item={hero} />}
      <MediaSection title="Em Alta Esta Semana" items={trending.slice(1, 15)} />
      <MediaSection title="Filmes Populares" items={movies.slice(0, 15)} />
      <MediaSection title="Séries Populares" items={series.slice(0, 15)} />
    </div>
  );
}