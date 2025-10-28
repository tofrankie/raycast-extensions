import { JIRA_ISSUE_TYPE_NAME, JIRA_ISSUE_PRIORITY_NAME } from "@/constants";
import type { ValueOf } from "./common";

export type JiraIssuePriorityName = ValueOf<typeof JIRA_ISSUE_PRIORITY_NAME>;

export type JiraIssueTypeName = ValueOf<typeof JIRA_ISSUE_TYPE_NAME>;

export interface JiraAvatarUrls {
  "48x48": string;
  "24x24": string;
  "16x16": string;
  "32x32": string;
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
  /**
   * Issue Status ID
   */
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

export interface JiraEpic {
  id: number;
  key: string;
  self: string;
  name: string;
  summary: string;
  color: {
    key: string;
  };
  done: boolean;
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

export interface JiraTransition {
  /**
   * Transition ID
   */
  id: string;
  name: string;
  to: JiraStatus;
}

export interface JiraTransitionResponse {
  expand: string;
  transitions: JiraTransition[];
}

export interface JiraIssueTransitionRequest {
  transition: {
    id: string;
  };
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
