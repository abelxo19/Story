"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { ManuscriptDecorations } from "@/components/ManuscriptDecorations";
import { createAdminStory, deleteAdminStory, getAdminStories } from "@/lib/api";
import type { Story } from "@/types/story";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  async function refresh() {
    setStories(await getAdminStories());
  }

  useEffect(() => {
    if (user?.role === "ADMIN") {
      void refresh().catch((err) => setError(err instanceof Error ? err.message : "Unable to load"));
    }
  }, [user]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const story = await createAdminStory({
        title,
        slug,
        description,
        status: "DRAFT",
      });
      setTitle("");
      setSlug("");
      setDescription("");
      router.push(`/admin/stories/${story.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create story");
    }
  }

  if (loading || user?.role !== "ADMIN") {
    return <p className="p-10 text-center text-amber-900/60">Opening the keeper’s desk...</p>;
  }

  return (
    <div className="manuscript-page min-h-full">
      <ManuscriptDecorations />
      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12 sm:px-10">
        <header>
          <p className="story-kicker mb-3 text-xs tracking-[0.35em] uppercase">Keeper’s desk</p>
          <h1 className="story-title text-4xl text-amber-950">Stories and drafts</h1>
        </header>

        <form onSubmit={(event) => void handleCreate(event)} className="story-card space-y-4 rounded-[0.9rem] p-6">
          <h2 className="story-scene-title text-2xl">Add a story</h2>
          <label className="story-field">
            <span>Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>
          <label className="story-field">
            <span>Slug</span>
            <input value={slug} onChange={(event) => setSlug(event.target.value)} required />
          </label>
          <label className="story-field">
            <span>Description</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} required rows={3} />
          </label>
          {error ? <p className="text-sm text-red-900/80">{error}</p> : null}
          <button type="submit" className="story-button rounded-full px-5 py-2 text-sm tracking-[0.18em] uppercase">
            Create draft
          </button>
        </form>

        <section className="space-y-4">
          {stories.map((story) => (
            <article key={story.id} className="story-card flex flex-col gap-3 rounded-[0.9rem] p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="story-kicker text-[0.65rem] tracking-[0.28em] uppercase text-amber-900/50">
                  {story.status}
                </p>
                <h2 className="story-scene-title text-2xl">{story.title}</h2>
                <p className="story-body text-sm text-amber-950/70">{story.scenes.length} chapters</p>
              </div>
              <div className="flex gap-3">
                <Link href={`/admin/stories/${story.id}`} className="story-button rounded-full px-4 py-2 text-xs tracking-[0.18em] uppercase">
                  Edit
                </Link>
                <button
                  type="button"
                  className="rounded-full border border-amber-900/20 px-4 py-2 text-xs tracking-[0.18em] uppercase"
                  onClick={() => {
                    if (confirm(`Delete “${story.title}”?`)) {
                      void deleteAdminStory(story.id).then(refresh);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
