import path from "node:path";
import { environment } from "@raycast/api";

import type { AvatarType } from "@/types";

export const DEFAULT_AVATAR = "avatar-default.svg";

export const AVATAR_TYPE = {
  CONFLUENCE_USER: "confluence_user",
  CONFLUENCE_SPACE: "confluence_space",
} as const;

export const AVATAR_DIR = {
  [AVATAR_TYPE.CONFLUENCE_USER]: `${environment.supportPath}/avatar/confluence-user`,
  [AVATAR_TYPE.CONFLUENCE_SPACE]: `${environment.supportPath}/avatar/confluence-space`,
} as const satisfies Record<AvatarType, string>;

export const CACHE_DIRECTORY = {
  AVATAR: path.join(environment.supportPath, "avatar"),
  RESPONSE: path.join(environment.supportPath, "response"),
} as const;

export const CACHE_KEY = {
  JIRA_SELECTED_CUSTOM_FIELD: "jira_selected_custom_field",
  JIRA_CURRENT_USER: "jira_current_user",
  CONFLUENCE_CURRENT_USER: "confluence_current_user",
} as const;
