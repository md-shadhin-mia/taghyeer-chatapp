import type { Metadata } from "next";
import { LandingNav } from "@/components/marketing/landing-nav";
import { LandingHero } from "@/components/marketing/landing-hero";
import { RealtimeSection } from "@/components/marketing/realtime-section";
import { GroupsSection } from "@/components/marketing/groups-section";
import { SearchDemoSection } from "@/components/marketing/search-demo-section";
import { ShowcaseSection } from "@/components/marketing/showcase-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { LandingFooter } from "@/components/marketing/landing-footer";

export const metadata: Metadata = {
  title: "Taghyeer Chat — Real-time messaging, reimagined.",
};

/**
 * Marketing landing page. The root layout locks body scrolling for the chat
 * app, so this page owns its own scroll container; the nav sticks to its top.
 */
export default function LandingPage() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-none scroll-smooth bg-background text-white motion-reduce:scroll-auto">
      <LandingNav />
      <main>
        <LandingHero />
        <RealtimeSection />
        <GroupsSection />
        <SearchDemoSection />
        <ShowcaseSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
