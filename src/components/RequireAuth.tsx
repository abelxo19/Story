"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return (
      <div className="manuscript-page min-h-full">
        <p className="relative z-10 px-6 py-24 text-center text-amber-900/60">
          Opening the library...
        </p>
      </div>
    );
  }

  return children;
}
