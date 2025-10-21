import dayjs from "dayjs";
import { getIssueTypeIcon, getJiraIssueUrl } from "@/utils";
import { DAILY_WORK_HOURS, JIRA_WORKLOG_RANGE } from "@/constants";
import type { JiraWorklog, ListItemAccessories, ProcessedWorklogItem, WorklogGroup } from "@/types";

export function processJiraWorklog(worklogs: JiraWorklog[]): WorklogGroup[] {
  // Sort all worklogs by started time first
  const sortedWorklogs = worklogs.sort((a, b) => dayjs(a.started).valueOf() - dayjs(b.started).valueOf());

  // Group by date and process in one pass
  const groupedByDate = sortedWorklogs.reduce(
    (groups, worklog) => {
      const date = dayjs(worklog.started).format("YYYY-MM-DD");
      if (!groups[date]) {
        groups[date] = {
          date,
          totalTimeSpentSeconds: 0,
          items: [],
        };
      }

      groups[date].totalTimeSpentSeconds += worklog.timeSpentSeconds;
      groups[date].items.push(processWorklogItem(worklog));

      return groups;
    },
    {} as Record<string, { date: string; totalTimeSpentSeconds: number; items: ProcessedWorklogItem[] }>,
  );

  // Convert to final format and sort by date descending
  return Object.values(groupedByDate)
    .map((group) => ({
      date: group.date,
      totalTimeSpent: formatTimeSpent(group.totalTimeSpentSeconds),
      totalTimeSpentSeconds: group.totalTimeSpentSeconds,
      items: group.items,
      title: dayjs(group.date).format("D/MMM/YYYY"),
      subtitle: `${formatTimeSpent(group.totalTimeSpentSeconds)} of ${DAILY_WORK_HOURS}h`,
    }))
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
}

function processWorklogItem(worklog: JiraWorklog): ProcessedWorklogItem {
  const { issue, timeSpent, timeSpentSeconds, comment, started } = worklog;

  const url = getJiraIssueUrl(issue.key);
  const date = dayjs(started).format("YYYY-MM-DD");

  const renderKey = `${worklog.tempoWorklogId}`;
  const issueTypeIcon = getIssueTypeIcon(issue.issueType) || "icon-unknown.svg";

  const accessories: ListItemAccessories = [
    {
      tag: timeSpent,
      tooltip: `Comment:\n${comment || "No comment"}`,
    },
  ];

  return {
    renderKey,
    issueKey: issue.key,
    title: issue.summary,
    subtitle: issue.key,
    icon: issueTypeIcon,
    accessories,
    url,
    timeSpent,
    timeSpentSeconds,
    comment,
    date,
  };
}

function formatTimeSpent(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
}

export function getDateRange(rangeType: string): { from: string; to: string } {
  const today = dayjs();

  switch (rangeType) {
    case JIRA_WORKLOG_RANGE.DAILY:
      return {
        from: today.format("YYYY-MM-DD"),
        to: today.format("YYYY-MM-DD"),
      };
    case JIRA_WORKLOG_RANGE.MONTHLY:
      return {
        from: today.startOf("month").format("YYYY-MM-DD"),
        to: today.format("YYYY-MM-DD"),
      };
    case JIRA_WORKLOG_RANGE.WEEKLY:
    default:
      return {
        from: today.startOf("week").format("YYYY-MM-DD"),
        to: today.format("YYYY-MM-DD"),
      };
  }
}
