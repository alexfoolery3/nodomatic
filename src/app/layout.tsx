import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nodomatic.vercel.app"),
  title: {
    default: "Nodomatic — Agency di automazione, marketing e AI",
    template: "%s · Nodomatic",
  },
  description:
    "Marketing professionale, non solo per le grandi aziende. Automazione, performance marketing e siti su misura per il tuo settore.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={GeistSans.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
