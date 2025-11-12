import {
  Action,
  ActionPanel,
  Cache,
  environment,
  Icon,
  showToast,
  Toast,
  confirmAlert,
  Alert,
  popToRoot,
} from "@raycast/api";
import { DEBUG_ENABLE, COMMAND_NAME, CACHE_KEY, AVATAR_TYPE } from "@/constants";
import { clearCacheDirectories, clearAvatarCacheByType } from "@/utils";
import type { AvatarType } from "@/types";

const SUPPORT_PATH = environment.supportPath;
const cache = new Cache();

export default function CacheActions() {
  const commandName = environment.commandName || "";

  function onSuccess() {
    showToast(Toast.Style.Success, "Cache Cleared");
    popToRoot({ clearSearchBar: false });
  }

  const clearAllCache = async () => {
    const confirmed = await confirmAlert({
      title: "Clear All Cache",
      message: "This will clear all caches including avatar cache and user settings. This action cannot be undone.",
      icon: Icon.Warning,
      primaryAction: {
        title: "Clear All",
        style: Alert.ActionStyle.Destructive,
      },
    });

    if (!confirmed) return;

    for (const avatarType of Object.values(AVATAR_TYPE)) {
      await clearAvatarCacheByType(avatarType as AvatarType);
    }

    cache.clear();
    await clearCacheDirectories();
    onSuccess();
  };

  let commandActions = null;
  switch (commandName) {
    case COMMAND_NAME.CONFLUENCE_SEARCH_CONTENT:
      commandActions = <ConfluenceSearchContentCacheActions onCleared={onSuccess} />;
      break;
    case COMMAND_NAME.CONFLUENCE_SEARCH_USER:
      commandActions = <ConfluenceSearchUserCacheActions onCleared={onSuccess} />;
      break;
    case COMMAND_NAME.CONFLUENCE_SEARCH_SPACE:
      commandActions = <ConfluenceSearchSpaceCacheActions onCleared={onSuccess} />;
      break;
    case COMMAND_NAME.JIRA_SEARCH_ISSUE:
      commandActions = <JiraSearchIssueCacheActions onCleared={onSuccess} />;
      break;
    case COMMAND_NAME.JIRA_MANAGE_FIELD:
      commandActions = <JiraManageFieldCacheActions onCleared={onSuccess} />;
      break;
    case COMMAND_NAME.JIRA_WORKLOG_VIEW:
      commandActions = <JiraWorklogViewCacheActions onCleared={onSuccess} />;
      break;
    case COMMAND_NAME.JIRA_BOARD_VIEW:
      commandActions = <JiraBoardViewCacheActions onCleared={onSuccess} />;
      break;
    case COMMAND_NAME.JIRA_NOTIFICATION_VIEW:
      commandActions = <JiraNotificationViewCacheActions onCleared={onSuccess} />;
      break;
    default:
      return null;
  }

  return (
    <ActionPanel.Section title="Cache">
      {DEBUG_ENABLE && <Action.Open title="Open Cache Directory" target={SUPPORT_PATH} />}
      {commandActions}
      <Action
        title="Clear Extension Cache"
        icon={Icon.Trash}
        style={Action.Style.Destructive}
        onAction={clearAllCache}
      />
    </ActionPanel.Section>
  );
}

interface CacheActionsProps {
  onCleared?: () => void;
}

function ConfluenceSearchContentCacheActions({ onCleared }: CacheActionsProps) {
  const clearCache = async () => {
    await clearAvatarCacheByType(AVATAR_TYPE.CONFLUENCE_USER);
    cache.remove(CACHE_KEY.CONFLUENCE_CURRENT_USER);
    onCleared?.();
  };

  return <Action title="Clear Command Cache" icon={Icon.Trash} onAction={clearCache} />;
}

function ConfluenceSearchUserCacheActions({ onCleared }: CacheActionsProps) {
  const clearCache = async () => {
    await clearAvatarCacheByType(AVATAR_TYPE.CONFLUENCE_USER);
    cache.remove(CACHE_KEY.CONFLUENCE_CURRENT_USER);
    onCleared?.();
  };

  return <Action title="Clear Command Cache" icon={Icon.Trash} onAction={clearCache} />;
}

function ConfluenceSearchSpaceCacheActions({ onCleared }: CacheActionsProps) {
  const clearCache = async () => {
    await clearAvatarCacheByType(AVATAR_TYPE.CONFLUENCE_SPACE);
    onCleared?.();
  };

  return <Action title="Clear Command Cache" icon={Icon.Trash} onAction={clearCache} />;
}

function JiraSearchIssueCacheActions({ onCleared }: CacheActionsProps) {
  const clearCache = async () => {
    cache.remove(CACHE_KEY.JIRA_NOTIFICATION_AVAILABLE);
    cache.remove(CACHE_KEY.JIRA_SELECTED_FIELDS);
    cache.remove(CACHE_KEY.JIRA_CURRENT_USER);
    onCleared?.();
  };

  return <Action title="Clear Command Cache" icon={Icon.Trash} onAction={clearCache} />;
}

function JiraManageFieldCacheActions({ onCleared }: CacheActionsProps) {
  const clearCache = async () => {
    cache.remove(CACHE_KEY.JIRA_SELECTED_FIELDS);
    onCleared?.();
  };

  return <Action title="Clear Command Cache" icon={Icon.Trash} onAction={clearCache} />;
}

function JiraWorklogViewCacheActions({ onCleared }: CacheActionsProps) {
  const clearCache = async () => {
    cache.remove(CACHE_KEY.JIRA_CURRENT_USER);
    onCleared?.();
  };

  return <Action title="Clear Command Cache" icon={Icon.Trash} onAction={clearCache} />;
}

function JiraBoardViewCacheActions({ onCleared }: CacheActionsProps) {
  const clearCache = async () => {
    cache.remove(CACHE_KEY.JIRA_SELECTED_BOARD_ID);
    cache.remove(CACHE_KEY.JIRA_SELECTED_BOARD_TYPE);
    onCleared?.();
  };

  return <Action title="Clear Command Cache" icon={Icon.Trash} onAction={clearCache} />;
}

function JiraNotificationViewCacheActions({ onCleared }: CacheActionsProps) {
  const clearCache = async () => {
    cache.remove(CACHE_KEY.JIRA_NOTIFICATION_AVAILABLE);
    onCleared?.();
  };

  return <Action title="Clear Command Cache" icon={Icon.Trash} onAction={clearCache} />;
}
