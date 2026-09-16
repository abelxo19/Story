export interface StoryScene {
  id: string;
  title: string;
  text: string;
  imageUrl: string;
  sortOrder?: number;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage?: string;
  source?: string;
  sourceUrl?: string;
  status?: "DRAFT" | "PUBLISHED";
  scenes: StoryScene[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface LibraryPayload {
  continueReading: {
    sceneIndex: number;
    sceneTitle: string;
    story: Story;
  } | null;
  bookmarks: Story[];
  completed: Story[];
  progress: Array<{
    storyId: string;
    slug: string;
    sceneIndex: number;
    completed: boolean;
    updatedAt: string;
  }>;
}

export interface StoryProgress {
  sceneIndex: number;
  completed: boolean;
  bookmarked: boolean;
}
