import { useState, useMemo, useEffect } from "react";
import { List, ActionPanel, Action, Icon, showToast, Toast } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";

import QueryProvider from "@/query-provider";
import { QueryWrapper, DebugActions } from "@/components";
import { clearAllCacheWithToast, copyToClipboardWithToast } from "@/utils";
import { QUERY_TYPE, JIRA_WORKLOG_RANGE } from "@/constants";
import { useJiraWorklogQuery, useJiraCurrentUser } from "@/hooks";
import { getDateRange } from "@/utils";

interface WorklogFilter {
  value: string;
  title: string;
  icon: Icon;
}

const timeRanges: WorklogFilter[] = [
  { value: JIRA_WORKLOG_RANGE.DAILY, title: "Today", icon: Icon.Clock },
  { value: JIRA_WORKLOG_RANGE.WEEKLY, title: "This Week", icon: Icon.Calendar },
  { value: JIRA_WORKLOG_RANGE.MONTHLY, title: "This Month", icon: Icon.Calendar },
];

export default function JiraWorklogProvider() {
  return (
    <QueryProvider>
      <JiraWorklogContent />
    </QueryProvider>
  );
}

function JiraWorklogContent() {
  const [selectedRangeType, setSelectedRangeType] = useState<string>("");

  const { currentUser, error: currentUserError } = useJiraCurrentUser();

  const { from, to } = useMemo(() => getDateRange(selectedRangeType || JIRA_WORKLOG_RANGE.WEEKLY), [selectedRangeType]);

  const {
    data: worklogGroups = [],
    error,
    isLoading,
    isSuccess,
    refetch,
  } = useJiraWorklogQuery({ userKey: currentUser?.key, from, to });

  useEffect(() => {
    if (currentUserError) {
      showFailureToast(currentUserError, { title: "Failed to Load User" });
    }
  }, [currentUserError]);

  useEffect(() => {
    if (error) {
      showFailureToast(error, { title: "Failed to Load Worklog" });
    }
  }, [error]);

  const handleRefresh = async () => {
    try {
      await refetch();
      showToast(Toast.Style.Success, "Refreshed");
    } catch {
      // Error handling is done by useEffect
    }
  };

  const copyJQL = async () => {
    const issueKeys = [...new Set(worklogGroups.flatMap((group) => group.items.map((item) => item.issueKey)))];

    if (issueKeys.length === 0) {
      await copyToClipboardWithToast("No issues found");
      return;
    }

    const jql = `issuekey in (${issueKeys.join(", ")})`;
    await copyToClipboardWithToast(jql);
  };

  const isEmpty = isSuccess && worklogGroups.length === 0;

  return (
    <List
      throttle
      searchBarPlaceholder="Search Worklog..."
      isLoading={isLoading}
      searchBarAccessory={
        <List.Dropdown tooltip="Select Time Range" value={selectedRangeType} onChange={setSelectedRangeType} storeValue>
          {timeRanges.map((item) => (
            <List.Dropdown.Item key={item.value} title={item.title} value={item.value} icon={item.icon} />
          ))}
        </List.Dropdown>
      }
    >
      <QueryWrapper query="" queryType={QUERY_TYPE.JQL}>
        {isEmpty ? (
          <List.EmptyView
            icon={Icon.MagnifyingGlass}
            title="No Results"
            description="No worklog entries found for the selected time range"
            actions={
              <ActionPanel>
                <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={handleRefresh} />
              </ActionPanel>
            }
          />
        ) : (
          worklogGroups.map((group) => (
            <List.Section key={group.date} title={group.title} subtitle={group.subtitle}>
              {group.items.map((item) => (
                <List.Item
                  key={item.renderKey}
                  keywords={item.keywords}
                  icon={item.icon}
                  title={item.title}
                  subtitle={item.subtitle}
                  accessories={item.accessories}
                  actions={
                    <ActionPanel>
                      <Action.OpenInBrowser title="Open in Browser" url={item.url} />
                      <Action title="Copy JQL" icon={Icon.CopyClipboard} onAction={() => copyJQL()} />
                      <Action
                        title="Refresh"
                        icon={Icon.ArrowClockwise}
                        shortcut={{ modifiers: ["cmd"], key: "r" }}
                        onAction={handleRefresh}
                      />
                      <DebugActions />
                      <Action title="Clear Cache" icon={Icon.Trash} onAction={clearAllCacheWithToast} />
                    </ActionPanel>
                  }
                />
              ))}
            </List.Section>
          ))
        )}
      </QueryWrapper>
    </List>
  );
}
