import { environment, getPreferenceValues } from "@raycast/api";

const preferences = getPreferenceValues<Preferences>();
const worklogPreferences = getPreferenceValues<Preferences.JiraWorklog>();
const commandName = environment.commandName;

export const CONFLUENCE_BASE_URL = preferences.confluenceBaseUrl;
export const CONFLUENCE_PAT = preferences.confluencePAT;

export const JIRA_BASE_URL = preferences.jiraBaseUrl;
export const JIRA_PAT = preferences.jiraPAT;

const DEFAULT_PAGINATION_SIZE = 20;
export const PAGINATION_SIZE = formatPaginationSize(preferences.paginationSize);
export const DEBUG_ENABLE = preferences.debugEnable;
export const REPLACE_CURRENT_USER = preferences.replaceCurrentUser;

export const CURRENT_PAT = commandName?.startsWith("jira-") ? JIRA_PAT : CONFLUENCE_PAT;
export const CURRENT_BASE_URL = commandName?.startsWith("jira-") ? JIRA_BASE_URL : CONFLUENCE_BASE_URL;

const DEFAULT_DAILY_WORK_HOURS = 8;
export const DAILY_WORK_HOURS = formatDailyWorkHours(worklogPreferences.jiraDailyWorkHours);
export const DAILY_WORK_SECONDS = DAILY_WORK_HOURS * 3600;

function formatPaginationSize(paginationSize: string) {
  const size = parseInt(paginationSize);
  return size > 0 ? size : DEFAULT_PAGINATION_SIZE;
}

function formatDailyWorkHours(input: string): number {
  const validFormat = /^\d+(\.\d{1,2})?$/;

  if (!validFormat.test(input)) {
    return DEFAULT_DAILY_WORK_HOURS;
  }

  return parseFloat(input);
}
