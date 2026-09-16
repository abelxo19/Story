import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { AdminService } from './admin.service.js';
import {
  ReorderScenesDto,
  UpsertSceneDto,
  UpsertStoryDto,
} from './dto/admin-story.dto.js';

const uploadStorage = diskStorage({
  destination: join(process.cwd(), 'uploads'),
  filename: (_req, file, callback) => {
    callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
  },
});

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stories')
  listStories() {
    return this.adminService.listStories();
  }

  @Post('stories')
  createStory(@Body() dto: UpsertStoryDto) {
    return this.adminService.createStory(dto);
  }

  @Get('stories/:id')
  getStory(@Param('id') id: string) {
    return this.adminService.getStory(id);
  }

  @Patch('stories/:id')
  updateStory(@Param('id') id: string, @Body() dto: UpsertStoryDto) {
    return this.adminService.updateStory(id, dto);
  }

  @Delete('stories/:id')
  deleteStory(@Param('id') id: string) {
    return this.adminService.deleteStory(id);
  }

  @Post('stories/:id/scenes')
  addScene(@Param('id') id: string, @Body() dto: UpsertSceneDto) {
    return this.adminService.addScene(id, dto);
  }

  @Patch('stories/:id/scenes/reorder')
  reorderScenes(@Param('id') id: string, @Body() dto: ReorderScenesDto) {
    return this.adminService.reorderScenes(id, dto);
  }

  @Patch('stories/:id/scenes/:sceneId')
  updateScene(
    @Param('id') id: string,
    @Param('sceneId') sceneId: string,
    @Body() dto: UpsertSceneDto,
  ) {
    return this.adminService.updateScene(id, sceneId, dto);
  }

  @Delete('stories/:id/scenes/:sceneId')
  deleteScene(@Param('id') id: string, @Param('sceneId') sceneId: string) {
    return this.adminService.deleteScene(id, sceneId);
  }

  @Post('uploads')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: uploadStorage,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadCover(@UploadedFile() file: Express.Multer.File) {
    return this.adminService.validateUpload(file);
  }
}
