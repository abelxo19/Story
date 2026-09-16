import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module.js';
import { AuthModule } from './auth/auth.module.js';
import { LibraryModule } from './library/library.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { StoriesModule } from './stories/stories.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    StoriesModule,
    LibraryModule,
    AdminModule,
  ],
})
export class AppModule {}
