export function GroupsSection() {
  return (
    <section className="border-t border-border-subtle px-6 py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <div className="order-2 flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface p-6 md:order-1">
          {["Product team", "Design crew", "Weekend trip"].map((name, i) => (
            <div
              key={name}
              className="flex items-center gap-3 rounded-xl border border-border-subtle bg-background px-4 py-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-to/15 text-xs font-medium text-accent-hover">
                {name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{name}</p>
                <p className="truncate text-xs text-muted">
                  {i === 0 ? "You're an admin" : "3 members"}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="order-1 flex flex-col gap-4 md:order-2">
          <span className="text-xs font-medium uppercase tracking-wide text-accent-hover">
            Group chats
          </span>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Bring the whole crew into one thread.
          </h2>
          <p className="max-w-md text-muted">
            Create a group in seconds, hand out admin roles, and manage
            membership as plans change. Everyone gets updates the moment
            something shifts — renamed, added, or removed.
          </p>
        </div>
      </div>
    </section>
  );
}
