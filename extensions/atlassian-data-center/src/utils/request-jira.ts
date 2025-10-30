import { jiraRequest, handleApiResponse } from "@/utils";
import { JIRA_API, COMMAND_NAME } from "@/constants";
import type {
  JiraSearchIssueResponse,
  JiraField,
  JiraProject,
  JiraCurrentUser,
  JiraWorklog,
  JiraSearchIssue,
  JiraTransitionResponse,
  JiraBoardResponse,
  JiraSprintResponse,
  JiraBoardConfiguration,
  JiraBoardIssueResponse,
  JiraWorklogCreateParams,
  JiraWorklogUpdateParams,
} from "@/types";

type JiraSearchIssueParams = {
  jql: string;
  startAt?: number;
  maxResults?: number;
  fields?: string[];
  expand?: string[];
  validateQuery?: boolean;
};

export async function searchJiraIssue(params: JiraSearchIssueParams): Promise<JiraSearchIssueResponse> {
  const data = await jiraRequest<JiraSearchIssueResponse>({ method: "GET", url: JIRA_API.SEARCH, params });

  return handleApiResponse({
    data,
    fileName: COMMAND_NAME.JIRA_SEARCH_ISSUE,
    defaultValue: {
      expand: "schema,names",
      startAt: 0,
      maxResults: 20,
      total: 0,
      issues: [] as JiraSearchIssueResponse["issues"],
      names: {},
    },
  });
}

export async function getJiraField(): Promise<JiraField[]> {
  const data = await jiraRequest<JiraField[]>({ method: "GET", url: JIRA_API.FIELD });

  return handleApiResponse({
    data,
    fileName: COMMAND_NAME.JIRA_MANAGE_FIELD,
    defaultValue: [],
  });
}

export async function getJiraProject(): Promise<JiraProject[]> {
  const data = await jiraRequest<JiraProject[]>({ method: "GET", url: JIRA_API.PROJECT });

  return handleApiResponse({
    data,
    fileName: "jira-project",
    defaultValue: [],
  });
}

export async function getJiraCurrentUser(): Promise<JiraCurrentUser | null> {
  const data = await jiraRequest<JiraCurrentUser>({ method: "GET", url: JIRA_API.CURRENT_USER });

  return handleApiResponse({
    data,
    fileName: "jira-current-user",
    defaultValue: null,
  });
}

type JiraWorklogsParams = {
  from: string;
  to: string;
  worker: string[];
};

export async function getJiraWorklogs(params: JiraWorklogsParams): Promise<JiraWorklog[]> {
  const data = await jiraRequest<JiraWorklog[]>({ method: "POST", url: JIRA_API.WORKLOG_SEARCH, params });

  return handleApiResponse({
    data,
    fileName: COMMAND_NAME.JIRA_WORKLOG_VIEW,
    defaultValue: [],
  });
}

export async function getJiraIssue(url: string): Promise<JiraSearchIssue> {
  const data = await jiraRequest<JiraSearchIssue>({ method: "GET", url });

  return handleApiResponse({
    data,
    fileName: "jira-issue",
    defaultValue: {} as JiraSearchIssue,
  });
}

export async function getJiraIssueTransitions(url: string): Promise<JiraTransitionResponse> {
  const data = await jiraRequest<JiraTransitionResponse>({ method: "GET", url });

  return handleApiResponse({
    data,
    fileName: "jira-issue-transitions",
    defaultValue: {
      expand: "transitions",
      transitions: [],
    },
  });
}
/**
 * See: https://developer.atlassian.com/server/jira/platform/rest/v11001/api-group-issue/#api-api-2-issue-issueidorkey-transitions-post
 */
type JiraIssueTransitionParams = {
  transition: {
    id: string;
  };
};

export async function transitionJiraIssue(url: string, params: JiraIssueTransitionParams): Promise<void> {
  await jiraRequest<void>({
    method: "POST",
    url,
    params,
  });
}

export async function getJiraBoards(): Promise<JiraBoardResponse> {
  const data = await jiraRequest<JiraBoardResponse>({ method: "GET", url: JIRA_API.BOARD });

  return handleApiResponse({
    data,
    fileName: COMMAND_NAME.JIRA_BOARD_VIEW,
    defaultValue: {
      maxResults: 50,
      startAt: 0,
      total: 0,
      isLast: true,
      values: [],
    },
  });
}

type JiraBoardSprintParams = {
  /**
   * Filters results to sprints in specified states. Valid values: future, active, closed. You can define multiple states separated by commas, e.g. state=active,closed
   */
  state?: string;
};

export async function getJiraBoardSprints(url: string, params: JiraBoardSprintParams): Promise<JiraSprintResponse> {
  const data = await jiraRequest<JiraSprintResponse>({ method: "GET", url, params });

  return handleApiResponse({
    data,
    fileName: "jira-board-sprints",
    defaultValue: {
      maxResults: 50,
      startAt: 0,
      isLast: true,
      values: [],
    },
  });
}

export async function getJiraBoardConfiguration(url: string): Promise<JiraBoardConfiguration> {
  const data = await jiraRequest<JiraBoardConfiguration>({ method: "GET", url });

  return handleApiResponse({
    data,
    fileName: "jira-board-configuration",
    defaultValue: {
      id: 0,
      name: "",
      type: "scrum",
      self: "",
      filter: { id: "", self: "" },
      columnConfig: { columns: [], constraintType: "none" },
      estimation: { type: "", field: { fieldId: "", displayName: "" } },
      ranking: { rankCustomFieldId: 0 },
    },
  });
}

type JiraBoardSprintIssueParams = {
  expand?: string;
  jql?: string;
  maxResults?: number;
  validateQuery?: boolean;
  fields?: string[];
  startAt?: number;
};

export async function getJiraBoardSprintIssues(
  url: string,
  params: JiraBoardSprintIssueParams,
): Promise<JiraBoardIssueResponse> {
  const data = await jiraRequest<JiraBoardIssueResponse>({
    method: "GET",
    url,
    params,
  });

  return handleApiResponse({
    data,
    fileName: "jira-board-sprint-issues",
    defaultValue: {
      expand: "schema,names",
      startAt: 0,
      maxResults: 50,
      total: 0,
      issues: [],
    },
  });
}

export async function getJiraWorklogById(worklogId: number): Promise<JiraWorklog> {
  const url = `${JIRA_API.WORKLOG}/${worklogId}`;
  const data = await jiraRequest<JiraWorklog>({ method: "GET", url });

  return handleApiResponse({
    data,
    fileName: "jira-worklog-detail",
    defaultValue: {} as JiraWorklog,
  });
}

export async function createJiraWorklog(params: JiraWorklogCreateParams): Promise<JiraWorklog> {
  const data = await jiraRequest<JiraWorklog>({
    method: "POST",
    url: JIRA_API.WORKLOG,
    params,
  });

  return handleApiResponse({
    data,
    fileName: "jira-worklog-create",
    defaultValue: {} as JiraWorklog,
  });
}

export async function updateJiraWorklog(worklogId: number, params: JiraWorklogUpdateParams): Promise<JiraWorklog> {
  const url = `${JIRA_API.WORKLOG}/${worklogId}/`;
  const data = await jiraRequest<JiraWorklog>({
    method: "PUT",
    url,
    params,
  });

  return handleApiResponse({
    data,
    fileName: "jira-worklog-update",
    defaultValue: {} as JiraWorklog,
  });
}
