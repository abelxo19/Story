"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export function LandingActions() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="mt-8 h-12" />;
  }

  if (user) {
    return (
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/library"
          className="story-button rounded-full px-6 py-3 text-sm tracking-[0.2em] uppercase"
        >
          Enter the library
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
      <Link
        href="/login"
        className="story-button rounded-full px-6 py-3 text-sm tracking-[0.2em] uppercase"
      >
        Sign in
      </Link>
      <Link
        href="/signup"
        className="rounded-full border border-amber-900/20 px-6 py-3 text-sm tracking-[0.2em] uppercase text-amber-950"
      >
        Create an account
      </Link>
    </div>
  );
}
