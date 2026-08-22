import Link from "next/link";

export function CtaSection() {
  return (
    <section className="border-t border-border-subtle bg-surface/40 px-6 py-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to start the conversation?
        </h2>
        <p className="max-w-md text-muted">
          Sign in with your phone number and pick up right where you left off.
        </p>
        <Link
          href="/login"
          className="rounded-full bg-accent-to px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Sign in to Taghyeer Chat
        </Link>
      </div>
    </section>
  );
}
