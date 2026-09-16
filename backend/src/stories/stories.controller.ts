import { Controller, Get, Param } from '@nestjs/common';
import { StoriesService } from './stories.service.js';
import type { Story } from './story.types.js';

@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get()
  findAll(): Promise<Story[]> {
    return this.storiesService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string): Promise<Story> {
    return this.storiesService.findBySlug(slug);
  }
}
