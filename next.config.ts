import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Screenshot dei siti prospect (audit) vengono serviti da Cloudflare R2.
  // Aggiungere qui l'hostname pubblico di R2 quando configurato in Fase 2.
  images: {
    remotePatterns: [
      // { protocol: "https", hostname: "<r2-public-host>" },
    ],
  },
};

export default nextConfig;
