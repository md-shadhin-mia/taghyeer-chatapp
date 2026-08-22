import Link from "next/link";
import { Wordmark } from "@/components/ui/wordmark";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Wordmark className="text-xl font-semibold" />
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden text-sm text-muted transition-colors hover:text-foreground sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-accent-to px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
