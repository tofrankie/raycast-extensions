import { useState, useEffect, useMemo } from "react";
import { List, ActionPanel, Action, Icon, showToast, Toast } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";

import QueryProvider from "@/query-provider";
import { DebugActions } from "@/components";
import { APP_TYPE, AVATAR_TYPE, PAGINATION_SIZE } from "@/constants";
import { useConfluenceSearchUserInfiniteQuery, useAvatar } from "@/hooks";
import { avatarExtractors, clearAllCacheWithToast } from "@/utils";

const EMPTY_INFINITE_DATA = { items: [], hasMore: false, totalCount: 0 };

export default function ConfluenceSearchUserProvider() {
  return (
    <QueryProvider>
      <ConfluenceSearchUser />
    </QueryProvider>
  );
}

function ConfluenceSearchUser() {
  const [searchText, setSearchText] = useState("");

  const cql = useMemo(() => {
    if (!searchText) return "";
    return `user.fullname ~ "${searchText}" AND type = user`;
  }, [searchText]);

  const {
    data = EMPTY_INFINITE_DATA,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isSuccess,
    error,
    refetch,
  } = useConfluenceSearchUserInfiniteQuery(cql);

  useAvatar({
    items: data.items,
    appType: APP_TYPE.CONFLUENCE,
    avatarType: AVATAR_TYPE.CONFLUENCE_USER,
    extractAvatarData: avatarExtractors.confluenceUser,
  });

  useEffect(() => {
    if (error) {
      showFailureToast(error, { title: "Failed to Search User" });
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
      searchBarPlaceholder="Search Users..."
      pagination={{
        hasMore: data.hasMore,
        onLoadMore: handleLoadMore,
        pageSize: PAGINATION_SIZE,
      }}
    >
      {isEmpty ? (
        <List.EmptyView
          icon={Icon.MagnifyingGlass}
          title="No Results"
          description="Try adjusting your search filters"
          actions={
            <ActionPanel>
              <Action.CopyToClipboard title="Copy CQL" content={cql} />
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
                title={item.title}
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
                    {!!item.userKey && <Action.CopyToClipboard title="Copy User Key" content={item.userKey} />}
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
            );
          })}
        </List.Section>
      )}
    </List>
  );
}
