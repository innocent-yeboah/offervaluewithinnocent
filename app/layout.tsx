import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Inter, Newsreader } from "next/font/google";
import WarmNav from "@/components/WarmNav";
import SiteFooter from "@/components/Footer";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.headline,
  authors: [{ name: site.author }],
  openGraph: {
    type: "website",
    locale: "en",
    url: site.url,
    siteName: site.name,
    title: site.name,
    description: site.headline,
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF6F0",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeScript = `
try {
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
  }
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-paper text-ink antialiased">
        <a className="skip-link" href="#main">
          Skip to writing
        </a>
        <WarmNav />
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
