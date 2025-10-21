import { JIRA_ISSUE_TYPE_ICON } from "@/constants";

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
