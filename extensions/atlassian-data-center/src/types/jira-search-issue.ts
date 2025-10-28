import type { JiraUser, JiraTimeTracking, JiraStatus, JiraIssueType, JiraPriority } from "@/types";

export interface JiraSearchIssueResponse {
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
  fields: JiraSearchIssueFields;
}

/**
 * Fields returned by `/rest/api/2/search` endpoint based on the `fields` parameter
 */
export interface JiraSearchIssueFields {
  summary: string;
  issuetype: JiraIssueType;
  duedate: string | null;
  created: string;
  reporter: JiraUser;
  assignee: JiraUser;
  priority: JiraPriority;
  updated: string | null;
  timetracking?: JiraTimeTracking;
  status: JiraStatus;
  [key: string]: unknown; // custom field
}
