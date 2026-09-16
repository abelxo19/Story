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

export interface LibraryItem {
  story: Story;
  favorite: boolean;
  onReadingList: boolean;
  completed: boolean;
  unread: boolean;
  inProgress: boolean;
  sceneIndex: number;
}

export interface LibraryPayload {
  continueReading: {
    sceneIndex: number;
    sceneTitle: string;
    story: Story;
  } | null;
  items: LibraryItem[];
  favorites: Story[];
  readingList: Story[];
  completed: Story[];
  unread: Story[];
}

export interface StoryProgress {
  sceneIndex: number;
  completed: boolean;
  bookmarked: boolean;
  favorite?: boolean;
  onReadingList?: boolean;
}
