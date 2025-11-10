import { JIRA_ISSUE_TYPE_NAME, JIRA_ISSUE_PRIORITY_NAME } from "@/constants";
import type { ValueOf, JiraIssueAvatarUrls } from "@/types";

export type JiraIssuePriorityName = ValueOf<typeof JIRA_ISSUE_PRIORITY_NAME>;

export type JiraIssueTypeName = ValueOf<typeof JIRA_ISSUE_TYPE_NAME>;

export interface JiraCurrentUser {
  self: string;
  key: string;
  name: string;
  emailAddress: string;
  avatarUrls: JiraIssueAvatarUrls;
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
