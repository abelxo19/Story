import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StoryStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { toPublicStory } from '../stories/story.mapper.js';
import type {
  ReorderScenesDto,
  UpsertSceneDto,
  UpsertStoryDto,
} from './dto/admin-story.dto.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listStories() {
    const stories = await this.prisma.story.findMany({
      include: { scenes: { orderBy: { sortOrder: 'asc' } } },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });
    return stories.map(toPublicStory);
  }

  async getStory(id: string) {
    const story = await this.prisma.story.findUnique({
      where: { id },
      include: { scenes: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!story) {
      throw new NotFoundException('Story not found');
    }
    return toPublicStory(story);
  }

  async createStory(dto: UpsertStoryDto) {
    const count = await this.prisma.story.count();
    const story = await this.prisma.story.create({
      data: {
        title: dto.title.trim(),
        slug: dto.slug.trim(),
        description: dto.description.trim(),
        coverImage: dto.coverImage,
        source: dto.source,
        sourceUrl: dto.sourceUrl,
        status: dto.status ?? StoryStatus.DRAFT,
        sortOrder: count + 1,
      },
      include: { scenes: true },
    });
    return toPublicStory(story);
  }

  async updateStory(id: string, dto: UpsertStoryDto) {
    await this.requireStory(id);
    const story = await this.prisma.story.update({
      where: { id },
      data: {
        title: dto.title.trim(),
        slug: dto.slug.trim(),
        description: dto.description.trim(),
        coverImage: dto.coverImage,
        source: dto.source,
        sourceUrl: dto.sourceUrl,
        status: dto.status,
      },
      include: { scenes: { orderBy: { sortOrder: 'asc' } } },
    });
    return toPublicStory(story);
  }

  async deleteStory(id: string) {
    await this.requireStory(id);
    await this.prisma.story.delete({ where: { id } });
    return { ok: true };
  }

  async addScene(storyId: string, dto: UpsertSceneDto) {
    await this.requireStory(storyId);
    const count = await this.prisma.scene.count({ where: { storyId } });
    const scene = await this.prisma.scene.create({
      data: {
        storyId,
        title: dto.title.trim(),
        text: dto.text.trim(),
        imageUrl: dto.imageUrl,
        sortOrder: count,
      },
    });
    return scene;
  }

  async updateScene(storyId: string, sceneId: string, dto: UpsertSceneDto) {
    await this.requireScene(storyId, sceneId);
    return this.prisma.scene.update({
      where: { id: sceneId },
      data: {
        title: dto.title.trim(),
        text: dto.text.trim(),
        imageUrl: dto.imageUrl,
      },
    });
  }

  async deleteScene(storyId: string, sceneId: string) {
    await this.requireScene(storyId, sceneId);
    await this.prisma.scene.delete({ where: { id: sceneId } });
    return { ok: true };
  }

  async reorderScenes(storyId: string, dto: ReorderScenesDto) {
    await this.requireStory(storyId);
    await this.prisma.$transaction(
      dto.ids.map((id, index) =>
        this.prisma.scene.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );
    return this.getStory(storyId);
  }

  private async requireStory(id: string) {
    const story = await this.prisma.story.findUnique({ where: { id } });
    if (!story) {
      throw new NotFoundException('Story not found');
    }
    return story;
  }

  private async requireScene(storyId: string, sceneId: string) {
    const scene = await this.prisma.scene.findFirst({
      where: { id: sceneId, storyId },
    });
    if (!scene) {
      throw new NotFoundException('Chapter not found');
    }
    return scene;
  }

  validateUpload(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Please choose an image to upload');
    }
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
    };
  }
}
