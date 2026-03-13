export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:9808",
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
};

console.log("FRONT MODE =", env.mode);
console.log("FRONT API BASE =", env.apiBaseUrl);