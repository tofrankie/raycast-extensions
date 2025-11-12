import path from "node:path";
import fs from "node:fs/promises";
import { Cache } from "@raycast/api";

import { CACHE_DIRECTORY, DEBUG_ENABLE, AVATAR_DIR } from "@/constants";
import { pathExists, ensureDirExists } from "@/utils";
import type { AvatarType } from "@/types";

export const avatarCache = new Cache();

export async function clearAvatarCacheByType(avatarType: AvatarType) {
  const avatarDir = AVATAR_DIR[avatarType];

  try {
    const exists = await pathExists(avatarDir);
    if (!exists) {
      console.log(`🚀 ~ Avatar directory does not exist: ${avatarDir}`);
      return;
    }

    const files = await fs.readdir(avatarDir);

    for (const file of files) {
      const key = path.parse(file).name;
      avatarCache.remove(key);
    }

    await fs.rm(avatarDir, { recursive: true, force: true });
    console.log(`🚀 ~ Cleared avatar cache for type: ${avatarType}`);
  } catch (error) {
    console.error(`🚀 ~ Failed to clear avatar cache for type ${avatarType}:`, error);
  }
}

export async function clearCacheDirectories() {
  const directories = Object.values(CACHE_DIRECTORY);

  for (const dir of directories) {
    try {
      const exists = await pathExists(dir);
      if (exists) {
        await fs.rm(dir, { recursive: true, force: true });
        console.log(`🚀 ~ Cleared cache directory: ${dir}`);
      }
    } catch (error) {
      console.error(`🚀 ~ Failed to clear directory ${dir}:`, error);
    }
  }
}

/**
 * Write API or command response data to debug file.
 * Only active when DEBUG_ENABLE is true.
 */
export async function writeResponseFile(content: string, filenameWithoutExt: string) {
  if (!DEBUG_ENABLE) return;

  try {
    await ensureDirExists(CACHE_DIRECTORY.RESPONSE);

    const filename = `${filenameWithoutExt}.json`;
    const filePath = path.join(CACHE_DIRECTORY.RESPONSE, filename);

    await fs.writeFile(filePath, content, "utf8");
    // console.log(`🚀 ~ Debug response written to: ${filePath}`);
  } catch (error) {
    console.warn("🚀 ~ Failed to write response file:", error);
  }
}
