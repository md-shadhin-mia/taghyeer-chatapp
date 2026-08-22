import { Wordmark } from "@/components/ui/wordmark";

export function LandingFooter() {
  return (
    <footer className="border-t border-border-subtle px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 text-center">
        <Wordmark className="text-base font-semibold" />
        <p className="text-xs text-muted-dim">
          Real-time messaging, reimagined. &copy; {new Date().getFullYear()} Taghyeer Chat.
        </p>
      </div>
    </footer>
  );
}
