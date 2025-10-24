import { jiraRequest, handleApiResponse } from "@/utils";
import { JIRA_API, COMMAND_NAME } from "@/constants";
import type {
  JiraSearchIssueResponse,
  JiraField,
  JiraProject,
  JiraCurrentUser,
  JiraWorklog,
  JiraIssue,
  JiraTransitionResponse,
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
  const data = await jiraRequest<JiraSearchIssueResponse>({ method: "GET", endpoint: JIRA_API.SEARCH, params });

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
  const data = await jiraRequest<JiraField[]>({ method: "GET", endpoint: JIRA_API.FIELD });

  return handleApiResponse({
    data,
    fileName: COMMAND_NAME.JIRA_MANAGE_FIELD,
    defaultValue: [],
  });
}

export async function getJiraProject(): Promise<JiraProject[]> {
  const data = await jiraRequest<JiraProject[]>({ method: "GET", endpoint: JIRA_API.PROJECT });

  return handleApiResponse({
    data,
    fileName: "jira-project",
    defaultValue: [],
  });
}

export async function getJiraCurrentUser(): Promise<JiraCurrentUser | null> {
  const data = await jiraRequest<JiraCurrentUser>({ method: "GET", endpoint: JIRA_API.CURRENT_USER });

  return handleApiResponse({
    data,
    fileName: "jira-current-user",
    defaultValue: null,
  });
}

type JiraWorklogParams = {
  from: string;
  to: string;
  worker: string[];
};

export async function getJiraWorklog(params: JiraWorklogParams): Promise<JiraWorklog[]> {
  const data = await jiraRequest<JiraWorklog[]>({ method: "POST", endpoint: JIRA_API.WORKLOG, params });

  return handleApiResponse({
    data,
    fileName: COMMAND_NAME.JIRA_WORKLOG,
    defaultValue: [],
  });
}

export async function getJiraIssue(issueKey: string): Promise<JiraIssue> {
  const endpoint = JIRA_API.ISSUE.replace("{issueIdOrKey}", issueKey);
  const data = await jiraRequest<JiraIssue>({ method: "GET", endpoint });

  return handleApiResponse({
    data,
    fileName: "jira-issue",
    defaultValue: {} as JiraIssue,
  });
}

export async function getJiraIssueTransitions(issueKey: string): Promise<JiraTransitionResponse> {
  const endpoint = JIRA_API.ISSUE_TRANSITIONS.replace("{issueIdOrKey}", issueKey);
  const data = await jiraRequest<JiraTransitionResponse>({ method: "GET", endpoint });

  return handleApiResponse({
    data,
    fileName: "jira-issue-transitions",
    defaultValue: {
      expand: "transitions",
      transitions: [],
    },
  });
}

export async function transitionJiraIssue(issueKey: string, transitionId: string): Promise<void> {
  const params: Record<string, unknown> = {
    transition: {
      id: transitionId,
    },
  };

  const endpoint = JIRA_API.ISSUE_TRANSITIONS.replace("{issueIdOrKey}", issueKey);

  await jiraRequest<void>({
    method: "POST",
    endpoint,
    params,
  });
}
