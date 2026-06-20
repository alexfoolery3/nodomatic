import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Dashboard",
};

const modules = [
  {
    name: "Campagne",
    description: "Crea una campagna (categoria + città) e lancia lo scraping.",
    phase: "Fase 1",
  },
  {
    name: "Prospect",
    description: "Lista auditata e ordinata per score, con filtri.",
    phase: "Fase 1",
  },
  {
    name: "Landing",
    description: "Pagine personalizzate /p/[slug] per ogni prospect qualificato.",
    phase: "Fase 2",
  },
  {
    name: "Outreach & CRM",
    description: "Email tracciate, follow-up automatici, schede prospect.",
    phase: "Fase 3-4",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Prospector</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Modulo di acquisizione clienti. Fondamenta pronte — le funzionalità
          arrivano per fasi.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {modules.map((m) => (
          <Card key={m.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{m.name}</CardTitle>
                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600">
                  {m.phase}
                </span>
              </div>
              <CardDescription>{m.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
