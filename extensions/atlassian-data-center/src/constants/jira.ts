import type { JiraIssueTypeName, JiraPriorityType } from "@/types";

export const JIRA_ISSUE_TYPE_NAME = {
  BUG: "Bug",
  TASK: "Task",
  STORY: "Story",
  EPIC: "Epic",
  SUB_TASK: "Sub-task",
} as const;

export const JIRA_ISSUE_TYPE_ICON = {
  [JIRA_ISSUE_TYPE_NAME.BUG]: "icon-bug.svg",
  [JIRA_ISSUE_TYPE_NAME.TASK]: "icon-task.svg",
  [JIRA_ISSUE_TYPE_NAME.STORY]: "icon-story.svg",
  [JIRA_ISSUE_TYPE_NAME.EPIC]: "icon-epic.svg",
  [JIRA_ISSUE_TYPE_NAME.SUB_TASK]: "icon-subtask.svg",
} as const satisfies Record<JiraIssueTypeName, string>;

/**
 * Note: The values of JIRA_PRIORITY are all uppercase (e.g., "MAJOR").
 * The Jira API may return priority values in different cases, such as "Major", "MAJOR", or "major".
 * When comparing, always use `priority.toUpperCase()` before comparing with JIRA_PRIORITY.
 */
export const JIRA_PRIORITY = {
  BLOCKER: "BLOCKER",
  CRITICAL: "CRITICAL",
  MAJOR: "MAJOR",
  MINOR: "MINOR",
  HIGHEST: "HIGHEST",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
  LOWEST: "LOWEST",
  TRIVIAL: "TRIVIAL",
} as const;

export const JIRA_PRIORITY_ICON = {
  [JIRA_PRIORITY.BLOCKER]: "icon-priority-blocker.svg",
  [JIRA_PRIORITY.CRITICAL]: "icon-priority-critical.svg",
  [JIRA_PRIORITY.MAJOR]: "icon-priority-major.svg",
  [JIRA_PRIORITY.MINOR]: "icon-priority-minor.svg",
  [JIRA_PRIORITY.HIGHEST]: "icon-priority-highest.svg",
  [JIRA_PRIORITY.HIGH]: "icon-priority-high.svg",
  [JIRA_PRIORITY.MEDIUM]: "icon-priority-medium.svg",
  [JIRA_PRIORITY.LOW]: "icon-priority-low.svg",
  [JIRA_PRIORITY.LOWEST]: "icon-priority-lowest.svg",
  [JIRA_PRIORITY.TRIVIAL]: "icon-priority-trivial.svg",
} as const satisfies Record<JiraPriorityType, string>;

export const JIRA_WORKLOG_RANGE = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
} as const;
