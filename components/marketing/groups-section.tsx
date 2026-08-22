import { Reveal } from "@/components/marketing/reveal";

const GROUPS = [
  { name: "Product team", detail: "You're an admin", admin: true },
  { name: "Design crew", detail: "3 members", admin: false },
  { name: "Weekend trip", detail: "3 members", admin: false },
];

export function GroupsSection() {
  return (
    <section className="border-t border-border-subtle px-6 py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <div className="order-2 flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface p-6 md:order-1">
          {GROUPS.map((group, i) => (
            <Reveal key={group.name} delay={i * 0.12}>
              <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-background px-4 py-3 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-accent-to/40 motion-reduce:transform-none">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-to/15 text-xs font-medium text-accent-hover">
                  {group.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{group.name}</p>
                  <p className="truncate text-xs text-muted">{group.detail}</p>
                </div>
                {group.admin ? (
                  <span className="flex flex-shrink-0 gap-2 text-[11px] font-medium">
                    <span className="text-accent-hover">Rename</span>
                    <span className="text-accent-hover">Make admin</span>
                    <span className="text-danger">Remove</span>
                  </span>
                ) : (
                  <span className="flex-shrink-0 rounded-full bg-accent-to/15 px-2 py-0.5 text-[11px] font-medium text-accent-hover">
                    Member
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <div className="order-1 flex flex-col gap-4 md:order-2">
          <span className="text-xs font-medium uppercase tracking-wide text-accent-hover">
            Group chat · Admin controls
          </span>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Bring the whole crew into one thread-and stay in control.
          </h2>
          <p className="max-w-md text-muted">
            Create a group in seconds, then run it like an admin: rename it,
            add or remove members, and promote new admins as plans change.
            Everyone gets the update the moment something shifts.
          </p>
        </div>
      </div>
    </section>
  );
}
