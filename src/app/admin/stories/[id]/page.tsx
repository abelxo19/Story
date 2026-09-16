"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  addAdminScene,
  deleteAdminScene,
  getAdminStory,
  reorderAdminScenes,
  updateAdminScene,
  updateAdminStory,
  uploadCover,
} from "@/lib/api";
import type { Story, StoryScene } from "@/types/story";

export default function AdminStoryPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "ADMIN" && id) {
      void getAdminStory(id).then(setStory).catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load story");
      });
    }
  }, [user, id]);

  async function saveStory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!story) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      const next = await updateAdminStory(story.id, {
        title: story.title,
        slug: story.slug,
        description: story.description,
        coverImage: story.coverImage,
        source: story.source,
        sourceUrl: story.sourceUrl,
        status: story.status ?? "DRAFT",
      });
      setStory(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function handleCover(file?: File) {
    if (!file || !story) {
      return;
    }
    const uploaded = await uploadCover(file);
    setStory({ ...story, coverImage: uploaded.url });
  }

  async function saveScene(scene: StoryScene) {
    if (!story) {
      return;
    }
    await updateAdminScene(story.id, scene.id, {
      title: scene.title,
      text: scene.text,
      imageUrl: scene.imageUrl,
    });
  }

  async function moveScene(index: number, direction: -1 | 1) {
    if (!story) {
      return;
    }
    const next = [...story.scenes];
    const target = index + direction;
    if (target < 0 || target >= next.length) {
      return;
    }
    [next[index], next[target]] = [next[target], next[index]];
    const updated = await reorderAdminScenes(
      story.id,
      next.map((scene) => scene.id),
    );
    setStory(updated);
  }

  if (!story) {
    return <p className="p-10 text-center text-amber-900/60">Loading manuscript...</p>;
  }

  return (
    <div className="manuscript-page min-h-full">
      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12">
        <Link href="/admin" className="story-kicker text-xs tracking-[0.25em] uppercase text-amber-900/60">
          Back to desk
        </Link>
        <form onSubmit={(event) => void saveStory(event)} className="story-card space-y-4 rounded-[0.9rem] p-6">
          <label className="story-field">
            <span>Title</span>
            <input
              value={story.title}
              onChange={(event) => setStory({ ...story, title: event.target.value })}
            />
          </label>
          <label className="story-field">
            <span>Slug</span>
            <input
              value={story.slug}
              onChange={(event) => setStory({ ...story, slug: event.target.value })}
            />
          </label>
          <label className="story-field">
            <span>Description</span>
            <textarea
              rows={4}
              value={story.description}
              onChange={(event) => setStory({ ...story, description: event.target.value })}
            />
          </label>
          <label className="story-field">
            <span>Cover image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => void handleCover(event.target.files?.[0])}
            />
            {story.coverImage ? (
              <span className="text-xs text-amber-900/50">{story.coverImage}</span>
            ) : null}
          </label>
          <label className="story-field">
            <span>Status</span>
            <select
              value={story.status ?? "DRAFT"}
              onChange={(event) =>
                setStory({ ...story, status: event.target.value as "DRAFT" | "PUBLISHED" })
              }
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </label>
          {error ? <p className="text-sm text-red-900/80">{error}</p> : null}
          <button
            type="submit"
            disabled={saving}
            className="story-button rounded-full px-5 py-2 text-sm tracking-[0.18em] uppercase"
          >
            {saving ? "Saving..." : "Save story"}
          </button>
        </form>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="story-scene-title text-3xl">Chapters</h2>
            <button
              type="button"
              className="story-button rounded-full px-4 py-2 text-xs tracking-[0.18em] uppercase"
              onClick={() => {
                void addAdminScene(story.id, {
                  title: "New chapter",
                  text: "Write the chapter here.",
                  imageUrl: story.coverImage || "/images/stories/hansel-and-gretel/scene-1.svg",
                }).then(() => getAdminStory(story.id).then(setStory));
              }}
            >
              Add chapter
            </button>
          </div>

          {story.scenes.map((scene, index) => (
            <article key={scene.id} className="story-card space-y-3 rounded-[0.9rem] p-6">
              <div className="flex gap-2">
                <button type="button" onClick={() => void moveScene(index, -1)}>
                  Up
                </button>
                <button type="button" onClick={() => void moveScene(index, 1)}>
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void deleteAdminScene(story.id, scene.id).then(() =>
                      getAdminStory(story.id).then(setStory),
                    );
                  }}
                >
                  Remove
                </button>
              </div>
              <label className="story-field">
                <span>Chapter title</span>
                <input
                  value={scene.title}
                  onChange={(event) => {
                    const scenes = story.scenes.map((item) =>
                      item.id === scene.id ? { ...item, title: event.target.value } : item,
                    );
                    setStory({ ...story, scenes });
                  }}
                />
              </label>
              <label className="story-field">
                <span>Image URL</span>
                <input
                  value={scene.imageUrl}
                  onChange={(event) => {
                    const scenes = story.scenes.map((item) =>
                      item.id === scene.id ? { ...item, imageUrl: event.target.value } : item,
                    );
                    setStory({ ...story, scenes });
                  }}
                />
              </label>
              <label className="story-field">
                <span>Text</span>
                <textarea
                  rows={8}
                  value={scene.text}
                  onChange={(event) => {
                    const scenes = story.scenes.map((item) =>
                      item.id === scene.id ? { ...item, text: event.target.value } : item,
                    );
                    setStory({ ...story, scenes });
                  }}
                />
              </label>
              <button
                type="button"
                className="story-button rounded-full px-4 py-2 text-xs tracking-[0.18em] uppercase"
                onClick={() => void saveScene(scene)}
              >
                Save chapter
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
