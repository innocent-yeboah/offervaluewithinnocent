import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Inter, Newsreader } from "next/font/google";
import WarmNav from "@/components/WarmNav";
import SiteFooter from "@/components/Footer";
import { brandCss, palette } from "@/lib/palette";
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-64x64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: palette.paper },
    { media: "(prefers-color-scheme: dark)", color: palette.navy },
  ],
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
        <style dangerouslySetInnerHTML={{ __html: brandCss }} />
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
