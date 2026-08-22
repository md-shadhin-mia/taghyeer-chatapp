const FEATURES = [
  {
    title: "Works everywhere",
    body: "A responsive layout that feels native on desktop and mobile alike.",
  },
  {
    title: "Never lose track",
    body: "Unread counts follow you to the tab title and a notifications panel.",
  },
  {
    title: "Built for accessibility",
    body: "Semantic markup, visible focus states, and full keyboard support.",
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
            Built to last
          </span>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Polished where it counts.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border-subtle bg-surface p-6"
            >
              <h3 className="mb-2 text-sm font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted">{feature.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
