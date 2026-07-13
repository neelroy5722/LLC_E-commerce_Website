import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${SITE.domain}`),
  title: {
    default: `${SITE.name} — ${SITE.product} | ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "The Apt.Bed is one furniture unit combining a bed, closet, desk, chest of drawers, and bed table — engineered to save space. Configure your size, height, and finish.",
  keywords: ["Apt.Bed", "space-saving furniture", "murphy bed alternative", "Victory Martin"],
  openGraph: {
    title: `${SITE.name} — ${SITE.product}`,
    description: SITE.tagline,
    url: `https://${SITE.domain}`,
    siteName: SITE.name,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
