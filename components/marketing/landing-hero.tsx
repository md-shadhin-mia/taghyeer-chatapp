import Link from "next/link";
import { HeroDeviceMockup } from "@/components/marketing/hero-device-mockup";
import { Reveal } from "@/components/marketing/reveal";

export function LandingHero() {
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-gradient-to-br from-accent-from/25 to-accent-to/10 blur-[140px]"
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
        <Reveal className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <span className="rounded-full border border-border-subtle bg-surface px-4 py-1 text-xs font-medium text-muted">
            Performance-first realtime messaging.
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
              className="rounded-full bg-accent-to px-6 py-3 text-sm font-medium text-white transition-[background-color,transform] duration-200 hover:scale-[1.04] hover:bg-accent-hover active:scale-[0.98] motion-reduce:transform-none"
            >
              Start chatting
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-border-subtle px-6 py-3 text-sm font-medium text-muted transition-[color,border-color,transform] duration-200 hover:scale-[1.04] hover:border-accent-to hover:text-foreground active:scale-[0.98] motion-reduce:transform-none"
            >
              Sign in
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.18}>
          <HeroDeviceMockup />
        </Reveal>
      </div>
    </section>
  );
}
