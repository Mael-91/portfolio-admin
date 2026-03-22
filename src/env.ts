const websocketUrl =
  import.meta.env.VITE_WS_URL ??
  (import.meta.env.PROD
    ? "wss://admin-api.maelconstantin.fr:9860"
    : "ws://192.168.1.188:9862");

export const env = {
  websocketUrl,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://192.168.1.188:9808",
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
};