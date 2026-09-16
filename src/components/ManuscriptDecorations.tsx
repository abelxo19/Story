"use client";

import { useEffect, useRef } from "react";

export function ManuscriptDecorations() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;

      layer.style.setProperty("--parallax-x", `${x * 5}px`);
      layer.style.setProperty("--parallax-y", `${y * 4}px`);
      layer.style.setProperty("--parallax-reverse-x", `${x * -3.5}px`);
      layer.style.setProperty("--parallax-reverse-y", `${y * -2.8}px`);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <div ref={layerRef} className="manuscript-decorations" aria-hidden="true">
      <span className="botanical botanical-left">❧</span>
      <span className="botanical botanical-right">❧</span>
    </div>
  );
}
