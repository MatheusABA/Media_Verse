import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "@/src/styles/globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { Sidebar } from "../components/Sidebar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MediaVerse",
  description: "Track movies and series",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} antialiased bg-zinc-950 text-white`}
      >
        <AuthProvider>
          <div className="flex h-screen w-full">
            <Sidebar />
            <main className="flex-1 min-w-0 p-8 overflow-y-auto overflow-x-hidden">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
