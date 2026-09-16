import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UpdateProgressDto } from './dto/update-progress.dto.js';
import { LibraryService } from './library.service.js';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get('library')
  getLibrary(@CurrentUser() user: User) {
    return this.libraryService.getLibrary(user.id);
  }

  @Get('progress/:slug')
  getProgress(@CurrentUser() user: User, @Param('slug') slug: string) {
    return this.libraryService.getProgress(user.id, slug);
  }

  @Put('progress/:slug')
  updateProgress(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.libraryService.updateProgress(user.id, slug, dto);
  }

  @Post('bookmarks/:slug')
  addBookmark(@CurrentUser() user: User, @Param('slug') slug: string) {
    return this.libraryService.addBookmark(user.id, slug);
  }

  @Delete('bookmarks/:slug')
  removeBookmark(@CurrentUser() user: User, @Param('slug') slug: string) {
    return this.libraryService.removeBookmark(user.id, slug);
  }

  @Post('reading-list/:slug')
  addToReadingList(@CurrentUser() user: User, @Param('slug') slug: string) {
    return this.libraryService.addToReadingList(user.id, slug);
  }

  @Delete('reading-list/:slug')
  removeFromReadingList(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
  ) {
    return this.libraryService.removeFromReadingList(user.id, slug);
  }
}
