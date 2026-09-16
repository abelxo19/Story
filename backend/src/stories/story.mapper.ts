import type { Scene, Story } from '@prisma/client';
import type { Story as PublicStory } from './story.types.js';

export function toPublicStory(
  story: Story & { scenes: Scene[] },
): PublicStory {
  return {
    id: story.id,
    slug: story.slug,
    title: story.title,
    description: story.description,
    coverImage: story.coverImage ?? undefined,
    source: story.source ?? undefined,
    sourceUrl: story.sourceUrl ?? undefined,
    status: story.status,
    scenes: story.scenes.map((scene) => ({
      id: scene.id,
      title: scene.title,
      text: scene.text,
      imageUrl: scene.imageUrl,
      sortOrder: scene.sortOrder,
    })),
  };
}
