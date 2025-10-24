import { useState, useMemo, useEffect } from "react";
import { List, ActionPanel, Action, Icon, showToast, Toast } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";

import QueryProvider from "@/query-provider";
import { SearchBarAccessory, QueryWrapper, DebugActions } from "@/components";
import { JiraIssueTransition } from "@/pages";
import { IGNORE_FILTER, COMMAND_NAME, PAGINATION_SIZE, QUERY_TYPE } from "@/constants";
import { useJiraProjectQuery, useJiraSearchIssueInfiniteQuery, useJiraCurrentUser } from "@/hooks";
import {
  clearAllCacheWithToast,
  getSectionTitle,
  processUserInputAndFilter,
  buildQuery,
  isJQL,
  copyToClipboardWithToast,
  replaceQueryCurrentUser,
} from "@/utils";
import type { ProcessedJiraIssueItem, SearchFilter } from "@/types";

const ISSUE_KEY_REGEX = /^[A-Z][A-Z0-9_]+-\d+$/;
const PURE_NUMBER_REGEX = /^\d+$/;

const EMPTY_INFINITE_DATA = { issues: [], hasMore: false, totalCount: 0 };

export default function JiraSearchIssueProvider() {
  return (
    <QueryProvider>
      <JiraSearchIssueContent />
    </QueryProvider>
  );
}

function JiraSearchIssueContent() {
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState<SearchFilter | null>(null);

  const {
    data: projectKeys,
    isFetched: isJiraProjectFetched,
    error: jiraProjectError,
  } = useJiraProjectQuery({
    select: (list) => list.map((item) => item.key),
  });

  const jql = useMemo(() => {
    const trimmedText = searchText.trim();

    if (!trimmedText.length && !filter?.autoQuery) {
      return "";
    }

    const isJQLUserInput = isJQL(trimmedText);
    const effectiveFilter = (IGNORE_FILTER && isJQLUserInput) || !filter ? undefined : filter;

    const buildClauseFromText = (input: string) => {
      if (ISSUE_KEY_REGEX.test(input)) {
        return `(summary ~ "${input}" OR issuekey in (${input}))`;
      }
      if (PURE_NUMBER_REGEX.test(input) && projectKeys?.length) {
        const keys = projectKeys.map((key) => `${key}-${input}`).join(", ");
        return `(summary ~ "${input}" OR issuekey in (${keys}))`;
      }
      return `summary ~ "${input}"`;
    };

    const result = processUserInputAndFilter({
      userInput: trimmedText,
      filter: effectiveFilter,
      buildClauseFromText,
      queryType: "JQL",
    });

    if (typeof result === "string") {
      return result;
    }

    return buildQuery({
      ...result,
      orderBy: result.orderBy || "updated DESC, created DESC",
      queryType: "JQL",
    });
  }, [searchText, filter, projectKeys]);

  const jiraIssueEnabled = useMemo(() => {
    return (isJiraProjectFetched || !!jiraProjectError) && jql.length >= 2;
  }, [isJiraProjectFetched, jiraProjectError, jql]);

  const {
    data = EMPTY_INFINITE_DATA,
    error,
    isLoading,
    isSuccess,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useJiraSearchIssueInfiniteQuery(jql, {
    enabled: jiraIssueEnabled,
  });

  const { currentUser, error: currentUserError } = useJiraCurrentUser();

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const hasMore = data?.hasMore || false;

  useEffect(() => {
    if (currentUserError) {
      showFailureToast(currentUserError, { title: "Failed to Load User" });
    }
  }, [currentUserError]);

  useEffect(() => {
    if (jiraProjectError) {
      showFailureToast(jiraProjectError, { title: "Failed to Load Project" });
    }
  }, [jiraProjectError]);

  useEffect(() => {
    if (error) {
      showFailureToast(error, { title: "Failed to Search Issue" });
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

  const sectionTitle = getSectionTitle(filter, {
    fetchedCount: data.issues.length,
    totalCount: data?.totalCount || 0,
  });

  const copyJQL = async () => {
    const getFinalJQL = (issues: ProcessedJiraIssueItem[]) => {
      // 1. Find the string with "OR issuekey in (...)" and split it into three parts
      const orKeyInMatch = jql.match(/(.*?)\s+OR\s+issuekey\s+in\s*\(([^)]+)\)(.*)/i);

      // 2. If there is no "OR issuekey in" part, return the original JQL
      if (!orKeyInMatch) {
        return jql;
      }

      const [, beforePart, keysPart, afterPart] = orKeyInMatch;

      // 3. Compare each issue key and remove those that do not exist in the current issues
      const originalKeys = keysPart.split(",").map((key) => key.trim());
      const existingKeys = issues.map((issue) => issue.key);
      const filteredKeys = originalKeys.filter((key) => existingKeys.includes(key));

      // 4. If there are no existing issue keys after filtering, this part becomes an empty string
      let filteredKeysPart = "";
      if (filteredKeys.length > 0) {
        filteredKeysPart = ` OR issuekey in (${filteredKeys.join(", ")})`;
      }

      // 5. Recombine the JQL from the three parts
      const filteredJQL = beforePart.trim() + filteredKeysPart + afterPart;
      return filteredJQL;
    };

    let finalJQL = !searchText || !PURE_NUMBER_REGEX.test(searchText) ? jql : getFinalJQL(data.issues);

    if (currentUser?.name) {
      finalJQL = replaceQueryCurrentUser(finalJQL, currentUser.name);
    }

    await copyToClipboardWithToast(finalJQL);
  };

  const isEmpty = isSuccess && !data.issues.length;

  return (
    <List
      throttle
      isLoading={isLoading}
      onSearchTextChange={handleSearchTextChange}
      searchBarPlaceholder="Search Issues..."
      searchBarAccessory={
        <SearchBarAccessory
          commandName={COMMAND_NAME.JIRA_SEARCH_ISSUE}
          value={filter?.value || ""}
          onChange={setFilter}
        />
      }
      pagination={{
        hasMore,
        onLoadMore: handleLoadMore,
        pageSize: PAGINATION_SIZE,
      }}
    >
      <QueryWrapper query={searchText} queryType={QUERY_TYPE.JQL}>
        {isEmpty ? (
          <List.EmptyView
            icon={Icon.MagnifyingGlass}
            title="No Results"
            description="Try adjusting your search filters or check your JQL syntax"
            actions={
              <ActionPanel>
                <Action.CopyToClipboard title="Copy JQL" content={jql} />
              </ActionPanel>
            }
          />
        ) : (
          <List.Section title={sectionTitle}>
            {data.issues.map((item) => (
              <List.Item
                key={item.renderKey}
                title={item.summary}
                subtitle={item.subtitle}
                icon={item.icon}
                accessories={item.accessories}
                actions={
                  <ActionPanel>
                    <Action.OpenInBrowser title="Open in Browser" url={item.url} />
                    <Action.OpenInBrowser
                      icon={Icon.Pencil}
                      title="Edit in Browser"
                      url={item.editUrl}
                      shortcut={{ modifiers: ["cmd"], key: "e" }}
                    />
                    <Action.Push
                      title="Transition Status"
                      target={<JiraIssueTransition issueKey={item.key} onUpdate={handleRefresh} />}
                      icon={Icon.ArrowRight}
                      shortcut={{ modifiers: ["cmd"], key: "t" }}
                    />
                    <Action.CopyToClipboard
                      title="Copy URL"
                      shortcut={{ modifiers: ["cmd"], key: "c" }}
                      content={item.url}
                    />
                    <Action.CopyToClipboard
                      title="Copy Key"
                      shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                      content={item.key}
                    />
                    <Action.CopyToClipboard
                      title="Copy Summary"
                      shortcut={{ modifiers: ["cmd", "shift"], key: "." }}
                      content={item.summary}
                    />
                    {jql && <Action title="Copy JQL" icon={Icon.CopyClipboard} onAction={() => copyJQL()} />}
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
        )}
      </QueryWrapper>
    </List>
  );
}
