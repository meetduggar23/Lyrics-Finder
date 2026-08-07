import axios from "axios";
import { API } from "@/constants";

/**
 * Configured Axios instances for each external API.
 * Uses CORS proxy to enable browser requests.
 */

export const deezerClient = axios.create({
  baseURL: API.deezer,
  timeout: 15000,
  headers: { Accept: "application/json" },
});

export const ovhClient = axios.create({
  baseURL: API.ovh,
  timeout: 15000,
  headers: { Accept: "application/json" },
});

export const lrcLibClient = axios.create({
  baseURL: API.lrcLib,
  timeout: 15000,
  headers: { Accept: "application/json" },
});

export const itunesClient = axios.create({
  baseURL: API.itunes,
  timeout: 15000,
  headers: { Accept: "application/json" },
});

export const lastfmClient = axios.create({
  baseURL: API.lastfm,
  timeout: 15000,
  params: {
    api_key: import.meta.env.VITE_LASTFM_API_KEY || "",
    format: "json",
  },
});

export const auddClient = axios.create({
  baseURL: "https://corsproxy.io/?url=https://api.audd.io",
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
