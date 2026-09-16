import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Story, StoryScene } from './story.types.js';

const STORIES_DIR = join(process.cwd(), 'stories');

interface StoryMeta {
  id: string;
  slug: string;
  title: string;
  description: string;
  source?: string;
  sourceUrl?: string;
}

function parseFrontmatter(raw: string): { meta: StoryMeta; body: string } {
  if (!raw.startsWith('---')) {
    throw new Error('Story markdown must start with YAML frontmatter');
  }

  const end = raw.indexOf('\n---', 3);
  if (end === -1) {
    throw new Error('Story markdown is missing closing frontmatter');
  }

  const meta: Record<string, string> = {};
  for (const line of raw.slice(3, end).trim().split('\n')) {
    const separator = line.indexOf(':');
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
    meta[key] = value;
  }

  return {
    meta: meta as unknown as StoryMeta,
    body: raw.slice(end + 4).trim(),
  };
}

function parseScenes(slug: string, body: string): StoryScene[] {
  const sections = body.split(/^## /m).filter((section) => section.trim());

  return sections.map((section, index) => {
    const [titleLine, ...rest] = section.split('\n');
    const title = titleLine.trim();
    const content = rest.join('\n').trim();
    const imageMatch = content.match(/!\[[^\]]*]\(([^)]+)\)/);
    const text = content
      .replace(/!\[[^\]]*]\([^)]+\)/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return {
      id: String(index + 1),
      title,
      text,
      imageUrl:
        imageMatch?.[1] ??
        `/images/stories/${slug}/scene-${(index % 4) + 1}.svg`,
      sortOrder: index,
    };
  });
}

export function loadStoriesFromMarkdown(): Story[] {
  const files = readdirSync(STORIES_DIR)
    .filter((file) => file.endsWith('.md') && file !== 'README.md')
    .sort();

  const stories = files.map((file) => {
    const raw = readFileSync(join(STORIES_DIR, file), 'utf8');
    const { meta, body } = parseFrontmatter(raw);

    return {
      id: meta.id,
      slug: meta.slug,
      title: meta.title,
      description: meta.description,
      source: meta.source,
      sourceUrl: meta.sourceUrl,
      scenes: parseScenes(meta.slug, body),
    } satisfies Story;
  });

  return stories.sort((a, b) => Number(a.id) - Number(b.id));
}
