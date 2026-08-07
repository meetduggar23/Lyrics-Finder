import axios from "axios";
import { API } from "@/constants";

/**
 * Configured Axios instances for each external API.
 * Requests are routed through a CORS proxy that forwards the complete target
 * URL (including its query params) inside the proxy's `url` parameter.
 */

const proxyBase =
  import.meta.env.VITE_API_PROXY?.replace(/\/+$/, "") ||
  "https://corsproxy.io";

const PROXY_URL = `${proxyBase}/?url=`;

interface ProxiedClientOptions {
  baseURL: string;
  timeout: number;
}

/**
 * Create an axios client that wraps requests through the CORS proxy.
 * Query params are merged into the upstream URL before it is encoded into the
 * proxy's `url` parameter, so they are never dropped as sibling params of the
 * proxy request itself.
 */
function createProxiedClient({ baseURL, timeout }: ProxiedClientOptions) {
  const client = axios.create({
    timeout,
    headers: { Accept: "application/json" },
  });

  client.interceptors.request.use((config) => {
    const base = baseURL.replace(/\/+$/, "");
    const path = (config.url || "").replace(/^\/+/, "");
    const target = new URL(path, `${base}/`);
    const params = config.params as Record<string, unknown> | undefined;
    config.params = undefined;
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          target.searchParams.set(key, String(value));
        }
      }
    }
    config.url = `${PROXY_URL}${encodeURIComponent(target.toString())}`;
    return config;
  });

  return client;
}

export const deezerClient = createProxiedClient({
  baseURL: API.deezer,
  timeout: 15000,
});

export const ovhClient = createProxiedClient({
  baseURL: API.ovh,
  timeout: 15000,
});

export const lrcLibClient = createProxiedClient({
  baseURL: API.lrcLib,
  timeout: 15000,
});

export const itunesClient = createProxiedClient({
  baseURL: API.itunes,
  timeout: 15000,
});

export const lastfmClient = axios.create({
  baseURL: API.lastfm,
  timeout: 15000,
  headers: { Accept: "application/json" },
  params: {
    api_key: import.meta.env.VITE_LASTFM_API_KEY || "",
    format: "json",
  },
});

export const auddClient = axios.create({
  baseURL: `${PROXY_URL}${encodeURIComponent("https://api.audd.io")}`,
  timeout: 30000,
});

// Global error interceptor
const errorInterceptor = (error: unknown) => {
  return Promise.reject(error);
};

deezerClient.interceptors.response.use((r) => r, errorInterceptor);
ovhClient.interceptors.response.use((r) => r, errorInterceptor);
lrcLibClient.interceptors.response.use((r) => r, errorInterceptor);
itunesClient.interceptors.response.use((r) => r, errorInterceptor);
lastfmClient.interceptors.response.use((r) => r, errorInterceptor);
auddClient.interceptors.response.use((r) => r, errorInterceptor);
