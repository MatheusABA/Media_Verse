import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "../styles/globals.css";
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
        className={`${geistSans.variable} antialiased bg-zinc-350 text-white`}
      >
        <AuthProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="ml-64 flex-1 p-8">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
