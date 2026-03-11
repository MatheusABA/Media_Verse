import Link from "next/link";
import { Star, List, Users, Clapperboard } from "lucide-react";
import { userData } from "@/src/types/user";

const features = [
  {
    icon: <Clapperboard size={28} className="text-white" />,
    title: "Registre o que assistiu",
    description:
      "Marque filmes e séries como assistidos e acompanhe seu histórico.",
  },
  {
    icon: <Star size={28} className="text-yellow-400" />,
    title: "Avalie e escreva reviews",
    description: "Dê notas e compartilhe sua opinião sobre o que assistiu.",
  },
  {
    icon: <List size={28} className="text-white" />,
    title: "Crie listas personalizadas",
    description: "Organize filmes e séries em listas temáticas do seu jeito.",
  },
  {
    icon: <Users size={28} className="text-white" />,
    title: "Siga amigos",
    description: "Veja o que seus amigos estão assistindo e descobrindo.",
  },
];

export function WelcomeSection({
  isLoggedIn,
  userData,
  userStats,
  onCreateReview,
}: {
  isLoggedIn: boolean;
  userData?: userData | null;
  userStats?: { watched: number; reviews: number; lists: number };
  onCreateReview?: () => void;
}) {
  return (
    <section className="mb-10 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl">
      <div className="px-10 py-12">
        <h2 className="text-4xl font-extrabold mb-3 leading-tight">
          {isLoggedIn
            ? `Bem-vindo de volta, ${userData?.username || "usuário"}!`
            : "MediaVerse"}
        </h2>
        <p className="text-zinc-300 max-w-6xl mb-8 text-base leading-relaxed">
          {isLoggedIn
            ? "Continue explorando, avaliando e compartilhando suas experiências!"
            : "Seu universo pessoal de filmes e séries. Registre o que assiste, descubra novidades, escreva reviews e conecte-se com amigos que compartilham seu gosto."}
        </p>

        {isLoggedIn && userStats && (
          <div className="flex gap-6 mb-8">
            <div>
              <span className="font-bold text-lg">{userStats.watched}</span>
              <span className="block text-xs text-zinc-400">Assistidos</span>
            </div>
            <div>
              <span className="font-bold text-lg">{userStats.reviews}</span>
              <span className="block text-xs text-zinc-400">Reviews</span>
            </div>
            <div>
              <span className="font-bold text-lg">{userStats.lists}</span>
              <span className="block text-xs text-zinc-400">Listas</span>
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-10">
          {!isLoggedIn ? (
            <>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-white text-black font-extrabold px-6 py-2 rounded-full hover:bg-zinc-200 transition-all uppercase text-sm"
              >
                Criar conta grátis
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 border border-zinc-600 text-zinc-200 font-extrabold px-6 py-2 rounded-full hover:bg-zinc-800 transition-all uppercase text-sm"
              >
                Já tenho conta
              </Link>
            </>
          ) : (
            <button
              onClick={onCreateReview}
              className="inline-flex items-center gap-2 bg-white text-black font-extrabold px-6 py-2 rounded-full hover:bg-zinc-200 transition-all uppercase text-sm"
            >
              Fazer nova review
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-zinc-800 rounded-xl p-5 flex flex-col gap-2 border border-zinc-700 hover:bg-zinc-700 hover:scale-105 transition-all cursor-pointer"
            >
              {f.icon}
              <span className="font-bold text-sm">{f.title}</span>
              <span className="text-zinc-400 text-xs leading-relaxed">
                {f.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
