/**
 * Tech detection leggera (PRD §6: "WP < 5, jQuery 1.x, Flash, table layout").
 *
 * Niente dipendenze né servizi a pagamento: scarica l'HTML della homepage e
 * applica euristiche su markup e header. Resiliente: qualsiasi errore → stack
 * vuoto e `outdated = false` (non deve mai far fallire l'audit).
 */
import type { TechStack } from "@/lib/db/schema";

export type TechResult = { techStack: TechStack; outdated: boolean };

export async function detectTech(url: string): Promise<TechResult> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NodomaticBot/1.0)" },
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });

    const server = res.headers.get("server") ?? undefined;
    const poweredBy = res.headers.get("x-powered-by") ?? undefined;
    const html = await res.text();

    const stack: TechStack = {};
    let outdated = false;

    // WordPress (meta generator o path tipici) + versione
    const wpGen = /<meta[^>]+name=["']generator["'][^>]+content=["']WordPress\s*([0-9.]+)?/i.exec(
      html,
    );
    if (wpGen || /wp-content|wp-includes/i.test(html)) {
      const version = wpGen?.[1];
      stack.cms = version ? `WordPress ${version}` : "WordPress";
      if (version && Number.parseInt(version, 10) < 6) outdated = true;
    }

    // Altri CMS via meta generator (Joomla, Drupal, Wix, ...)
    if (!stack.cms) {
      const gen = /<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i.exec(html);
      if (gen) stack.cms = gen[1].trim();
    }

    // jQuery + versione (1.x = obsoleta)
    const jq =
      /jquery[-.]?([0-9]+\.[0-9]+(?:\.[0-9]+)?)(?:\.min)?\.js/i.exec(html) ??
      /jQuery\s+v?([0-9]+\.[0-9]+\.[0-9]+)/i.exec(html);
    if (jq) {
      stack.jquery = jq[1];
      if (jq[1].startsWith("1.")) outdated = true;
    }

    // Flash
    if (/\.swf\b/i.test(html) || /application\/x-shockwave-flash/i.test(html)) {
      stack.flash = "present";
      outdated = true;
    }

    // Layout a tabelle (euristica grezza)
    const tableCount = (html.match(/<table/gi) ?? []).length;
    if (tableCount >= 8) {
      stack.layout = "tables";
      outdated = true;
    }

    if (server) stack.server = server;
    if (poweredBy) stack.poweredBy = poweredBy;

    return { techStack: stack, outdated };
  } catch {
    return { techStack: {}, outdated: false };
  }
}
