import { Reveal } from "@/components/marketing/reveal";

const FEATURES = [
  {
    title: "Performance",
    body: "Optimistic sends and cached conversations make every action feel instant.",
  },
  {
    title: "Works everywhere",
    body: "A responsive layout that feels native on desktop and mobile alike.",
  },
  {
    title: "Never lose track",
    body: "Unread counts follow you to the tab title and a notifications panel.",
  },
  {
    title: "Fails gracefully",
    body: "Clear loading, empty, and error states with one-tap retries.",
  },
];

export function ShowcaseSection() {
  return (
    <section className="border-t border-border-subtle px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-3 text-center">
          <span className="text-xs font-medium uppercase tracking-wide text-accent-hover">
            Polished UI
          </span>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Polished where it counts.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 0.1}>
              <div className="h-full rounded-2xl border border-border-subtle bg-surface p-6 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-accent-to/40 hover:shadow-[0_12px_32px_-16px_rgba(59,130,246,0.35)] motion-reduce:transform-none">
                <h3 className="mb-2 text-sm font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted">{feature.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
