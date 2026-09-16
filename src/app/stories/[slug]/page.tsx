import Link from "next/link";
import { notFound } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { StoryReader } from "@/components/StoryReader";
import { getStory } from "@/lib/api";

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;

  let story;
  try {
    story = await getStory(slug);
  } catch {
    notFound();
  }

  return (
    <RequireAuth>
      <div className="min-h-full bg-[#f6ead8]">
        <div className="px-6 pt-8">
          <Link
            href="/library"
            className="story-kicker inline-block text-sm tracking-[0.25em] uppercase text-amber-900/60 hover:text-amber-900"
          >
            Back to all stories
          </Link>
        </div>
        <StoryReader story={story} />
      </div>
    </RequireAuth>
  );
}
