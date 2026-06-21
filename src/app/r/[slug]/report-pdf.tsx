/**
 * Documento PDF del report (server-only, @react-pdf/renderer). Niente headless browser.
 */
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { ReportData } from "@/modules/reporting/report-service";

const PROVIDER_LABEL: Record<string, string> = {
  ga4: "Sito web (Google Analytics)",
  meta_ads: "Meta Ads",
  google_ads: "Google Ads",
  meta_organic: "Social organico",
};

type Kpi = { key: string; label: string; fmt: "eur" | "int" };
const KPIS: Record<string, Kpi[]> = {
  ga4: [
    { key: "activeUsers", label: "Utenti", fmt: "int" },
    { key: "sessions", label: "Sessioni", fmt: "int" },
    { key: "conversions", label: "Conversioni", fmt: "int" },
  ],
  meta_ads: [
    { key: "spend", label: "Spesa", fmt: "eur" },
    { key: "impressions", label: "Impression", fmt: "int" },
    { key: "clicks", label: "Click", fmt: "int" },
    { key: "conversions", label: "Conversioni", fmt: "int" },
  ],
  google_ads: [
    { key: "spend", label: "Spesa", fmt: "eur" },
    { key: "impressions", label: "Impression", fmt: "int" },
    { key: "clicks", label: "Click", fmt: "int" },
    { key: "conversions", label: "Conversioni", fmt: "int" },
  ],
  meta_organic: [
    { key: "impressions", label: "Impression", fmt: "int" },
    { key: "engagement", label: "Engagement", fmt: "int" },
    { key: "followers", label: "Nuovi follower", fmt: "int" },
  ],
};

function fmt(v: number, kind: "eur" | "int") {
  if (kind === "eur") return `€ ${v.toLocaleString("it-IT", { maximumFractionDigits: 2 })}`;
  return Math.round(v).toLocaleString("it-IT");
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: "#171717", fontFamily: "Helvetica" },
  h1: { fontSize: 22, marginBottom: 4 },
  sub: { fontSize: 10, color: "#737373", marginBottom: 16 },
  narrative: { fontSize: 11, lineHeight: 1.5, marginBottom: 20 },
  section: { marginBottom: 14, borderTop: "1pt solid #e5e5e5", paddingTop: 10 },
  h2: { fontSize: 13, marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  label: { color: "#525252" },
  value: { fontFamily: "Helvetica-Bold" },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#a3a3a3",
  },
});

export async function renderReportPdf(args: {
  clientName: string;
  periodStart: string;
  periodEnd: string;
  narrative: string;
  data: ReportData;
}): Promise<Buffer> {
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{args.clientName}</Text>
        <Text style={styles.sub}>
          Report performance · {args.periodStart} – {args.periodEnd}
        </Text>
        {args.narrative ? <Text style={styles.narrative}>{args.narrative}</Text> : null}
        {args.data.providers.map((p, i) => (
          <View key={i} style={styles.section} wrap={false}>
            <Text style={styles.h2}>
              {PROVIDER_LABEL[p.provider] ?? p.provider} · {p.displayName}
            </Text>
            {(KPIS[p.provider] ?? []).map((k) => (
              <View key={k.key} style={styles.row}>
                <Text style={styles.label}>{k.label}</Text>
                <Text style={styles.value}>{fmt(p.totals[k.key] ?? 0, k.fmt)}</Text>
              </View>
            ))}
          </View>
        ))}
        <Text style={styles.footer}>Report a cura di RT Studio · Nodomatic</Text>
      </Page>
    </Document>
  );
  return renderToBuffer(doc);
}
