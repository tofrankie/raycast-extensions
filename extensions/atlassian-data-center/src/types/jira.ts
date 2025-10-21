import { JIRA_ISSUE_TYPE_NAME, JIRA_PRIORITY } from "@/constants";

import type { ValueOf } from "./common";

export type JiraPriorityType = ValueOf<typeof JIRA_PRIORITY>;

export type JiraIssueTypeName = ValueOf<typeof JIRA_ISSUE_TYPE_NAME>;

export interface JiraAvatarUrls {
  "48x48": string;
  "24x24": string;
  "16x16": string;
  "32x32": string;
}

export interface JiraPreferences {
  jiraBaseUrl: string;
  jiraPersonalAccessToken: string;
  paginationSize: number;
}

export interface JiraSearchIssueResponse {
  expand: string;
  issues: JiraIssue[];
  maxResults: number;
  startAt: number;
  total: number;
  names?: Record<string, string>;
}

export interface JiraIssue {
  expand: string;
  id: string;
  self: string;
  key: string;
  fields: JiraIssueFields;
}

export interface JiraIssueFields {
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
  [key: string]: unknown; // TODO: custom field
}

export interface JiraUser {
  self: string;
  name: string;
  key: string;
  emailAddress: string;
  avatarUrls: JiraAvatarUrls;
  displayName: string;
  active: boolean;
  timeZone: string;
}

export interface JiraCurrentUser {
  self: string;
  key: string;
  name: string;
  emailAddress: string;
  avatarUrls: JiraAvatarUrls;
  displayName: string;
  active: boolean;
  deleted: boolean;
  timeZone: string;
  locale: string;
  groups: {
    size: number;
    items: unknown[];
  };
  applicationRoles: {
    size: number;
    items: unknown[];
  };
  expand: string;
}

export interface JiraProject {
  self: string;
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  avatarUrls: JiraAvatarUrls;
  projectCategory?: {
    self: string;
    id: string;
    name: string;
    description: string;
  };
}

export interface JiraTimeTracking {
  timeSpent: string;
  timeSpentSeconds: number;
  originalEstimate?: string;
  remainingEstimate?: string;
  originalEstimateSeconds?: number;
  remainingEstimateSeconds?: number;
}

export interface JiraStatus {
  self: string;
  description: string;
  iconUrl: string;
  name: string;
  id: string;
  statusCategory: {
    self: string;
    id: number;
    key: string;
    colorName: string;
    name: string;
  };
}

export interface JiraIssueType {
  self: string;
  id: string;
  description: string;
  iconUrl: string;
  name: string;
  subtask: boolean;
  avatarId: number;
}

export interface JiraPriority {
  self: string;
  iconUrl: string;
  name: string;
  id: string;
}

export interface JiraField {
  id: string;
  name: string;
  custom: boolean;
  orderable: boolean;
  navigable: boolean;
  searchable: boolean;
  clauseNames: string[];
  schema?: {
    type: string;
    system?: string;
    custom?: string;
    customId?: number;
    items?: string;
  };
}

export interface JiraWorklog {
  billableSeconds: number;
  timeSpent: string;
  tempoWorklogId: number;
  timeSpentSeconds: number;
  issue: {
    epicKey: string;
    epicIssue: {
      issueType: string;
      iconUrl: string;
      summary: string;
      estimatedRemainingSeconds?: number;
    };
    reporterKey: string;
    issueStatus: string;
    internalIssue: boolean;
    issueType: string;
    projectId: number;
    projectKey: string;
    iconUrl: string;
    summary: string;
    components: unknown[];
    versions: unknown[];
    key: string;
    id: number;
  };
  comment: string;
  location: {
    name: string;
    id: number;
  };
  attributes: Record<string, unknown>;
  worker?: string;
  updater: string;
  started: string;
  originTaskId: number;
  dateCreated: string;
  dateUpdated: string;
  originId: number;
}
