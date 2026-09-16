import { Injectable, NotFoundException } from '@nestjs/common';
import { StoryStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { toPublicStory } from '../stories/story.mapper.js';
import type { UpdateProgressDto } from './dto/update-progress.dto.js';

@Injectable()
export class LibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async getLibrary(userId: string) {
    const [stories, progressRows, favoriteRows, readingListRows] =
      await Promise.all([
        this.prisma.story.findMany({
          where: { status: StoryStatus.PUBLISHED },
          include: { scenes: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { sortOrder: 'asc' },
        }),
        this.prisma.readingProgress.findMany({
          where: { userId, story: { status: StoryStatus.PUBLISHED } },
          include: {
            story: { include: { scenes: { orderBy: { sortOrder: 'asc' } } } },
          },
          orderBy: { updatedAt: 'desc' },
        }),
        this.prisma.bookmark.findMany({
          where: { userId, story: { status: StoryStatus.PUBLISHED } },
          include: {
            story: { include: { scenes: { orderBy: { sortOrder: 'asc' } } } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.readingListItem.findMany({
          where: { userId, story: { status: StoryStatus.PUBLISHED } },
          include: {
            story: { include: { scenes: { orderBy: { sortOrder: 'asc' } } } },
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

    const progressByStory = new Map(
      progressRows.map((row) => [row.storyId, row]),
    );
    const favoriteIds = new Set(favoriteRows.map((row) => row.storyId));
    const readingListIds = new Set(readingListRows.map((row) => row.storyId));

    const items = stories.map((story) => {
      const progress = progressByStory.get(story.id);
      const completed = progress?.completed ?? false;
      const unread = !progress;
      const inProgress = Boolean(progress && !progress.completed);

      return {
        story: toPublicStory(story),
        favorite: favoriteIds.has(story.id),
        onReadingList: readingListIds.has(story.id),
        completed,
        unread,
        inProgress,
        sceneIndex: progress?.sceneIndex ?? 0,
      };
    });

    const continueRow = progressRows.find((row) => !row.completed);

    return {
      continueReading: continueRow
        ? {
            sceneIndex: continueRow.sceneIndex,
            sceneTitle:
              continueRow.story.scenes[continueRow.sceneIndex]?.title ??
              continueRow.story.title,
            story: toPublicStory(continueRow.story),
          }
        : null,
      items,
      favorites: items.filter((item) => item.favorite).map((item) => item.story),
      readingList: items
        .filter((item) => item.onReadingList)
        .map((item) => item.story),
      completed: items.filter((item) => item.completed).map((item) => item.story),
      unread: items.filter((item) => item.unread).map((item) => item.story),
    };
  }

  async getProgress(userId: string, slug: string) {
    const story = await this.requirePublishedStory(slug);
    const progress = await this.prisma.readingProgress.findUnique({
      where: { userId_storyId: { userId, storyId: story.id } },
    });
    const favorite = Boolean(
      await this.prisma.bookmark.findUnique({
        where: { userId_storyId: { userId, storyId: story.id } },
      }),
    );
    const onReadingList = Boolean(
      await this.prisma.readingListItem.findUnique({
        where: { userId_storyId: { userId, storyId: story.id } },
      }),
    );

    return {
      sceneIndex: progress?.sceneIndex ?? 0,
      completed: progress?.completed ?? false,
      bookmarked: favorite,
      favorite,
      onReadingList,
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
    return { favorite: true, bookmarked: true };
  }

  async removeBookmark(userId: string, slug: string) {
    const story = await this.requirePublishedStory(slug);
    await this.prisma.bookmark.deleteMany({
      where: { userId, storyId: story.id },
    });
    return { favorite: false, bookmarked: false };
  }

  async addToReadingList(userId: string, slug: string) {
    const story = await this.requirePublishedStory(slug);
    await this.prisma.readingListItem.upsert({
      where: { userId_storyId: { userId, storyId: story.id } },
      create: { userId, storyId: story.id },
      update: {},
    });
    return { onReadingList: true };
  }

  async removeFromReadingList(userId: string, slug: string) {
    const story = await this.requirePublishedStory(slug);
    await this.prisma.readingListItem.deleteMany({
      where: { userId, storyId: story.id },
    });
    return { onReadingList: false };
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
