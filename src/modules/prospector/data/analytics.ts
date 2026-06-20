/**
 * Data layer — analytics aggregati per campagna (Drizzle). Runtime-only.
 * Tassi di apertura/click/risposta su base "prospect contattati" (PRD §10 Fase 4).
 */
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { emailEvents, prospects } from "@/lib/db/schema";

export type CampaignAnalytics = {
  total: number;
  contacted: number;
  opened: number;
  clicked: number;
  replied: number;
  won: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
};

const num = (v: unknown) => Number(v ?? 0);

export async function getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
  const [emailAgg] = await db
    .select({
      contacted: sql`count(distinct case when ${emailEvents.eventType} = 'sent' then ${emailEvents.prospectId} end)`,
      opened: sql`count(distinct case when ${emailEvents.eventType} = 'open' then ${emailEvents.prospectId} end)`,
      clicked: sql`count(distinct case when ${emailEvents.eventType} = 'click' then ${emailEvents.prospectId} end)`,
    })
    .from(emailEvents)
    .where(eq(emailEvents.campaignId, campaignId));

  const [prospectAgg] = await db
    .select({
      total: sql`count(*)`,
      replied: sql`count(*) filter (where ${prospects.status} = 'replied')`,
      won: sql`count(*) filter (where ${prospects.status} = 'won')`,
    })
    .from(prospects)
    .where(eq(prospects.campaignId, campaignId));

  const contacted = num(emailAgg?.contacted);
  const opened = num(emailAgg?.opened);
  const clicked = num(emailAgg?.clicked);
  const replied = num(prospectAgg?.replied);
  const rate = (n: number) => (contacted > 0 ? Math.round((n / contacted) * 100) : 0);

  return {
    total: num(prospectAgg?.total),
    contacted,
    opened,
    clicked,
    replied,
    won: num(prospectAgg?.won),
    openRate: rate(opened),
    clickRate: rate(clicked),
    replyRate: rate(replied),
  };
}

/** Stessi KPI ma aggregati su tutte le campagne (dashboard home). */
export async function getGlobalAnalytics(): Promise<CampaignAnalytics> {
  const [emailAgg] = await db
    .select({
      contacted: sql`count(distinct case when ${emailEvents.eventType} = 'sent' then ${emailEvents.prospectId} end)`,
      opened: sql`count(distinct case when ${emailEvents.eventType} = 'open' then ${emailEvents.prospectId} end)`,
      clicked: sql`count(distinct case when ${emailEvents.eventType} = 'click' then ${emailEvents.prospectId} end)`,
    })
    .from(emailEvents);

  const [prospectAgg] = await db
    .select({
      total: sql`count(*)`,
      replied: sql`count(*) filter (where ${prospects.status} = 'replied')`,
      won: sql`count(*) filter (where ${prospects.status} = 'won')`,
    })
    .from(prospects);

  const contacted = num(emailAgg?.contacted);
  const opened = num(emailAgg?.opened);
  const clicked = num(emailAgg?.clicked);
  const replied = num(prospectAgg?.replied);
  const rate = (n: number) => (contacted > 0 ? Math.round((n / contacted) * 100) : 0);

  return {
    total: num(prospectAgg?.total),
    contacted,
    opened,
    clicked,
    replied,
    won: num(prospectAgg?.won),
    openRate: rate(opened),
    clickRate: rate(clicked),
    replyRate: rate(replied),
  };
}
