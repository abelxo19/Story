import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StoryStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { toPublicStory } from '../stories/story.mapper.js';
import type { UpdateProgressDto } from './dto/update-progress.dto.js';

@Injectable()
export class LibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async getLibrary(userId: string) {
    const [progressRows, bookmarkRows] = await Promise.all([
      this.prisma.readingProgress.findMany({
        where: { userId, story: { status: StoryStatus.PUBLISHED } },
        include: { story: { include: { scenes: { orderBy: { sortOrder: 'asc' } } } } },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.bookmark.findMany({
        where: { userId, story: { status: StoryStatus.PUBLISHED } },
        include: { story: { include: { scenes: { orderBy: { sortOrder: 'asc' } } } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const continueRow = progressRows.find((row) => !row.completed);
    const continueReading = continueRow
      ? {
          sceneIndex: continueRow.sceneIndex,
          sceneTitle:
            continueRow.story.scenes[continueRow.sceneIndex]?.title ??
            continueRow.story.title,
          story: toPublicStory(continueRow.story),
        }
      : null;

    return {
      continueReading,
      bookmarks: bookmarkRows.map((row) => toPublicStory(row.story)),
      completed: progressRows
        .filter((row) => row.completed)
        .map((row) => toPublicStory(row.story)),
      progress: progressRows.map((row) => ({
        storyId: row.storyId,
        slug: row.story.slug,
        sceneIndex: row.sceneIndex,
        completed: row.completed,
        updatedAt: row.updatedAt,
      })),
    };
  }

  async getProgress(userId: string, slug: string) {
    const story = await this.requirePublishedStory(slug);
    const progress = await this.prisma.readingProgress.findUnique({
      where: { userId_storyId: { userId, storyId: story.id } },
    });
    const bookmarked = Boolean(
      await this.prisma.bookmark.findUnique({
        where: { userId_storyId: { userId, storyId: story.id } },
      }),
    );

    return {
      sceneIndex: progress?.sceneIndex ?? 0,
      completed: progress?.completed ?? false,
      bookmarked,
    };
  }

  async updateProgress(userId: string, slug: string, dto: UpdateProgressDto) {
    const story = await this.requirePublishedStory(slug);
    const lastIndex = Math.max(story.scenes.length - 1, 0);
    const sceneIndex = Math.min(dto.sceneIndex, lastIndex);

    const progress = await this.prisma.readingProgress.upsert({
      where: { userId_storyId: { userId, storyId: story.id } },
      create: {
        userId,
        storyId: story.id,
        sceneIndex,
        completed: dto.completed || sceneIndex >= lastIndex,
      },
      update: {
        sceneIndex,
        completed: dto.completed || sceneIndex >= lastIndex,
      },
    });

    return {
      sceneIndex: progress.sceneIndex,
      completed: progress.completed,
    };
  }

  async addBookmark(userId: string, slug: string) {
    const story = await this.requirePublishedStory(slug);
    await this.prisma.bookmark.upsert({
      where: { userId_storyId: { userId, storyId: story.id } },
      create: { userId, storyId: story.id },
      update: {},
    });
    return { bookmarked: true };
  }

  async removeBookmark(userId: string, slug: string) {
    const story = await this.requirePublishedStory(slug);
    await this.prisma.bookmark.deleteMany({
      where: { userId, storyId: story.id },
    });
    return { bookmarked: false };
  }

  private async requirePublishedStory(slug: string) {
    const story = await this.prisma.story.findFirst({
      where: { slug, status: StoryStatus.PUBLISHED },
      include: { scenes: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!story) {
      throw new NotFoundException(`Story "${slug}" not found`);
    }
    return story;
  }
}
