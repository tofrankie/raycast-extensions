import { JIRA_BOARD_TYPE } from "@/constants";
import type {
  JiraIssueUser,
  JiraIssueTimeTracking,
  JiraIssueStatus,
  JiraIssueType,
  JiraIssuePriority,
  JiraEpic,
  ValueOf,
} from "@/types";

export type JiraBoardType = ValueOf<typeof JIRA_BOARD_TYPE>;

export interface JiraKanbanBoardIssueFields {
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
  epic?: JiraEpic;
  [key: string]: unknown;
}

export interface JiraKanbanBoardIssue {
  expand: string;
  id: string;
  self: string;
  key: string;
  fields: JiraKanbanBoardIssueFields;
}

export interface JiraKanbanBoardIssueResponse {
  expand: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraKanbanBoardIssue[];
  names?: Record<string, string>;
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
