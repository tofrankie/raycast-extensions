import path from "node:path";
import fs from "node:fs/promises";
import ky from "ky";
import { Image } from "@raycast/api";

import { getAuthHeaders, ensureDirExists, avatarCache } from "@/utils";
import { AVATAR_DIR, DEFAULT_AVATAR } from "@/constants";
import type { AvatarType, ListItemIcon } from "@/types";

type DownloadAvatarOptions = {
  type: AvatarType;
  token: string;
  url: string;
  key: string;
};

export async function downloadAvatar(options: DownloadAvatarOptions) {
  const { type, token, url, key } = options;

  try {
    const outputDir = AVATAR_DIR[type];
    await ensureDirExists(outputDir);

    const response = await ky.get(url, {
      headers: getAuthHeaders(token),
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const contentType = response.headers.get("content-type");
    const ext = getImageExtension(url, contentType);
    const finalPath = path.join(outputDir, `${key}${ext}`);

    await fs.writeFile(finalPath, buffer);
    avatarCache.set(key, finalPath);

    return finalPath;
  } catch (error) {
    return error instanceof Error ? error.message : "Unknown error";
  }
}

export function getImageExtension(originalUrl: string, contentType?: string | null) {
  const url = new URL(originalUrl);
  const pathname = url.pathname;
  const ext = path.extname(pathname);

  if (ext) {
    return ext;
  }

  if (contentType) {
    return getExtensionFromContentType(contentType);
  }

  return ".png";
}

function getExtensionFromContentType(contentType: string) {
  const mimeType = contentType.split(";")[0].trim().toLowerCase();
  const mimeToExtMap: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
  };
  return mimeToExtMap[mimeType] || ".png";
}

export function getAvatarPath(cacheKey?: string): string {
  if (cacheKey && avatarCache.has(cacheKey)) {
    const cachedPath = avatarCache.get(cacheKey);
    if (cachedPath) {
      return cachedPath;
    }
  }
  return DEFAULT_AVATAR;
}

export function getAvatarIcon(cacheKey?: string, tooltip?: string): NonNullable<ListItemIcon> {
  const source = getAvatarPath(cacheKey);
  return {
    source,
    mask: Image.Mask.Circle,
    ...(tooltip && { tooltip }),
  };
}

/**
 * Extract cache key from Jira user avatar URL.
 *
 * Uses the query string as the cache key because:
 * - A Jira user may have multiple avatars (different versions)
 * - The query string uniquely identifies the specific avatar instance
 * - This ensures each avatar variant is cached separately
 *
 * @example
 * Input: "https://jira.example.com/secure/useravatar?ownerId=frankie&avatarId=123"
 * Output: "ownerId=frankie&avatarId=123"
 */
export function getJiraUserAvatarCacheKey(avatarUrl: string): string | undefined {
  try {
    const url = new URL(avatarUrl);
    const queryString = url.search.substring(1); // Remove leading '?'
    return queryString || undefined;
  } catch {
    return undefined;
  }
}
