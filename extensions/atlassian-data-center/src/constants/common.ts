import { environment } from "@raycast/api";

const commandName = environment.commandName;

export const APP_TYPE = {
  CONFLUENCE: "confluence",
  JIRA: "jira",
} as const;

export const CURRENT_APP_TYPE = commandName?.startsWith("jira-") ? APP_TYPE.JIRA : APP_TYPE.CONFLUENCE;

export const COMMAND_NAME = {
  CONFLUENCE_SEARCH_CONTENTS: "confluence-search-contents",
  CONFLUENCE_SEARCH_USERS: "confluence-search-users",
  CONFLUENCE_SEARCH_SPACES: "confluence-search-spaces",
  JIRA_SEARCH_ISSUES: "jira-search-issues",
  JIRA_MANAGE_FIELDS: "jira-manage-fields",
  JIRA_WORKLOG_VIEW: "jira-worklog-view",
  JIRA_BOARD_VIEW: "jira-board-view",
  JIRA_NOTIFICATION_VIEW: "jira-notification-view",
} as const;
