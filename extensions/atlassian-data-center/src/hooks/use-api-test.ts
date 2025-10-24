import { useEffect } from "react";

import { apiRequest, handleApiResponse } from "@/utils";

const CONFIG = {
  method: "GET" as "GET" | "POST" | "PUT",
  endpoint: "/rest/api/2/myself",
  params: {},
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
