import { JIRA_PRIORITY_ICON } from "@/constants";
import { getIssueTypeIcon, getJiraIssueEditUrl, getJiraIssueUrl, getSelectedCustomFields } from "@/utils";
import type { JiraIssue, JiraUser, ProcessedJiraIssueItem, ListItemAccessories, ListItemSubtitle } from "@/types";

export function processJiraSearchIssue(issue: JiraIssue, names?: Record<string, string>): ProcessedJiraIssueItem {
  const { fields, key, id } = issue;

  const summary = fields.summary || "No Summary";
  const issueType = fields.issuetype?.name || "Task";

  const url = getJiraIssueUrl(key);
  const editUrl = getJiraIssueEditUrl(id);

  const issueTypeIcon = getIssueTypeIcon(issueType);
  const icon = {
    value: issueTypeIcon || "icon-unknown.svg",
    tooltip: `Issue Type: ${issueType}`,
  };

  const selectedCustomFields = getSelectedCustomFields();

  const customFieldValue = selectedCustomFields.reduce(
    (acc, field) => {
      const value = issue.fields[field.id];
      if (value !== undefined && value !== null) {
        acc[field.id] = value as JiraUser;
      }
      return acc;
    },
    {} as Record<string, JiraUser>,
  );

  const subtitle = buildSubtitle(issue, customFieldValue, names);
  const accessories = buildAccessories(issue);

  return {
    renderKey: id,
    title: summary,
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
  issue: JiraIssue,
  customFieldValue?: Record<string, JiraUser>,
  names?: Record<string, string>,
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
  if (customFieldValue) {
    Object.entries(customFieldValue).forEach(([fieldId, value]) => {
      const fieldName = names?.[fieldId] || fieldId;
      tooltipParts.push(`${fieldName}: ${value.displayName}`);
    });
  }

  return {
    value: subtitle,
    tooltip: tooltipParts.join("\n"),
  };
}

function buildAccessories(issue: JiraIssue): ListItemAccessories {
  const { fields } = issue;
  const status = fields.status?.name || "Unknown";
  const priority = fields.priority?.name || "Medium";
  const created = fields.created ? new Date(fields.created) : null;
  const updated = fields.updated ? new Date(fields.updated) : null;
  const dueDate = fields.duedate ? new Date(fields.duedate) : null;
  const timeTracking = {
    originalEstimate: fields.timetracking?.originalEstimate || null,
    remainingEstimate: fields.timetracking?.remainingEstimate || null,
    timeSpent: fields.timetracking?.timeSpent || null,
  };
  const accessories: ListItemAccessories = [];

  if (priority) {
    const priorityIcon = getPriorityIcon(priority);

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

  accessories.push({
    date: updated ?? created,
    tooltip: timeTooltipParts.join("\n"),
  });

  return accessories;
}

function getPriorityIcon(priority: string): string | undefined {
  const normalizedPriority = priority.toUpperCase();

  if (isBuiltInPriority(normalizedPriority)) {
    return JIRA_PRIORITY_ICON[normalizedPriority];
  }

  const similarPriority = Object.keys(JIRA_PRIORITY_ICON).find((key) => key.includes(normalizedPriority));
  if (similarPriority && isBuiltInPriority(similarPriority)) {
    return JIRA_PRIORITY_ICON[similarPriority];
  }

  return undefined;
}

function isBuiltInPriority(priority: string): priority is keyof typeof JIRA_PRIORITY_ICON {
  return priority in JIRA_PRIORITY_ICON;
}
