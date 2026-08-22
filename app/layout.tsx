import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { ConnectionBanner } from "@/components/feedback/connection-banner";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Taghyeer Chat",
  description: "Real-time messaging, reimagined.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="h-full flex flex-col overflow-hidden">
        <AppProviders>
          <ConnectionBanner />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
