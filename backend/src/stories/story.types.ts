export interface StoryScene {
  id: string;
  title: string;
  text: string;
  imageUrl: string;
  sortOrder: number;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage?: string;
  source?: string;
  sourceUrl?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  scenes: StoryScene[];
}
