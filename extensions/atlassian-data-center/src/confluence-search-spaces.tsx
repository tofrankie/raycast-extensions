import { useState, useEffect, useMemo } from "react";
import { List, ActionPanel, Action, Icon, showToast, Toast } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";

import { avatarExtractors, processUserInputAndFilter, buildQuery, isJQL } from "@/utils";
import { QUERY_TYPE } from "@/constants";
import { AVATAR_TYPE, COMMAND_NAME, PAGINATION_SIZE } from "@/constants";
import { SearchBarAccessory, QueryProvider, QueryWrapper, DebugActions } from "@/components";
import { useConfluenceSearchSpaceInfiniteQuery, useAvatar } from "@/hooks";
import type { SearchFilter } from "@/types";

const EMPTY_INFINITE_DATA = { items: [], hasMore: false, totalCount: 0 };

export default function ConfluenceSearchSpacesProvider() {
  return (
    <QueryProvider>
      <ConfluenceSearchSpaces />
    </QueryProvider>
  );
}

function ConfluenceSearchSpaces() {
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState<SearchFilter | null>(null);

  const cql = useMemo(() => {
    const trimmedText = searchText.trim();
    let filterForQuery: SearchFilter | null | undefined = filter;

    if (!trimmedText && !filter?.autoQuery) {
      return "";
    }

    const isJQLUserInput = isJQL(trimmedText);
    if (isJQLUserInput && filter) {
      filterForQuery = undefined;
    }

    const processedCQL = processUserInputAndFilter({
      userInput: trimmedText,
      filter: filterForQuery,
      buildClauseFromText: (input) => `type = space AND space.title ~ "${input}"`,
      queryType: QUERY_TYPE.CQL,
    });

    if (typeof processedCQL === "string") {
      return processedCQL;
    }

    return buildQuery({
      ...processedCQL,
      orderBy: processedCQL.orderBy || "lastmodified DESC, created DESC",
      queryType: QUERY_TYPE.CQL,
    });
  }, [searchText, filter]);

  const {
    data = EMPTY_INFINITE_DATA,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isSuccess,
    error,
    refetch,
  } = useConfluenceSearchSpaceInfiniteQuery(cql);

  useEffect(() => {
    if (error) {
      showFailureToast(error, { title: "Failed to Search Space" });
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

  useAvatar({
    items: data.items,
    avatarType: AVATAR_TYPE.CONFLUENCE_SPACE,
    extractAvatarData: avatarExtractors.confluenceSpace,
  });

  const handleLoadMore = () => {
    if (data.hasMore && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const isEmpty = isSuccess && !data.items.length;

  const searchTitle = `Results (${data.items.length}/${data?.totalCount})`;

  return (
    <List
      throttle
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search spaces by name..."
      searchBarAccessory={
        <SearchBarAccessory
          commandName={COMMAND_NAME.CONFLUENCE_SEARCH_SPACE}
          value={filter?.value || ""}
          onChange={setFilter}
        />
      }
      pagination={{
        hasMore: data.hasMore,
        onLoadMore: handleLoadMore,
        pageSize: PAGINATION_SIZE,
      }}
    >
      <QueryWrapper query={searchText} queryType={QUERY_TYPE.CQL}>
        {isEmpty ? (
          <List.EmptyView
            icon={Icon.MagnifyingGlass}
            title="No Results"
            description="Try adjusting your search filters or check your CQL syntax"
            actions={
              <ActionPanel>
                <Action.OpenInBrowser
                  icon={Icon.Book}
                  title="Open CQL Documentation"
                  url="https://developer.atlassian.com/server/confluence/rest/v1010/intro/#advanced-searching-using-cql"
                />
                {cql && <Action.CopyToClipboard title="Copy CQL" content={cql} />}
              </ActionPanel>
            }
          />
        ) : (
          <List.Section title={searchTitle}>
            {data.items.map((item) => {
              return (
                <List.Item
                  key={item.renderKey}
                  icon={item.icon}
                  title={item.name}
                  subtitle={item.subtitle}
                  accessories={item.accessories}
                  actions={
                    <ActionPanel>
                      <Action.OpenInBrowser title="Open in Browser" url={item.url} />
                      <Action.CopyToClipboard
                        title="Copy Link"
                        content={item.url}
                        shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                      />
                      <Action.CopyToClipboard title="Copy Space Key" content={item.key} />
                      {cql && <Action.CopyToClipboard title="Copy CQL" content={cql} />}
                      <Action
                        title="Refresh"
                        icon={Icon.ArrowClockwise}
                        shortcut={{ modifiers: ["cmd"], key: "r" }}
                        onAction={handleRefresh}
                      />
                      <DebugActions />
                    </ActionPanel>
                  }
                />
              );
            })}
          </List.Section>
        )}
      </QueryWrapper>
    </List>
  );
}
