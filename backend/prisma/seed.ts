import { PrismaClient, Role, StoryStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import { loadStoriesFromMarkdown } from '../src/stories/stories.loader.js';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('ChangeMe123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@story.local' },
    update: { role: Role.ADMIN, passwordHash },
    create: {
      email: 'admin@story.local',
      name: 'Story Keeper',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'reader@story.local' },
    update: {},
    create: {
      email: 'reader@story.local',
      name: 'Young Reader',
      passwordHash,
      role: Role.USER,
    },
  });

  const stories = loadStoriesFromMarkdown();
  for (const [index, story] of stories.entries()) {
    const existing = await prisma.story.findUnique({
      where: { slug: story.slug },
    });

    const data = {
      title: story.title,
      description: story.description,
      source: story.source,
      sourceUrl: story.sourceUrl,
      coverImage: story.scenes[0]?.imageUrl,
      status: StoryStatus.PUBLISHED,
      sortOrder: index + 1,
    };

    const storyId = existing
      ? (
          await prisma.story.update({
            where: { id: existing.id },
            data,
          })
        ).id
      : (
          await prisma.story.create({
            data: { ...data, slug: story.slug },
          })
        ).id;

    if (existing) {
      await prisma.scene.deleteMany({ where: { storyId } });
    }

    await prisma.scene.createMany({
      data: story.scenes.map((scene, sceneIndex) => ({
        storyId,
        title: scene.title,
        text: scene.text,
        imageUrl: scene.imageUrl,
        sortOrder: sceneIndex,
      })),
    });
  }
}

await main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
