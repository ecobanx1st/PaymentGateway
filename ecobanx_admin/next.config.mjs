function normalizeBasePath(value = "") {
  const cleanValue = String(value).trim().replace(/\/+$/, "");
 
  if (!cleanValue) {
    return "";
  }
 
  return cleanValue.startsWith("/") ? cleanValue : `/${cleanValue}`;
}
 
function normalizeBackendUrl(value = "") {
  const cleanValue = String(value).trim();
 
  if (!cleanValue) {
    return "";
  }
 
  return `${cleanValue.replace(/\/+$/, "")}/`;
}
 
function getEnvValue(keys) {
  return keys.map((key) => process.env[key]).find(Boolean);
}
 
const basePath = normalizeBasePath(
  getEnvValue(["NEXT_PUBLIC_BASE_PATH", "BASE_PATH", "Route"]),
);
const apiBaseUrl = normalizeBackendUrl(
  getEnvValue(["NEXT_PUBLIC_API_BASE_URL", "BASE_URL", "BACKEND_URL", "BackendURL"]),
);
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  // output: "export",
     trailingSlash: true,

  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_API_BASE_URL: apiBaseUrl,
  },
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: `${basePath}/auth/login`,
        basePath: false,
        permanent: false,
      },
    ];
  },
};
 
export default nextConfig;