import { getIssueTypeIcon, getJiraIssueEditUrl, getJiraIssueUrl, getIssuePriorityIcon } from "@/utils";
import type {
  JiraSearchIssue,
  JiraUser,
  ProcessedJiraIssue,
  ListItemAccessories,
  ListItemSubtitle,
  JiraField,
} from "@/types";

export function processJiraSearchIssue(
  issue: JiraSearchIssue,
  selectedFields: JiraField[],
  fieldsNameMap?: Record<string, string>,
): ProcessedJiraIssue {
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
        acc[field.id] = value as JiraUser;
      }
      return acc;
    },
    {} as Record<string, JiraUser>,
  );

  const subtitle = buildSubtitle(issue, selectedFieldValue, fieldsNameMap);
  const accessories = buildAccessories(issue);

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
  };
}

function buildSubtitle(
  issue: JiraSearchIssue,
  selectedFieldValue?: Record<string, JiraUser>,
  fieldsNameMap?: Record<string, string>,
): ListItemSubtitle {
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

function buildAccessories(issue: JiraSearchIssue): ListItemAccessories {
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

  const priority = fields.priority?.name;
  if (priority) {
    const priorityIcon = getIssuePriorityIcon(priority);

    if (priorityIcon) {
      accessories.push({
        icon: priorityIcon,
        tooltip: `Priority: ${priority}`,
      });
    } else {
      accessories.push({
        tag: priority,
        tooltip: `Priority: ${priority}`,
      });
    }
  }

  const status = fields.status?.name;
  if (status) {
    accessories.push({
      tag: status,
      tooltip: `Status: ${status}`,
    });
  }

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
    timeTooltipParts.push(`Estimate Time: ${timeTracking.originalEstimate}`);
  }

  if (timeTracking.remainingEstimate) {
    timeTooltipParts.push(`Remaining Time: ${timeTracking.remainingEstimate}`);
  }

  if (timeTracking.timeSpent) {
    timeTooltipParts.push(`Logged Time: ${timeTracking.timeSpent}`);
  }

  accessories.unshift({
    date: updated ?? created,
    tooltip: timeTooltipParts.join("\n"),
  });

  return accessories;
}
