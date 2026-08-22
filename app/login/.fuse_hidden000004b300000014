"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/auth/login-form";
import { FeatureShowcase } from "@/components/marketing/feature-showcase";
import { Wordmark } from "@/components/ui/wordmark";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/chat");
    }
  }, [isLoading, user, router]);

  if (isLoading || user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-accent-to" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-1 lg:grid lg:grid-cols-[1.1fr_minmax(0,520px)] xl:grid-cols-[1.25fr_minmax(0,560px)]">
      {/* Desktop-only marketing column-on mobile the form is the whole page. */}
      <div className="hidden border-r border-border-subtle bg-background lg:block">
        <FeatureShowcase />
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-background px-4 py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-accent-from/30 to-accent-to/20 blur-[120px] lg:hidden"
        />

        <div className="relative w-full max-w-md">
          {/* Wordmark + tagline only on mobile-on desktop the showcase column
              already carries the brand, and the card has its own heading. */}
          <div className="mb-8 flex flex-col items-center gap-2 text-center lg:hidden">
            <Wordmark className="text-3xl" />
            <p className="text-sm text-muted">Sign in to start messaging</p>
          </div>

          <LoginForm onSuccess={() => router.replace("/chat")} />

          <p className="mt-6 text-center text-xs text-muted-dim lg:text-left">
            By continuing you agree to be reachable at the phone number provided.
          </p>
        </div>
      </div>
    </div>
  );
}
