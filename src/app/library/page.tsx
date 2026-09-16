"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ManuscriptDecorations } from "@/components/ManuscriptDecorations";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { getLibrary, getStories } from "@/lib/api";
import type { LibraryPayload, Story } from "@/types/story";

export default function LibraryPage() {
  return (
    <RequireAuth>
      <LibraryView />
    </RequireAuth>
  );
}

function LibraryView() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [library, setLibrary] = useState<LibraryPayload | null>(null);

  useEffect(() => {
    void getStories().then(setStories).catch(() => setStories([]));
  }, []);

  useEffect(() => {
    if (!user) {
      setLibrary(null);
      return;
    }
    void getLibrary().then(setLibrary).catch(() => setLibrary(null));
  }, [user]);

  return (
    <div className="manuscript-page min-h-full">
      <ManuscriptDecorations />
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 sm:px-10 sm:py-20">
        <header className="page-intro text-center">
          <p className="story-kicker mb-4 text-xs tracking-[0.4em] uppercase text-amber-900/65">
            The library
          </p>
          <h1 className="story-title text-5xl text-amber-950">Adventures for Young Readers</h1>
          <div className="ornamental-divider mx-auto my-7" aria-hidden="true">
            <span>✦</span>
          </div>
          <p className="story-body mx-auto max-w-2xl text-base leading-8 text-amber-950/75">
            Choose a tale. We will keep your place, bookmarks, and finished stories.
          </p>
        </header>

        {library?.continueReading ? (
          <section className="story-card relative overflow-hidden rounded-[0.9rem] p-8 sm:p-10">
            <p className="story-kicker mb-3 text-xs tracking-[0.3em] uppercase text-amber-900/60">
              Continue reading
            </p>
            <h2 className="story-scene-title text-3xl text-amber-950">
              {library.continueReading.story.title}
            </h2>
            <p className="story-body mt-3 text-amber-950/75">
              {library.continueReading.sceneTitle}
            </p>
            <Link
              href={`/stories/${library.continueReading.story.slug}`}
              className="read-adventure story-kicker mt-6 inline-flex text-xs tracking-[0.24em] uppercase"
            >
              Resume the adventure
            </Link>
          </section>
        ) : null}

        {user && library && (library.bookmarks.length > 0 || library.completed.length > 0) ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Shelf title="Bookmarks" stories={library.bookmarks} />
            <Shelf title="Completed" stories={library.completed} />
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-8 md:grid-cols-2" aria-label="Story collection">
          {stories.map((story, index) => (
            <Link
              key={story.id}
              href={`/stories/${story.slug}`}
              className="story-card story-card-enter group relative flex min-h-[18rem] overflow-hidden rounded-[0.9rem] p-8 sm:p-10"
              style={{ animationDelay: `${180 + index * 90}ms` }}
            >
              <span className="page-corner page-corner-tl" aria-hidden="true" />
              <span className="page-corner page-corner-br" aria-hidden="true" />
              <div className="relative z-10 flex h-full flex-col">
                <p className="mb-4 text-[0.65rem] tracking-[0.3em] text-amber-900/45 uppercase">
                  Tale {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="story-scene-title text-3xl text-amber-950">{story.title}</h2>
                <p className="story-body mt-4 text-base leading-7 text-amber-950/72">
                  {story.description}
                </p>
                <span className="read-adventure story-kicker mt-auto inline-flex pt-8 pb-1 text-xs tracking-[0.24em] uppercase">
                  Read the adventure
                </span>
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}

function Shelf({ title, stories }: { title: string; stories: Story[] }) {
  if (stories.length === 0) {
    return null;
  }

  return (
    <section className="story-card rounded-[0.9rem] p-6">
      <h2 className="story-kicker text-xs tracking-[0.28em] uppercase text-amber-900/60">
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {stories.map((story) => (
          <li key={story.id}>
            <Link href={`/stories/${story.slug}`} className="story-scene-title text-xl hover:underline">
              {story.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
