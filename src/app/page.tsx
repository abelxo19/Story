import Link from "next/link";
import { LandingActions } from "@/components/LandingActions";
import { ManuscriptDecorations } from "@/components/ManuscriptDecorations";

export default function LandingPage() {
  return (
    <div className="manuscript-page min-h-full">
      <ManuscriptDecorations />
      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-16 sm:px-10 sm:py-24">
        <header className="page-intro text-center">
          <p className="story-kicker mb-4 text-xs tracking-[0.4em] uppercase text-amber-900/65">
            A quiet library of tales
          </p>
          <h1 className="story-title text-5xl leading-[1.08] text-amber-950 sm:text-6xl">
            Open a book. Keep your place.
          </h1>
          <div className="ornamental-divider mx-auto my-7" aria-hidden="true">
            <span>✦</span>
          </div>
          <p className="story-body mx-auto max-w-2xl text-base leading-8 text-amber-950/75 sm:text-lg">
            Illustrated fairy tales and original retellings, set like an old
            manuscript. Sign in to open the library, continue where you left off,
            and keep the tales you love.
          </p>
          <LandingActions />
        </header>

        <section className="grid gap-6 md:grid-cols-3" aria-label="What you can do">
          {[
            {
              title: "Keep your place",
              text: "The last chapter you opened waits for you, so the tale can continue without hunting for the page.",
            },
            {
              title: "Save favorites",
              text: "Bookmark the stories you want to reread — a small ribbon on the shelf of your account.",
            },
            {
              title: "A keeper’s desk",
              text: "Editors can draft, publish, upload covers, and reorder chapters from a quiet admin room.",
            },
          ].map((item) => (
            <article key={item.title} className="story-card relative rounded-[0.9rem] p-6">
              <h2 className="story-scene-title text-2xl text-amber-950">{item.title}</h2>
              <p className="story-body mt-3 text-sm leading-7 text-amber-950/72">{item.text}</p>
            </article>
          ))}
        </section>

        <div className="closing-ornament" aria-hidden="true">
          <span>❦</span>
        </div>
      </main>
    </div>
  );
}
