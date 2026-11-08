"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center px-6 py-16">
      <section className="w-full max-w-md text-center" role="alert">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--green)]">Workspace unavailable</p>
        <h1 className="display-type mt-4 text-4xl">We couldn&apos;t load your projects.</h1>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          The database may be temporarily unavailable. Try loading the workspace again.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-7 rounded-lg bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--green)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--green)]"
        >
          Retry
        </button>
      </section>
    </main>
  );
}