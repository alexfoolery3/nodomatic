/**
 * Schema database — Nodomatic Prospector (PRD §5).
 *
 * Modular monolith: le tabelle di autenticazione (BetterAuth) e quelle di dominio
 * del modulo `prospector` convivono in un unico schema. Quando nasceranno nuovi
 * moduli Nodomatic, aggiungere qui le loro tabelle con un prefisso chiaro.
 *
 * - Tabelle auth (`user`, `session`, `account`, `verification`): id `text`,
 *   compatibili con i default di BetterAuth.
 * - Tabelle di dominio: id `uuid` con `defaultRandom()`.
 */
import {
  pgTable,
  pgEnum,
  text,
  uuid,
  integer,
  numeric,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enum
// ---------------------------------------------------------------------------
export const roleEnum = pgEnum("role", ["admin", "sales", "viewer"]);

export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "scraping",
  "auditing",
  "ready",
  "active",
  "archived",
]);

export const prospectStatusEnum = pgEnum("prospect_status", [
  "scraped",
  "audited",
  "contacted",
  "opened",
  "clicked",
  "replied",
  "meeting",
  "won",
  "lost",
  "cold",
]);

export const emailEventTypeEnum = pgEnum("email_event_type", [
  "sent",
  "delivered",
  "open",
  "click",
  "bounce",
  "complaint",
  "reply",
]);

export const interactionTypeEnum = pgEnum("interaction_type", [
  "note",
  "call",
  "email_manual",
  "meeting",
]);

export const followupStatusEnum = pgEnum("followup_status", [
  "scheduled",
  "sent",
  "skipped",
  "cancelled",
]);

// Modulo reporting (client analytics)
export const connectionProviderEnum = pgEnum("connection_provider", [
  "ga4",
  "meta_ads",
  "google_ads",
  "meta_organic",
]);

export const reportStatusEnum = pgEnum("report_status", ["draft", "ready"]);

// ---------------------------------------------------------------------------
// Tipi per colonne jsonb
// ---------------------------------------------------------------------------
export type TechStack = {
  cms?: string;
  jquery?: string;
  framework?: string;
  server?: string;
  [key: string]: string | undefined;
};

export type LandingCopy = {
  headline: string;
  subheadline: string;
  problems: string[];
  solutions: string[];
  cta: string;
};

// ---------------------------------------------------------------------------
// Auth (BetterAuth)
// ---------------------------------------------------------------------------
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  // Ruolo applicativo (PRD §2). admin | sales | viewer.
  role: roleEnum("role").notNull().default("sales"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Modulo prospector
// ---------------------------------------------------------------------------
export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  category: text("category").notNull(),
  status: campaignStatusEnum("status").notNull().default("draft"),
  createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const prospects = pgTable("prospects", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  businessName: text("business_name").notNull(),
  website: text("website"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  gmapsRating: numeric("gmaps_rating"),
  gmapsReviews: integer("gmaps_reviews"),
  category: text("category"),
  status: prospectStatusEnum("status").notNull().default("scraped"),
  // prospect_score 1-10 (PRD §6). Null finché non viene calcolato l'audit.
  prospectScore: integer("prospect_score"),
  // hash univoco usato per la URL della landing /p/[slug]
  slug: text("slug").unique(),
  // monitoraggio continuo del sito (tipicamente clienti acquisiti) — PRD §16 retention
  monitored: boolean("monitored").notNull().default(false),
  scrapedAt: timestamp("scraped_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const audits = pgTable("audits", {
  id: uuid("id").primaryKey().defaultRandom(),
  prospectId: uuid("prospect_id")
    .notNull()
    .references(() => prospects.id, { onDelete: "cascade" }),
  performanceScore: integer("performance_score"),
  seoScore: integer("seo_score"),
  accessibilityScore: integer("accessibility_score"),
  bestPracticesScore: integer("best_practices_score"),
  mobileFriendly: boolean("mobile_friendly"),
  hasHttps: boolean("has_https"),
  techStack: jsonb("tech_stack").$type<TechStack>(),
  loadTimeMs: integer("load_time_ms"),
  screenshotDesktop: text("screenshot_desktop"), // R2 URL
  screenshotMobile: text("screenshot_mobile"), // R2 URL
  auditedAt: timestamp("audited_at", { withTimezone: true }),
});

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  prospectId: uuid("prospect_id")
    .notNull()
    .references(() => prospects.id, { onDelete: "cascade" }),
  analysisText: text("analysis_text"),
  landingCopy: jsonb("landing_copy").$type<LandingCopy>(),
  emailSubject: text("email_subject"),
  emailBody: text("email_body"),
  generatedAt: timestamp("generated_at", { withTimezone: true }),
});

export const emailEvents = pgTable("email_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  prospectId: uuid("prospect_id")
    .notNull()
    .references(() => prospects.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").references(() => campaigns.id, { onDelete: "cascade" }),
  eventType: emailEventTypeEnum("event_type").notNull(),
  resendId: text("resend_id"),
  metadata: jsonb("metadata"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
});

export const landingVisits = pgTable("landing_visits", {
  id: uuid("id").primaryKey().defaultRandom(),
  prospectId: uuid("prospect_id")
    .notNull()
    .references(() => prospects.id, { onDelete: "cascade" }),
  ipHash: text("ip_hash"), // IP hashato (privacy/GDPR, PRD §12)
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  durationSec: integer("duration_sec"),
  visitedAt: timestamp("visited_at", { withTimezone: true }).notNull().defaultNow(),
});

export const interactions = pgTable("interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  prospectId: uuid("prospect_id")
    .notNull()
    .references(() => prospects.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  type: interactionTypeEnum("type").notNull(),
  content: text("content"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const followupSequences = pgTable("followup_sequences", {
  id: uuid("id").primaryKey().defaultRandom(),
  prospectId: uuid("prospect_id")
    .notNull()
    .references(() => prospects.id, { onDelete: "cascade" }),
  step: integer("step").notNull(), // 1..4 (PRD §9)
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  status: followupStatusEnum("status").notNull().default("scheduled"),
});

/** Snapshot periodici del monitoraggio sito (per clienti acquisiti). */
export const monitoringSnapshots = pgTable("monitoring_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  prospectId: uuid("prospect_id")
    .notNull()
    .references(() => prospects.id, { onDelete: "cascade" }),
  performanceScore: integer("performance_score"),
  seoScore: integer("seo_score"),
  accessibilityScore: integer("accessibility_score"),
  bestPracticesScore: integer("best_practices_score"),
  loadTimeMs: integer("load_time_ms"),
  hasHttps: boolean("has_https"),
  capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Entità condivisa: clienti (cross-modulo) — PRD §16 fondamenta condivise
// ---------------------------------------------------------------------------
export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  website: text("website"),
  // collegamento opzionale al prospect da cui è nato (loop lead→cliente)
  prospectId: uuid("prospect_id").references(() => prospects.id, { onDelete: "set null" }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Modulo reporting (analisi marketing dei clienti)
// ---------------------------------------------------------------------------
export const repConnections = pgTable("rep_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  provider: connectionProviderEnum("provider").notNull(),
  // GA4 property id / Meta ad account id / Google Ads customer id / IG-FB page id
  externalId: text("external_id").notNull(),
  displayName: text("display_name"),
  active: boolean("active").notNull().default(true),
  config: jsonb("config"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const repMetricsDaily = pgTable("rep_metrics_daily", {
  id: uuid("id").primaryKey().defaultRandom(),
  connectionId: uuid("connection_id")
    .notNull()
    .references(() => repConnections.id, { onDelete: "cascade" }),
  date: timestamp("date", { withTimezone: true }).notNull(),
  metrics: jsonb("metrics"), // KPI normalizzati per provider
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
});

export const repReports = pgTable("rep_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
  periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
  slug: text("slug").unique(), // link pubblico /r/[slug]
  data: jsonb("data"),
  narrativeText: text("narrative_text"),
  pdfUrl: text("pdf_url"), // R2
  status: reportStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Tipi inferiti (comodità per query e UI)
// ---------------------------------------------------------------------------
export type User = typeof user.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Prospect = typeof prospects.$inferSelect;
export type Audit = typeof audits.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type MonitoringSnapshot = typeof monitoringSnapshots.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type RepConnection = typeof repConnections.$inferSelect;
export type ConnectionProvider = (typeof connectionProviderEnum.enumValues)[number];

export type Role = (typeof roleEnum.enumValues)[number];
export type CampaignStatus = (typeof campaignStatusEnum.enumValues)[number];
export type ProspectStatus = (typeof prospectStatusEnum.enumValues)[number];
