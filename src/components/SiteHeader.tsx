"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export function SiteHeader() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();

  return (
    <header className="relative z-20 border-b border-amber-900/10 bg-[#f6ead8]/80 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
        <Link href="/" className="story-title text-2xl text-amber-950">
          Story
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-xs tracking-[0.22em] uppercase text-amber-900/70">
          {user ? (
            <Link
              href="/library"
              className={pathname.startsWith("/library") ? "text-amber-950" : "hover:text-amber-950"}
            >
              Library
            </Link>
          ) : null}
          {user?.role === "ADMIN" ? (
            <Link
              href="/admin"
              className={pathname.startsWith("/admin") ? "text-amber-950" : "hover:text-amber-950"}
            >
              Keeper
            </Link>
          ) : null}
          {loading ? (
            <span className="text-amber-900/40">...</span>
          ) : user ? (
            <>
              <span className="hidden text-amber-900/55 sm:inline">{user.name}</span>
              <button type="button" onClick={() => void signOut()} className="hover:text-amber-950">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={pathname === "/login" ? "text-amber-950" : "hover:text-amber-950"}
              >
                Sign in
              </Link>
              <Link href="/signup" className="story-button rounded-full px-4 py-2 tracking-[0.18em]">
                Begin
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
