import { JIRA_BASE_URL, JIRA_ISSUE_TYPE_ICON_MAP, JIRA_ISSUE_PRIORITY_ICON_MAP } from "@/constants";

export function getIssuePriorityIcon(priority: string): string | undefined {
  const normalizedPriority = priority.toUpperCase();

  if (isBuiltinPriority(normalizedPriority)) {
    return JIRA_ISSUE_PRIORITY_ICON_MAP[normalizedPriority];
  }

  const similarPriority = Object.keys(JIRA_ISSUE_PRIORITY_ICON_MAP).find((key) => key.includes(normalizedPriority));
  if (similarPriority && isBuiltinPriority(similarPriority)) {
    return JIRA_ISSUE_PRIORITY_ICON_MAP[similarPriority];
  }

  return undefined;
}

function isBuiltinPriority(priority: string): priority is keyof typeof JIRA_ISSUE_PRIORITY_ICON_MAP {
  return priority in JIRA_ISSUE_PRIORITY_ICON_MAP;
}

export function getIssueTypeIcon(issueTypeName: string): string | undefined {
  if (isBuiltinIssueType(issueTypeName, JIRA_ISSUE_TYPE_ICON_MAP)) {
    return JIRA_ISSUE_TYPE_ICON_MAP[issueTypeName];
  }

  const iconMap = {
    // builtin issue type
    ...JIRA_ISSUE_TYPE_ICON_MAP,

    // custom issue type
    TEST: "icon-flask.svg",
    SUGGESTION: "icon-story.svg",
    IMPROVEMENT: "icon-improvement.svg",
    "NEW FEATURE": "icon-new-feature.svg",
  } as const;

  const similarType = Object.keys(iconMap).find((key) => issueTypeName.toLowerCase().includes(key.toLowerCase()));
  if (similarType && isBuiltinIssueType(similarType, iconMap)) {
    return iconMap[similarType];
  }

  return undefined;
}

function isBuiltinIssueType<T extends Record<string, string>>(
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
 * Check if input may be a Jira issue key (e.g. "DEV-123")
 */
export function isIssueKey(input: string): boolean {
  return /^[A-Z][A-Z0-9_]*-\d+$/.test(input);
}

/**
 * Check if input may be an issue number (e.g. "123" from "DEV-123")
 */
export function isIssueNumber(input: string): boolean {
  return /^\d+$/.test(input);
}
