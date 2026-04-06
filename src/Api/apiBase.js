const trimTrailingSlash = (value) => String(value ?? "").replace(/\/+$/, "");

const configuredApiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL);

const getApiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return configuredApiBaseUrl ? `${configuredApiBaseUrl}${normalizedPath}` : normalizedPath;
};

export { getApiUrl };
