import { useEffect } from "react";

import { apiRequest, handleApiResponse } from "@/utils";

type RequestParams = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  endpoint: string;
  params?: Record<string, unknown>;
};

const CONFIG: RequestParams = {
  method: "GET",
  endpoint: "/rest/api/2/myself",
} as const;

export function useApiTest() {
  useEffect(() => {
    fetchApi();
  }, []);
}

async function fetchApi() {
  const { endpoint, method, params } = CONFIG;

  if (!endpoint) return;

  try {
    const data = await apiRequest({ method, endpoint, params });
    handleApiResponse({ data, fileName: "test", defaultValue: null });
  } catch (err) {
    console.error("❌ Fetch Test Error:", err);
  }
}
