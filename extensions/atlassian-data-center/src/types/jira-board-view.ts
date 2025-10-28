import type { JiraUser, JiraTimeTracking, JiraStatus, JiraIssueType, JiraPriority, JiraEpic } from "@/types";

export interface JiraBoardIssueFields {
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
  epic?: JiraEpic;
  [key: string]: unknown;
}

export interface JiraBoardIssue {
  expand: string;
  id: string;
  self: string;
  key: string;
  fields: JiraBoardIssueFields;
}

export interface JiraBoardIssueResponse {
  expand: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraBoardIssue[];
}

export interface JiraBoard {
  id: number;
  self: string;
  name: string;
  type: "scrum" | "kanban";
}

export interface JiraBoardResponse {
  maxResults: number;
  startAt: number;
  total: number;
  isLast: boolean;
  values: JiraBoard[];
}

export interface JiraSprint {
  id: number;
  self: string;
  state: "future" | "active" | "closed";
  name: string;
  startDate: string;
  endDate: string;
  activatedDate: string;
  originBoardId: number;
  goal: string;
}

export interface JiraSprintResponse {
  maxResults: number;
  startAt: number;
  isLast: boolean;
  values: JiraSprint[];
}

export interface JiraBoardConfiguration {
  id: number;
  name: string;
  type: "scrum" | "kanban";
  self: string;
  filter: {
    id: string;
    self: string;
  };
  columnConfig: {
    columns: JiraBoardColumn[];
    constraintType: string;
  };
  estimation: {
    type: string;
    field: {
      fieldId: string;
      displayName: string;
    };
  };
  ranking: {
    rankCustomFieldId: number;
  };
}

export interface JiraBoardColumn {
  name: string;
  statuses: {
    id: string;
    self: string;
  }[];
}
