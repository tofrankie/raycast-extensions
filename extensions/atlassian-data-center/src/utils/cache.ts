import path from "node:path";
import fs from "node:fs/promises";
import { Cache, showToast, Toast } from "@raycast/api";

import { CACHE_DIRECTORY, DEBUG_ENABLE } from "@/constants";
import { pathExists, ensureDirExists, clearDirExistsCache } from "@/utils";

const cacheInstances = new Set<Cache>();

export const avatarCache = createCache();

export const jiraCustomFieldCache = createCache();

export const jiraCurrentUserCache = createCache();

export async function clearAllCacheWithToast() {
  await clearAllCache();
  showToast(Toast.Style.Success, "Cache Cleared");
}

/**
 * Clear all caches, both Raycast Cache instances and cache directories.
 */
export async function clearAllCache() {
  clearAllRaycastCache();
  await clearCacheDirectories();
  console.log("🚀 ~ All cache cleared");
}

/**
 * Create a Raycast Cache instance and track it.
 */
export function createCache(options?: { namespace?: string; capacity?: number }): Cache {
  const cache = new Cache(options);
  cacheInstances.add(cache);
  return cache;
}

/**
 * Clear all tracked Raycast Cache instances.
 */
export function clearAllRaycastCache() {
  cacheInstances.forEach((cache) => {
    cache.clear({ notifySubscribers: false });
  });
  // Do not clear cacheInstances to support multiple clears in one process lifecycle
}

/**
 * Clear all cache directories on disk.
 */
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

  clearDirExistsCache();
}

/**
 * Write API or command response data to debug file.
 * Only active when DEBUG_ENABLE is true.
 */
export async function writeResponseFile(content: string, commandName: string) {
  if (!DEBUG_ENABLE) return;

  try {
    await ensureDirExists(CACHE_DIRECTORY.RESPONSE);

    const filename = `${commandName}.json`;
    const filePath = path.join(CACHE_DIRECTORY.RESPONSE, filename);

    await fs.writeFile(filePath, content, "utf8");
    // console.log(`🚀 ~ Debug response written to: ${filePath}`);
  } catch (error) {
    console.warn("🚀 ~ Failed to write response file:", error);
  }
}
