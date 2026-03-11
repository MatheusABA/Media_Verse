import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ results: [] });

  const url = `${BASE_URL}/search/multi?language=pt-BR&api_key=${API_KEY}&query=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) return NextResponse.json({ results: [] }, { status: 500 });

  const data = await res.json();
  const filtered = data.results.filter(
    (item: any) => item.media_type === "movie" || item.media_type === "tv",
  );
  return NextResponse.json({ results: filtered });
}