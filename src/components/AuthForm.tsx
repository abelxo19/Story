"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ManuscriptDecorations } from "@/components/ManuscriptDecorations";
import { useAuth } from "@/components/AuthProvider";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isSignup = mode === "signup";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      if (isSignup) {
        await register(name, email, password);
      } else {
        await signIn(email, password);
      }
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") ? next : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="manuscript-page min-h-full">
      <ManuscriptDecorations />
      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-col px-6 py-16 sm:py-24">
        <div className="story-card relative overflow-hidden rounded-[0.9rem] p-8 sm:p-10">
          <span className="page-corner page-corner-tl" aria-hidden="true" />
          <span className="page-corner page-corner-br" aria-hidden="true" />
          <p className="story-kicker mb-4 text-xs tracking-[0.35em] uppercase text-amber-900/65">
            {isSignup ? "A new reader" : "Welcome back"}
          </p>
          <h1 className="story-title text-4xl text-amber-950">
            {isSignup ? "Open your tale" : "Return to the library"}
          </h1>
          <div className="ornamental-divider my-6" aria-hidden="true">
            <span>✦</span>
          </div>
          <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
            {isSignup ? (
              <label className="story-field">
                <span>Name</span>
                <input
                  required
                  minLength={2}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                />
              </label>
            ) : null}
            <label className="story-field">
              <span>Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </label>
            <label className="story-field">
              <span>Password</span>
              <input
                required
                minLength={8}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </label>
            {error ? <p className="text-sm text-red-900/80">{error}</p> : null}
            <button
              type="submit"
              disabled={pending}
              className="story-button w-full rounded-full px-5 py-3 text-sm tracking-[0.2em] uppercase disabled:opacity-50"
            >
              {pending ? "Opening..." : isSignup ? "Create account" : "Sign in"}
            </button>
          </form>
          <p className="story-body mt-6 text-sm text-amber-950/70">
            {isSignup ? "Already have a place here? " : "New to the collection? "}
            <Link
              href={isSignup ? "/login" : "/signup"}
              className="underline decoration-amber-900/30 underline-offset-4"
            >
              {isSignup ? "Sign in" : "Begin a new account"}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
