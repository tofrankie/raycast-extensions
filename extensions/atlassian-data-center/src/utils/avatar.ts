import path from "node:path";
import fs from "node:fs/promises";
import ky from "ky";

import { getAuthHeaders, avatarCache, ensureDirExists } from "@/utils";
import { AVATAR_DIR } from "@/constants";
import type { AvatarType } from "@/types";

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
