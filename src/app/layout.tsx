import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nodomatic",
    template: "%s · Nodomatic",
  },
  description:
    "Nodomatic — l'ecosistema di automazioni di RT Studio. Prospecting, audit siti, outreach e CRM.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
