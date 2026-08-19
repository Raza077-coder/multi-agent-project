/**
 * Created by: frontend-developer-agent
 * Role:       Frontend Developer
 * Purpose:    Root layout — fonts, metadata, and the app shell.
 */
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskFlow — Collaborative Task Management",
  description:
    "TaskFlow is a collaborative task management SaaS built by a six-agent AI system.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 sm:px-6">
          <header className="flex h-16 items-center justify-between border-b border-slate-800">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg font-black text-white shadow-lg shadow-indigo-500/30">
                T
              </span>
              <span className="text-lg font-bold tracking-tight">TaskFlow</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/"
                className="rounded-lg px-3 py-1.5 font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Dashboard
              </Link>
              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400">
                multi-agent build
              </span>
            </nav>
          </header>
          <main className="flex-1 py-8">{children}</main>
          <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
            TaskFlow · built collaboratively by six specialized AI agents ·
            project-manager · devops · backend · frontend · qa · docs
          </footer>
        </div>
      </body>
    </html>
  );
}
