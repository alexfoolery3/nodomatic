/**
 * Cloudflare R2 — storage screenshot (PRD §4.1, Fase 2).
 * R2 è S3-compatibile. build-green: client e chiavi risolti a runtime.
 */
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { requireEnv } from "@/lib/env";

/** True quando R2 è configurato (altrimenti gli screenshot vengono saltati). */
export const isR2Configured = Boolean(
  process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_PUBLIC_URL,
);

function createClient(): S3Client {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

/** Carica un oggetto su R2 e ritorna la URL pubblica. */
export async function uploadToR2(
  key: string,
  data: Uint8Array,
  contentType: string,
): Promise<string> {
  const bucket = requireEnv("R2_BUCKET_NAME");
  const publicUrl = requireEnv("R2_PUBLIC_URL");

  await createClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data,
      ContentType: contentType,
    }),
  );

  return `${publicUrl.replace(/\/$/, "")}/${key}`;
}
