export function RealtimeSection() {
  return (
    <section className="border-t border-border-subtle bg-surface/40 px-6 py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-medium uppercase tracking-wide text-accent-hover">
            Realtime delivery
          </span>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Messages arrive the instant they&apos;re sent.
          </h2>
          <p className="max-w-md text-muted">
            Built on Socket.IO, every message and group update reaches you live —
            no polling, no refresh. If your connection drops, Taghyeer Chat tells
            you immediately and recovers the moment you&apos;re back.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 rounded-2xl border border-border-subtle bg-background p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-to/15 text-sm font-medium text-accent-hover">
            You
          </div>
          <div className="relative h-px flex-1 bg-border-subtle">
            <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-accent-to animate-connector-travel" />
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-to/15 text-sm font-medium text-accent-hover">
            Them
          </div>
        </div>
      </div>
    </section>
  );
}
