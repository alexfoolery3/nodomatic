import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

/**
 * Layout del sito vetrina. La classe `site` attiva il tema metallico dark scoped
 * (variabili in globals.css) senza toccare la dashboard.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="site flex min-h-screen flex-col bg-site-canvas font-sans text-site-body">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
