import {
  getIssueTypeIcon,
  getJiraIssueEditUrl,
  getJiraIssueUrl,
  getSelectedFields,
  buildPriorityAndStatusAccessories,
} from "@/utils";
import type {
  JiraBoardIssue,
  ProcessedJiraKanbanBoardIssue,
  ListItemAccessories,
  ListItemSubtitle,
  JiraSprintsResponse,
  JiraBoardsResponse,
  JiraBoardConfiguration,
  JiraField,
  JiraIssueUser,
} from "@/types";

export function processJiraBoardIssue(
  issue: JiraBoardIssue,
  selectedFields: JiraField[],
  fieldsNameMap?: Record<string, string>,
): ProcessedJiraKanbanBoardIssue {
  const { fields, key, id } = issue;

  const summary = fields.summary;
  const title = { value: summary, tooltip: `Summary: ${summary}` };
  const issueType = fields.issuetype.name;

  const url = getJiraIssueUrl(key);
  const editUrl = getJiraIssueEditUrl(id);

  const issueTypeIcon = getIssueTypeIcon(issueType);
  const icon = {
    value: issueTypeIcon || "icon-unknown.svg",
    tooltip: `Issue Type: ${issueType}`,
  };

  const selectedFieldValue = selectedFields.reduce(
    (acc, field) => {
      const value = issue.fields[field.id];
      if (value !== undefined && value !== null) {
        acc[field.id] = value as JiraIssueUser;
      }
      return acc;
    },
    {} as Record<string, JiraIssueUser>,
  );

  const subtitle = buildSubtitleForBoardIssue(issue, selectedFieldValue, fieldsNameMap);
  const accessories = buildAccessoriesForBoardIssue(issue);

  return {
    renderKey: id,
    title,
    key,
    summary,
    icon,
    subtitle,
    accessories,
    url,
    editUrl,
    keywords: [],
  };
}

export function processJiraSprintIssues(
  issues: JiraBoardIssue[],
  selectedFields: JiraField[],
  boardConfiguration?: JiraBoardConfiguration,
  fieldsNameMap?: Record<string, string>,
): ProcessedJiraKanbanBoardIssue[] {
  return issues.map((issue) => {
    const { fields, key, id } = issue;

    const summary = fields.summary;
    const title = { value: summary, tooltip: `Summary: ${summary}` };
    const issueTypeName = fields.issuetype.name;

    const url = getJiraIssueUrl(key);
    const editUrl = getJiraIssueEditUrl(id);

    const issueTypeIcon = getIssueTypeIcon(issueTypeName);
    const icon = {
      value: issueTypeIcon || "icon-unknown.svg",
      tooltip: `Issue Type: ${issueTypeName}`,
    };

    const subtitle = buildSubtitle(issue, selectedFields, fieldsNameMap);
    const accessories = buildAccessories(issue);
    const keywords = buildKeywords(issue, boardConfiguration);

    return {
      renderKey: id,
      title,
      key,
      summary,
      icon,
      subtitle,
      accessories,
      url,
      editUrl,
      keywords,
    };
  });
}

function buildSubtitleForBoardIssue(
  issue: JiraBoardIssue,
  selectedFieldValue?: Record<string, JiraIssueUser>,
  fieldsNameMap?: Record<string, string>,
): NonNullable<ListItemSubtitle> {
  const { key: issueKey, fields } = issue;
  const assignee = fields.assignee?.displayName || "Unassigned";
  const reporter = fields.reporter?.displayName || null;

  const subtitle = `${issueKey}@${assignee}`;

  const tooltipParts = [];
  if (issueKey) {
    tooltipParts.push(`${issueKey}`);
  }
  if (reporter) {
    tooltipParts.push(`Reporter: ${reporter}`);
  }
  if (assignee) {
    tooltipParts.push(`Assignee: ${assignee}`);
  }

  // TODO: Support more types of custom fields
  if (selectedFieldValue) {
    Object.entries(selectedFieldValue).forEach(([fieldId, value]) => {
      const fieldName = fieldsNameMap?.[fieldId] ?? fieldId;
      tooltipParts.push(`${fieldName}: ${value.displayName}`);
    });
  }

  return {
    value: subtitle,
    tooltip: tooltipParts.join("\n"),
  };
}

function buildAccessoriesForBoardIssue(issue: JiraBoardIssue): NonNullable<ListItemAccessories> {
  const { fields } = issue;
  const created = fields.created ? new Date(fields.created) : null;
  const updated = fields.updated ? new Date(fields.updated) : null;
  const dueDate = fields.duedate ? new Date(fields.duedate) : null;
  const timeTracking = {
    originalEstimate: fields.timetracking?.originalEstimate || null,
    remainingEstimate: fields.timetracking?.remainingEstimate || null,
    timeSpent: fields.timetracking?.timeSpent || null,
  };
  const accessories: ListItemAccessories = [];

  // Add priority and status accessories
  const priorityAndStatusAccessories = buildPriorityAndStatusAccessories(fields.priority?.name, fields.status?.name);
  accessories.push(...priorityAndStatusAccessories);

  const timeTooltipParts = [];
  if (created) {
    timeTooltipParts.push(`Created at ${created.toLocaleString()}`);
  }

  if (updated) {
    timeTooltipParts.push(`Updated at ${updated.toLocaleString()}`);
  }

  if (dueDate) {
    timeTooltipParts.push(`Due at ${dueDate.toLocaleString()}`);
  }

  if (timeTracking.originalEstimate) {
    timeTooltipParts.push(`Σ Estimated: ${timeTracking.originalEstimate}`);
  }

  if (timeTracking.remainingEstimate) {
    timeTooltipParts.push(`Σ Remaining: ${timeTracking.remainingEstimate}`);
  }

  if (timeTracking.timeSpent) {
    timeTooltipParts.push(`Σ Logged: ${timeTracking.timeSpent}`);
  }

  accessories.unshift({
    date: updated ?? created,
    tooltip: timeTooltipParts.join("\n"),
  });

  return accessories;
}

function buildSubtitle(
  issue: JiraBoardIssue,
  selectedFields: JiraField[],
  fieldsNameMap?: Record<string, string>,
): NonNullable<ListItemSubtitle> {
  const { key: issueKey, fields } = issue;
  const assignee = fields.assignee?.displayName || "Unassigned";
  const reporter = fields.reporter?.displayName || null;

  const subtitle = `${issueKey}@${assignee}`;

  const tooltipParts = [];
  if (issueKey) {
    tooltipParts.push(`${issueKey}`);
  }
  if (reporter) {
    tooltipParts.push(`Reporter: ${reporter}`);
  }
  if (assignee) {
    tooltipParts.push(`Assignee: ${assignee}`);
  }

  // Add custom field values
  const selectedFieldValue = selectedFields.reduce(
    (acc, field) => {
      const value = issue.fields[field.id];
      if (value !== undefined && value !== null) {
        acc[field.id] = value as JiraIssueUser;
      }
      return acc;
    },
    {} as Record<string, JiraIssueUser>,
  );

  if (selectedFieldValue) {
    Object.entries(selectedFieldValue).forEach(([fieldId, value]) => {
      const fieldName = fieldsNameMap?.[fieldId] ?? selectedFields.find((f) => f.id === fieldId)?.name ?? fieldId;
      tooltipParts.push(`${fieldName}: ${value.displayName}`);
    });
  }

  return {
    value: subtitle,
    tooltip: tooltipParts.join("\n"),
  };
}

function buildAccessories(issue: JiraBoardIssue): NonNullable<ListItemAccessories> {
  const { fields } = issue;
  const accessories: ListItemAccessories = [];

  // Add priority and status accessories
  const priorityAndStatusAccessories = buildPriorityAndStatusAccessories(fields.priority?.name, fields.status?.name);
  accessories.push(...priorityAndStatusAccessories);

  accessories.unshift({
    text: fields.epic?.name || "No Epic",
    tooltip: fields.epic?.name ? `Epic: ${fields.epic.name}` : "Issue not linked to Epic",
  });

  return accessories;
}

function buildKeywords(issue: JiraBoardIssue, boardConfiguration?: JiraBoardConfiguration): string[] {
  const { key: issueKey, fields } = issue;
  const keywords: string[] = [issueKey, issueKey.split("-")[1]];

  if (fields.assignee?.displayName) {
    keywords.push(fields.assignee.displayName);
  }

  keywords.push(fields.epic?.name || "No Epic");

  if (fields.status?.name) {
    keywords.push(fields.status.name);
  }

  // Add column name from boardConfiguration
  if (boardConfiguration?.columnConfig?.columns && fields.status?.id) {
    const column = boardConfiguration.columnConfig.columns.find((col) =>
      col.statuses.some((status) => status.id === fields.status.id),
    );
    if (column?.name) {
      keywords.push(column.name);
    }
  }

  return keywords;
}

export function processAndGroupSprintIssues(
  issues: JiraBoardIssue[],
  boardConfiguration: JiraBoardConfiguration,
): Record<string, ProcessedJiraKanbanBoardIssue[]> {
  const selectedFields = getSelectedFields();
  const processedIssues = processJiraSprintIssues(issues, selectedFields, boardConfiguration);

  const grouped: Record<string, ProcessedJiraKanbanBoardIssue[]> = {};
  const columns = boardConfiguration.columnConfig.columns;

  columns.forEach((column) => {
    grouped[column.name] = [];
  });

  // Initialize Unmapped Statuses column
  grouped["Unmapped"] = [];

  // Group processed issues by their status
  processedIssues.forEach((processedIssue, index) => {
    const originalIssue = issues[index];
    const statusId = originalIssue.fields.status.id;

    // Find which column this status belongs to
    const column = columns.find((col) => col.statuses.some((status) => status.id === statusId));

    if (column) {
      grouped[column.name].push(processedIssue);
    } else {
      // If status is not mapped to any column, add to Unmapped
      grouped["Unmapped"].push(processedIssue);
    }
  });

  return grouped;
}

export function processActiveSprint(
  sprintsResponse: JiraSprintsResponse,
): JiraSprintsResponse["values"][number] | null {
  // TODO: Handle multiple active sprints
  return sprintsResponse.values?.[0] || null;
}

export function processBoards(boardResponse: JiraBoardsResponse): JiraBoardsResponse["values"] {
  return boardResponse.values || [];
}
