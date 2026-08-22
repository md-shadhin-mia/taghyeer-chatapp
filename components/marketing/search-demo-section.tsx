export function SearchDemoSection() {
  return (
    <section className="border-t border-border-subtle bg-surface/40 px-6 py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-medium uppercase tracking-wide text-accent-hover">
            Find people
          </span>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Search by phone number, start chatting instantly.
          </h2>
          <p className="max-w-md text-muted">
            No usernames to remember. Look someone up by phone number and jump
            straight into a conversation-or add them to a new group.
          </p>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-background p-4">
          <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface px-3 py-2">
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4 text-muted"
            >
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
              <path d="m17 17-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-sm text-muted">
              +1 555 010<span className="animate-caret-blink">|</span>
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-to/15 text-xs font-medium text-accent-hover">
              J
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Jordan Miles</p>
              <p className="truncate text-xs text-muted">+1 555 010 2938</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
