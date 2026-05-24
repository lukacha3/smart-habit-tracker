import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  // Desactivamos la PWA en modo desarrollo para que no te tire errores falsos
  disable: process.env.NODE_ENV === "development",
  // Evitamos que guarde en caché llamadas a la API de la IA por error
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Acá iría cualquier otra configuración que ya tuvieras (si estaba vacío, dejalo así)
};

export default withPWA(nextConfig);