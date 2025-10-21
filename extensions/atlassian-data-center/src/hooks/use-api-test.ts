import { useEffect } from "react";

import { CURRENT_BASE_URL, CURRENT_PAT } from "@/constants";
import { getAuthHeaders, writeResponseFile } from "@/utils";

const FETCH_CONFIG = {
  method: "POST" as "GET" | "POST" | "PUT",
  endpoint: "/rest/tempo-timesheets/4/worklogs/search",
  params: {
    from: "2025-08-04",
    to: "2025-08-10",
    worker: ["JIRAUSER15518"],
  },
} as const;

export function useApiTest() {
  useEffect(() => {
    fetchApi();
  }, []);
}

async function fetchApi() {
  const { endpoint, method, params } = FETCH_CONFIG;

  if (!endpoint) return;

  try {
    const url = new URL(endpoint, CURRENT_BASE_URL);

    const requestOptions: RequestInit = {
      method,
      headers: getAuthHeaders(CURRENT_PAT),
    };

    if (method === "GET") {
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }
    } else if (method === "POST" || method === "PUT") {
      if (params) {
        requestOptions.body = JSON.stringify(params);
        requestOptions.headers = {
          ...requestOptions.headers,
          "Content-Type": "application/json",
        };
      }
    }

    const response = await fetch(url.toString(), requestOptions);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    writeResponseFile(JSON.stringify(result, null, 2), "test");
  } catch (err) {
    console.error("❌ Fetch Test Error:", err);
  }
}
