import { JIRA_BASE_URL, JIRA_ISSUE_TYPE_ICON } from "@/constants";

export function getIssueTypeIcon(issueType: string): string | undefined {
  if (isBuiltInIssueType(issueType, JIRA_ISSUE_TYPE_ICON)) {
    return JIRA_ISSUE_TYPE_ICON[issueType];
  }

  const issueTypeIconMap = {
    ...JIRA_ISSUE_TYPE_ICON,
    // custom issue type
    TEST: "icon-flask.svg",
  } as const;

  const similarIssueType = Object.keys(issueTypeIconMap).find((key) =>
    issueType.toLowerCase().includes(key.toLowerCase()),
  );
  if (similarIssueType && isBuiltInIssueType(similarIssueType, issueTypeIconMap)) {
    return issueTypeIconMap[similarIssueType];
  }

  return undefined;
}

function isBuiltInIssueType<T extends Record<string, string>>(
  issueType: string,
  iconMap: T,
): issueType is keyof T & string {
  return issueType in iconMap;
}

export function getJiraIssueUrl(issueKey: string): string {
  return `${JIRA_BASE_URL}/browse/${issueKey}`;
}

export function getJiraIssueEditUrl(issueId: string): string {
  return `${JIRA_BASE_URL}/secure/EditIssue!default.jspa?id=${issueId}`;
}

/**
 * Check if input may be a Jira issue key (e.g., "DEV-123")
 */
export function isIssueKey(input: string): boolean {
  return /^[A-Z][A-Z0-9_]*-\d+$/.test(input);
}

/**
 * Check if input may be an issue number (e.g., "123" from "DEV-123")
 */
export function isIssueNumber(input: string): boolean {
  return /^\d+$/.test(input);
}
