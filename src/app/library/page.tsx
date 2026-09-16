"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ManuscriptDecorations } from "@/components/ManuscriptDecorations";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import {
  addBookmark,
  addToReadingList,
  getLibrary,
  mediaUrl,
  removeBookmark,
  removeFromReadingList,
} from "@/lib/api";
import type { LibraryItem, LibraryPayload, Story } from "@/types/story";

type ShelfFilter =
  | "all"
  | "unread"
  | "reading"
  | "completed"
  | "favorites"
  | "list";

const FILTERS: Array<{ id: ShelfFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "reading", label: "Reading" },
  { id: "completed", label: "Completed" },
  { id: "favorites", label: "Favorites" },
  { id: "list", label: "Reading list" },
];

const STORY_COVERS: Record<string, string> = {
  "hansel-and-gretel": "/hansel and gretel.png",
  "harry-potter": "/harry poter.png",
  "snow-white": "/snowwhite.png",
  "the-hobbit": "/the hobbit.png",
};

function storyCover(story: Story) {
  return (
    STORY_COVERS[story.slug] ??
    mediaUrl(story.coverImage) ??
    `/images/stories/${story.slug}/scene-1.svg`
  );
}

export default function LibraryPage() {
  return (
    <RequireAuth>
      <LibraryView />
    </RequireAuth>
  );
}

function LibraryView() {
  const { user } = useAuth();
  const [library, setLibrary] = useState<LibraryPayload | null>(null);
  const [filter, setFilter] = useState<ShelfFilter>("all");

  async function refresh() {
    setLibrary(await getLibrary());
  }

  useEffect(() => {
    if (!user) {
      setLibrary(null);
      return;
    }
    void refresh().catch(() => setLibrary(null));
  }, [user]);

  const items = useMemo(() => {
    const all = library?.items ?? [];
    switch (filter) {
      case "unread":
        return all.filter((item) => item.unread);
      case "reading":
        return all.filter((item) => item.inProgress);
      case "completed":
        return all.filter((item) => item.completed);
      case "favorites":
        return all.filter((item) => item.favorite);
      case "list":
        return all.filter((item) => item.onReadingList);
      default:
        return all;
    }
  }, [library, filter]);

  async function toggleFavorite(item: LibraryItem) {
    if (item.favorite) {
      await removeBookmark(item.story.slug);
    } else {
      await addBookmark(item.story.slug);
    }
    await refresh();
  }

  async function toggleList(item: LibraryItem) {
    if (item.onReadingList) {
      await removeFromReadingList(item.story.slug);
    } else {
      await addToReadingList(item.story.slug);
    }
    await refresh();
  }

  return (
    <div className="manuscript-page min-h-full">
      <ManuscriptDecorations />
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 sm:px-10 sm:py-20">
        <header className="page-intro text-center">
          <p className="story-kicker mb-4 text-xs tracking-[0.4em] uppercase text-amber-900/65">
            Your shelves
          </p>
          <h1 className="story-title text-5xl text-amber-950">Personal library</h1>
          <div className="ornamental-divider mx-auto my-7" aria-hidden="true">
            <span>✦</span>
          </div>
          <p className="story-body mx-auto max-w-2xl text-base leading-8 text-amber-950/75">
            Save favorites, keep a reading list, and filter the tales you have
            finished or still wait to open.
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

        <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Library filters">
          {FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={filter === option.id}
              className={`library-filter ${filter === option.id ? "is-active" : ""}`}
              onClick={() => setFilter(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="story-body text-center text-amber-900/60">
            No tales in this shelf yet.
          </p>
        ) : (
          <section className="grid grid-cols-1 gap-8 md:grid-cols-2" aria-label="Filtered stories">
            {items.map((item, index) => (
              <article
                key={item.story.id}
                className="story-card story-card-enter group relative flex min-h-[18rem] flex-col overflow-hidden rounded-[0.9rem]"
                style={{ animationDelay: `${180 + index * 90}ms` }}
              >
                <span className="page-corner page-corner-tl" aria-hidden="true" />
                <span className="page-corner page-corner-br" aria-hidden="true" />
                <div className="relative aspect-[16/10] w-full bg-gradient-to-b from-amber-100 to-amber-50">
                  <Image
                    src={storyCover(item.story)}
                    alt={item.story.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative z-10 flex h-full flex-col p-8 sm:p-10">
                  <p className="mb-4 text-[0.65rem] tracking-[0.3em] text-amber-900/45 uppercase">
                    {item.completed
                      ? "Completed"
                      : item.inProgress
                        ? "Reading"
                        : "Unread"}
                    {item.favorite ? " · Favorite" : ""}
                    {item.onReadingList ? " · On list" : ""}
                  </p>
                  <h2 className="story-scene-title text-3xl text-amber-950">
                    <Link href={`/stories/${item.story.slug}`}>{item.story.title}</Link>
                  </h2>
                  <p className="story-body mt-4 text-base leading-7 text-amber-950/72">
                    {item.story.description}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-3 pt-8">
                    <Link
                      href={`/stories/${item.story.slug}`}
                      className="read-adventure story-kicker pb-1 text-xs tracking-[0.24em] uppercase"
                    >
                      {item.inProgress ? "Continue" : "Read the adventure"}
                    </Link>
                    <button
                      type="button"
                      className="story-kicker text-xs tracking-[0.18em] uppercase text-amber-900/60 hover:text-amber-950"
                      onClick={() => void toggleFavorite(item)}
                    >
                      {item.favorite ? "Favorited" : "Favorite"}
                    </button>
                    <button
                      type="button"
                      className="story-kicker text-xs tracking-[0.18em] uppercase text-amber-900/60 hover:text-amber-950"
                      onClick={() => void toggleList(item)}
                    >
                      {item.onReadingList ? "On reading list" : "Add to list"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
