import Link from "next/link";

export function LandingHero() {
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-gradient-to-br from-accent-from/25 to-accent-to/10 blur-[140px]"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <span className="rounded-full border border-border-subtle bg-surface px-4 py-1 text-xs font-medium text-muted">
          Real-time messaging, reimagined.
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
          Conversations that keep up with you.
        </h1>
        <p className="max-w-xl text-base text-muted sm:text-lg">
          Taghyeer Chat delivers messages instantly, keeps groups organized, and
          never leaves you guessing whether you&apos;re still connected.
        </p>
        <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-full bg-accent-to px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Start chatting
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-border-subtle px-6 py-3 text-sm font-medium text-muted transition-colors hover:border-accent-to hover:text-foreground"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
