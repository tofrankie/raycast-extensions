import { CURRENT_BASE_URL, CURRENT_PAT, CURRENT_APP_TYPE } from "@/constants";

type Method = "GET" | "POST" | "PUT" | "DELETE";

export async function confluenceRequest<T>(
  method: Method,
  endpoint: string,
  params?: Record<string, unknown>,
): Promise<T> {
  return apiRequest({
    method,
    endpoint,
    params,
  });
}

export async function jiraRequest<T>(method: Method, endpoint: string, params?: Record<string, unknown>): Promise<T> {
  return apiRequest({
    method,
    endpoint,
    params,
  });
}

export async function apiRequest<T>({
  method,
  endpoint,
  params,
}: {
  method: Method;
  endpoint: string;
  params?: Record<string, unknown>;
}): Promise<T> {
  const appType = CURRENT_APP_TYPE;

  try {
    const url = new URL(endpoint, CURRENT_BASE_URL);
    let body: string | undefined;

    if (params) {
      if (method === "GET" || method === "DELETE") {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.set(key, String(value));
          }
        });
      } else {
        body = JSON.stringify(params);
      }
    }

    const response = await fetch(url.toString(), {
      method,
      headers: getAuthHeaders(CURRENT_PAT),
      ...(body && { body }),
    });

    if (!response.ok) {
      await handleHttpError(response, appType);
    }

    if (response.status === 204) {
      return null as T;
    }

    const result = (await response.json()) as T;
    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("Invalid URL")) {
      throw new Error(`Invalid ${appType} Base URL format. Please check your Atlassian Data Center preferences`);
    }

    handleConnectionError(error, appType);
  }
}

export function getAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

async function handleHttpError(response: Response, appType: string): Promise<never> {
  let errorMessage = "";

  try {
    const errorBody = await response.json();

    if (errorBody.errorMessages && Array.isArray(errorBody.errorMessages)) {
      errorMessage = errorBody.errorMessages.join("; ");
    } else if (errorBody.message) {
      errorMessage = errorBody.message;
    } else if (errorBody.error) {
      errorMessage =
        typeof errorBody.error === "string"
          ? errorBody.error
          : errorBody.error.message || JSON.stringify(errorBody.error);
    } else if (errorBody.errors && typeof errorBody.errors === "object") {
      const errorDetails = Object.entries(errorBody.errors)
        .map(([field, message]) => `${field}: ${message}`)
        .join("; ");
      errorMessage = errorDetails;
    }
  } catch {
    // If we can't parse the response body, fall back to status-based messages
  }

  // Combine status-based message with detailed error message
  const baseMessage = getBaseErrorMessage(response.status, appType);
  const fullMessage = errorMessage ? `${baseMessage} Details: ${errorMessage}` : baseMessage;

  throw new Error(fullMessage);
}

function getBaseErrorMessage(status: number, appType: string): string {
  switch (status) {
    case 400:
      return `Invalid request to ${appType}. Please check your search query or request parameters`;
    case 401:
      return `Authentication failed. Please check your ${appType} Personal Access Token in Atlassian Data Center preferences`;
    case 403:
      return `Access denied. Please check your ${appType} permissions or contact your administrator`;
    case 404:
      return `${appType} endpoint not found. Please check your ${appType} Base URL in Atlassian Data Center preferences`;
    case 429:
      return `Rate limit exceeded for ${appType}. Please wait a moment and try again`;
    case 500:
      return `${appType} server error. Please try again later or contact your administrator`;
    case 502:
    case 503:
    case 504:
      return `${appType} service is temporarily unavailable. Please try again later`;
    default:
      return `HTTP error ${status} from ${appType}. Please check your preferences and try again`;
  }
}

function handleConnectionError(error: unknown, appType: string): never {
  if (error instanceof Error) {
    console.log("🚀 ~ handleConnectionError ~ error.message:", error.message);
    // Handle specific network errors
    if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
      throw new Error(
        `Cannot resolve hostname for ${appType}. Please check your ${appType} Base URL in Atlassian Data Center preferences. Make sure the URL is correct and accessible.`,
      );
    }

    if (error.message.includes("ECONNREFUSED")) {
      throw new Error(
        `Connection refused to ${appType}. Please check if the ${appType} server is running and the URL is correct.`,
      );
    }

    if (error.message.includes("ETIMEDOUT") || error.message.includes("timeout")) {
      throw new Error(`Connection timeout to ${appType}. Please check your network connection and try again.`);
    }

    if (error.message.includes("fetch failed")) {
      throw new Error(
        `Network error connecting to ${appType}. Please check your ${appType} Base URL in Atlassian Data Center preferences and network connection.`,
      );
    }

    // For other errors, include the original error message
    throw new Error(`Failed to connect to ${appType}: ${error.message}`);
  }

  throw new Error(`Failed to connect to ${appType}`);
}
