"use client";

import useSWR from "swr";

import { api } from "@/lib/api";

export function useHealth() {
  return useSWR("/health", () => api.health(), {
    refreshInterval: 15000,
    revalidateOnFocus: false,
  });
}
