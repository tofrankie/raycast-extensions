import { Image } from "@raycast/api";

import { DEFAULT_AVATAR } from "@/constants";
import { getJiraIssueUrl } from "@/utils";
import { avatarCache } from "@/utils";
import type {
  JiraNotificationItem,
  ProcessedJiraNotification,
  ListItemAccessories,
  ListItemSubtitle,
  ListItemIcon,
} from "@/types";

export function processJiraNotificationView(items: JiraNotificationItem[]): ProcessedJiraNotification[] {
  return items.map((item) => processJiraNotificationItem(item));
}

function processJiraNotificationItem(item: JiraNotificationItem): ProcessedJiraNotification {
  const url = getJiraIssueUrl(item.issueKey);
  const avatarCacheKey = getAvatarCacheKey(item.avatarUrl);
  const icon = getAvatarIcon(avatarCacheKey, item.actionUser);

  const title = {
    value: item.title,
    tooltip: item.title,
  };

  const notificationContent = item.desktopNotificationContent ?? item.content;

  let tooltip = notificationContent;
  if (item.notificationsChildList && item.notificationsChildList.length > 0) {
    const childContents = item.notificationsChildList.map((child) => `- ${child.content}`);
    tooltip = [notificationContent, ...childContents].join("\n");
  }

  const subtitle: ListItemSubtitle = {
    value: notificationContent,
    tooltip,
  };

  const accessories: ListItemAccessories = [];

  if (item.date) {
    accessories.push({
      text: item.date,
      tooltip: item.date,
    });
  }

  if (item.state === 0) {
    accessories.push({
      tag: { value: "Unread", color: "#e1f5fe" },
      tooltip: "State: Unread",
    });
  }

  const keywords = [item.issueKey, item.actionUser];

  return {
    renderKey: String(item.notificationId),
    icon,
    title,
    keywords,
    subtitle,
    notificationId: item.notificationId,
    issueKey: item.issueKey,
    content: notificationContent,
    accessories,
    url,
    state: item.state,
    actionTime: item.longDate,
    actionMakerAvatarUrl: item.avatarUrl,
    actionMakerAvatarCacheKey: avatarCacheKey,
  };
}

function getAvatarCacheKey(avatarUrl: string): string | undefined {
  try {
    // example: "https://jira.example.com/secure/useravatar?ownerId=frankie&avatarId=11502"
    const url = new URL(avatarUrl);
    const queryString = url.search.substring(1); // Remove leading '?'
    return queryString;
  } catch {
    return undefined;
  }
}

function getAvatarIcon(cacheKey?: string, actionMakerFullName?: string): ListItemIcon {
  if (cacheKey && avatarCache.has(cacheKey)) {
    const cachedPath = avatarCache.get(cacheKey);
    if (cachedPath) {
      return {
        source: cachedPath,
        mask: Image.Mask.Circle,
        tooltip: actionMakerFullName,
      };
    }
  }

  return {
    source: DEFAULT_AVATAR,
    mask: Image.Mask.Circle,
    tooltip: actionMakerFullName,
  };
}
