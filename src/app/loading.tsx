export default function Loading() {
  return (
    <main className="min-h-screen px-5 pb-16 pt-6 sm:px-8 sm:pt-9" aria-busy="true">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-5">
          <div className="h-10 w-36 animate-pulse rounded-lg bg-[#dfe8df]" />
          <div className="h-3 w-32 animate-pulse rounded bg-[#dfe8df]" />
        </div>
        <div className="py-10 sm:py-14">
          <div className="h-3 w-32 animate-pulse rounded bg-[#dfe8df]" />
          <div className="mt-4 h-12 w-56 animate-pulse rounded bg-[#dfe8df]" />
          <div className="mt-4 h-4 max-w-md animate-pulse rounded bg-[#e5ebe5]" />
        </div>
        <div className="mb-4 h-8 border-b border-[var(--line)]" />
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-56 animate-pulse rounded-2xl border border-[var(--line)] bg-white/70" />
          ))}
        </div>
        <span className="sr-only">Loading projects</span>
      </div>
    </main>
  );
}