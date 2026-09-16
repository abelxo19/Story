import { Injectable, NotFoundException } from '@nestjs/common';
import { StoryStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { toPublicStory } from './story.mapper.js';
import type { Story } from './story.types.js';

@Injectable()
export class StoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Story[]> {
    const stories = await this.prisma.story.findMany({
      where: { status: StoryStatus.PUBLISHED },
      include: { scenes: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });
    return stories.map(toPublicStory);
  }

  async findBySlug(slug: string): Promise<Story> {
    const story = await this.prisma.story.findFirst({
      where: { slug, status: StoryStatus.PUBLISHED },
      include: { scenes: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!story) {
      throw new NotFoundException(`Story "${slug}" not found`);
    }
    return toPublicStory(story);
  }
}
