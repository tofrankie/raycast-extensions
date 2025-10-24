import { CURRENT_BASE_URL, CURRENT_PAT, CURRENT_APP_TYPE } from "@/constants";
import { AppType } from "@/types";
import { writeResponseFile } from "@/utils";

type Method = "GET" | "POST" | "PUT" | "DELETE";

type RequestParams = {
  method: Method;
  endpoint: string;
  params?: Record<string, unknown>;
};

export async function confluenceRequest<T>(params: RequestParams): Promise<T | null> {
  return apiRequest(params);
}

export async function jiraRequest<T>(params: RequestParams): Promise<T | null> {
  return apiRequest(params);
}

type ErrorContext = {
  appType: AppType;
  method: Method;
  endpoint: string;
};

export async function apiRequest<T>({ method, endpoint, params }: RequestParams): Promise<T | null> {
  const appType = CURRENT_APP_TYPE;
  const errorContext: ErrorContext = { appType, method, endpoint };

  try {
    const { url, body, headers } = buildRequest(method, endpoint, params);
    const response = await fetch(url, { method, headers, ...(body && { body }) });

    if (!response.ok) {
      throw await createHttpError(response, errorContext);
    }

    if (response.status === 204) {
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid URL")) {
      throw new Error(`Invalid ${appType} Base URL format. Please check your Atlassian Data Center preferences`);
    }

    if (error instanceof Error) {
      throw error; // Re-throw HTTP errors
    }

    throw createConnectionError(error, errorContext);
  }
}

type HandleApiResponseParams<T> = {
  data: T | null;
  fileName: string;
  defaultValue: T;
};

export function handleApiResponse<T>({ data, fileName, defaultValue }: HandleApiResponseParams<T>): T {
  if (!data) return defaultValue;

  writeResponseFile(JSON.stringify(data, null, 2), fileName);
  return data;
}

function buildRequest(method: Method, endpoint: string, params?: Record<string, unknown>) {
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

  const headers = getAuthHeaders(CURRENT_PAT);
  if (body) {
    headers["Content-Type"] = "application/json";
  }

  return { url: url.toString(), body, headers };
}

export function getAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
}

async function createHttpError(response: Response, context: ErrorContext): Promise<Error> {
  const { appType, method, endpoint } = context;
  const requestInfo = `${method} ${endpoint}`;

  let errorMessage = "";
  try {
    const errorBody = await response.json();
    errorMessage = extractErrorMessage(errorBody);
  } catch {
    // If we can't parse the response body, fall back to status-based messages
  }

  const baseMessage = getHttpErrorMessage(response.status, appType, requestInfo);
  const fullMessage = errorMessage ? `${baseMessage} Details: ${errorMessage}` : baseMessage;

  return new Error(fullMessage);
}

type ErrorResponse = {
  errorMessages?: string[];
  message?: string;
  error?: string | { message?: string };
  errors?: Record<string, unknown>;
};

function extractErrorMessage(errorBody: unknown): string {
  if (!isObject(errorBody)) {
    return "";
  }

  const body = errorBody as ErrorResponse;

  // Jira/Atlassian API error format
  if (body.errorMessages && Array.isArray(body.errorMessages)) {
    return body.errorMessages.join("; ");
  }

  // Standard error message
  if (body.message && typeof body.message === "string") {
    return body.message;
  }

  // Nested error object
  if (body.error) {
    if (typeof body.error === "string") {
      return body.error;
    }
    if (isObject(body.error) && "message" in body.error) {
      return String(body.error.message);
    }
  }

  // Field validation errors
  if (body.errors && isObject(body.errors)) {
    return Object.entries(body.errors)
      .map(([field, message]) => `${field}: ${String(message)}`)
      .join("; ");
  }

  return "";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getHttpErrorMessage(status: number, appType: AppType, requestInfo: string): string {
  const errorMap: Record<number, string> = {
    400: `Invalid request to ${appType} (${requestInfo}). Please check your search query or request parameters`,
    401: `Authentication failed or insufficient permissions for ${requestInfo}. Please check your ${appType} Personal Access Token in Atlassian Data Center preferences and ensure you have the required permissions`,
    403: `Access denied for ${requestInfo}. Please check your ${appType} permissions or contact your administrator`,
    404: `${appType} endpoint not found (${requestInfo}). Please check your ${appType} Base URL in Atlassian Data Center preferences`,
    429: `Rate limit exceeded for ${appType} (${requestInfo}). Please wait a moment and try again`,
    500: `${appType} server error for ${requestInfo}. Please try again later or contact your administrator`,
    502: `${appType} service is temporarily unavailable for ${requestInfo}. Please try again later`,
    503: `${appType} service is temporarily unavailable for ${requestInfo}. Please try again later`,
    504: `${appType} service is temporarily unavailable for ${requestInfo}. Please try again later`,
  };

  return (
    errorMap[status] ||
    `HTTP error ${status} from ${appType} for ${requestInfo}. Please check your preferences and try again`
  );
}

function createConnectionError(error: unknown, context: ErrorContext): Error {
  const { appType, method, endpoint } = context;
  const requestInfo = `${method} ${endpoint}`;

  if (error instanceof Error) {
    console.log("🚀 ~ createConnectionError ~ error.message:", error.message);

    if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
      return new Error(
        `Cannot resolve hostname for ${appType} while calling ${requestInfo}. Please check your ${appType} Base URL in Atlassian Data Center preferences. Make sure the URL is correct and accessible.`,
      );
    }

    if (error.message.includes("ECONNREFUSED")) {
      return new Error(
        `Connection refused to ${appType} while calling ${requestInfo}. Please check if the ${appType} server is running and the URL is correct.`,
      );
    }

    if (error.message.includes("ETIMEDOUT") || error.message.includes("timeout")) {
      return new Error(
        `Connection timeout to ${appType} while calling ${requestInfo}. Please check your network connection and try again.`,
      );
    }

    if (error.message.includes("fetch failed")) {
      return new Error(
        `Network error connecting to ${appType} while calling ${requestInfo}. Please check your ${appType} Base URL in Atlassian Data Center preferences and network connection.`,
      );
    }

    return new Error(`Failed to connect to ${appType} while calling ${requestInfo}: ${error.message}`);
  }

  return new Error(`Failed to connect to ${appType} while calling ${requestInfo}`);
}
