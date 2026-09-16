"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  addBookmark,
  getStoryProgress,
  mediaUrl,
  removeBookmark,
  saveStoryProgress,
} from "@/lib/api";
import type { Story } from "@/types/story";

interface StoryReaderProps {
  story: Story;
}

export function StoryReader({ story }: StoryReaderProps) {
  const { user } = useAuth();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [completed, setCompleted] = useState(false);
  const scene = story.scenes[sceneIndex];
  const isFirst = sceneIndex === 0;
  const isLast = sceneIndex === story.scenes.length - 1;

  useEffect(() => {
    if (!user) {
      return;
    }
    void getStoryProgress(story.slug)
      .then((progress) => {
        setSceneIndex(progress.sceneIndex);
        setBookmarked(progress.bookmarked);
        setCompleted(progress.completed);
      })
      .catch(() => undefined);
  }, [user, story.slug]);

  async function persist(nextIndex: number) {
    setSceneIndex(nextIndex);
    if (!user) {
      return;
    }
    const nextCompleted = nextIndex >= story.scenes.length - 1;
    setCompleted(nextCompleted);
    await saveStoryProgress(story.slug, nextIndex, nextCompleted).catch(() => undefined);
  }

  async function toggleBookmark() {
    if (!user) {
      return;
    }
    const result = bookmarked
      ? await removeBookmark(story.slug)
      : await addBookmark(story.slug);
    setBookmarked(result.bookmarked);
  }

  if (!scene) {
    return null;
  }

  const imageSrc = mediaUrl(scene.imageUrl);
  const remoteImage = imageSrc.startsWith("http");

  return (
    <article className="story-page mx-auto w-full max-w-3xl px-6 py-12">
      <header className="mb-10 text-center">
        <p className="story-kicker mb-2 text-sm tracking-[0.3em] uppercase text-amber-900/70">
          An Adventure Tale
        </p>
        <h1 className="story-title text-4xl text-amber-950 sm:text-5xl">{story.title}</h1>
        {story.source ? (
          <p className="story-body mx-auto mt-4 max-w-xl text-sm leading-6 text-amber-900/55">
            {story.sourceUrl ? (
              <a
                href={story.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-amber-900/30 underline-offset-4 hover:text-amber-900"
              >
                {story.source}
              </a>
            ) : (
              story.source
            )}
          </p>
        ) : null}
        {user ? (
          <div className="mt-5 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => void toggleBookmark()}
              className="story-kicker text-xs tracking-[0.22em] uppercase text-amber-900/70"
            >
              {bookmarked ? "Bookmarked" : "Bookmark"}
            </button>
            {completed ? (
              <span className="story-kicker text-xs tracking-[0.22em] uppercase text-amber-900/50">
                Completed
              </span>
            ) : null}
          </div>
        ) : (
          <p className="story-body mt-4 text-sm text-amber-900/55">
            Sign in to save your place and bookmark this tale.
          </p>
        )}
      </header>

      <div className="story-card overflow-hidden rounded-2xl border border-amber-900/15 bg-[#fff9ef] shadow-[0_20px_60px_rgba(92,56,20,0.12)]">
        <div className="relative aspect-[16/10] w-full bg-gradient-to-b from-amber-100 to-amber-50">
          <Image
            src={imageSrc}
            alt={scene.title}
            fill
            className="object-cover"
            unoptimized={remoteImage}
            priority
          />
        </div>

        <div className="space-y-6 px-8 py-10 sm:px-12">
          <h2 className="story-scene-title text-2xl text-amber-950">{scene.title}</h2>
          <div className="space-y-5">
            {scene.text.split(/\n\n+/).map((paragraph, paragraphIndex) => (
              <p
                key={`${scene.id}-${paragraphIndex}`}
                className="story-body text-lg leading-relaxed text-amber-950/90 sm:text-xl"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 pt-4">
            <button
              type="button"
              onClick={() => void persist(sceneIndex - 1)}
              disabled={isFirst}
              className="story-button rounded-full border border-amber-900/20 px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <p className="text-sm tracking-wide text-amber-900/60">
              {sceneIndex + 1} of {story.scenes.length}
            </p>
            <button
              type="button"
              onClick={() => void persist(sceneIndex + 1)}
              disabled={isLast}
              className="story-button rounded-full border border-amber-900/20 px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
