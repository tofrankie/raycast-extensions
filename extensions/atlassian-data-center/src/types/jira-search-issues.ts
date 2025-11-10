import type { JiraIssueUser, JiraIssueTimeTracking, JiraIssueStatus, JiraIssueType, JiraIssuePriority } from "@/types";

export interface JiraSearchIssuesResponse {
  expand: string;
  issues: JiraSearchIssue[];
  maxResults: number;
  startAt: number;
  total: number;
  names?: Record<string, string>;
}

export interface JiraSearchIssue {
  expand: string;
  id: string;
  self: string;
  key: string;
  fields: JiraSearchIssuesFields;
}

/**
 * Fields returned by `/rest/api/2/search` endpoint based on the `fields` parameter
 */
export interface JiraSearchIssuesFields {
  summary: string;
  issuetype: JiraIssueType;
  duedate: string | null;
  created: string;
  reporter: JiraIssueUser;
  assignee: JiraIssueUser;
  priority: JiraIssuePriority;
  updated: string | null;
  timetracking?: JiraIssueTimeTracking;
  status: JiraIssueStatus;
  [key: string]: unknown; // custom field
}
