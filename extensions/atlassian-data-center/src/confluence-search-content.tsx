import { useState, useEffect, useMemo } from "react";
import { List, ActionPanel, Action, Icon, showToast, Toast } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";

import QueryProvider from "@/query-provider";
import { SearchBarAccessory, QueryWrapper } from "@/components";
import { IGNORE_FILTER, APP_TYPE, AVATAR_TYPE, COMMAND_NAME, PAGINATION_SIZE, QUERY_TYPE } from "@/constants";
import {
  useConfluenceSearchContentInfiniteQuery,
  useToggleFavorite,
  useAvatar,
  useConfluenceCurrentUserQuery,
} from "@/hooks";
import {
  clearAllCacheWithToast,
  avatarExtractors,
  getSectionTitle,
  processUserInputAndFilter,
  buildQuery,
  copyToClipboardWithToast,
  replaceQueryCurrentUser,
} from "@/utils";

import type { SearchFilter } from "@/types";

const EMPTY_INFINITE_DATA = { items: [], hasMore: false, totalCount: 0 };

export default function ConfluenceSearchContentProvider() {
  return (
    <QueryProvider>
      <ConfluenceSearchContent />
    </QueryProvider>
  );
}

function ConfluenceSearchContent() {
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState<SearchFilter | null>(null);

  const cql = useMemo(() => {
    const trimmedText = searchText.trim();

    if (!trimmedText && filter?.autoQuery) {
      return filter.query;
    }
    if (trimmedText.length < 2) {
      return "";
    }

    const effectiveFilter = IGNORE_FILTER ? undefined : filter || undefined;
    const result = processUserInputAndFilter({
      userInput: trimmedText,
      filter: effectiveFilter,
      buildClauseFromText: (input) => `text ~ "${input}"`,
      queryType: "CQL",
    });

    if (typeof result === "string") {
      return result;
    }

    return buildQuery({
      ...result,
      orderBy: result.orderBy || "lastmodified DESC",
      queryType: "CQL",
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
  } = useConfluenceSearchContentInfiniteQuery(cql);

  const { data: currentUser, error: currentUserError } = useConfluenceCurrentUserQuery();

  const toggleFavorite = useToggleFavorite();

  const handleToggleFavorite = (contentId: string, isFavorited: boolean) => {
    toggleFavorite.mutate({ contentId, isFavorited });
  };

  useEffect(() => {
    if (toggleFavorite.error) {
      showFailureToast(toggleFavorite.error, { title: "Failed to Update Favorite" });
    }
  }, [toggleFavorite.error]);

  useAvatar({
    items: data.items,
    appType: APP_TYPE.CONFLUENCE,
    avatarType: AVATAR_TYPE.CONFLUENCE_USER,
    extractAvatarData: avatarExtractors.confluenceContentCreator,
  });

  useEffect(() => {
    if (currentUserError) {
      showFailureToast(currentUserError, { title: "Failed to Load User" });
    }
  }, [currentUserError]);

  useEffect(() => {
    if (error) {
      showFailureToast(error, { title: "Failed to Search Content" });
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

  const copyCQL = () => {
    let finalCQL = cql;

    if (currentUser?.username) {
      finalCQL = replaceQueryCurrentUser(finalCQL, currentUser.username);
    }

    copyToClipboardWithToast(finalCQL);
  };

  const isEmpty = isSuccess && !data.items.length;

  const sectionTitle = getSectionTitle(filter, {
    fetchedCount: data.items.length,
    totalCount: data?.totalCount || 0,
  });

  return (
    <List
      throttle
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search Content..."
      searchBarAccessory={
        <SearchBarAccessory
          commandName={COMMAND_NAME.CONFLUENCE_SEARCH_CONTENT}
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
                <Action.CopyToClipboard title="Copy CQL" content={cql} />
              </ActionPanel>
            }
          />
        ) : (
          <List.Section title={sectionTitle}>
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
                      {item.canEdit && (
                        <Action.OpenInBrowser icon={Icon.Pencil} title="Edit in Browser" url={item.editUrl} />
                      )}
                      <Action.CopyToClipboard
                        title="Copy Link"
                        content={item.url}
                        shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                      />
                      {item.canFavorite && (
                        <Action
                          icon={item.isFavourited ? Icon.StarDisabled : Icon.Star}
                          title={item.isFavourited ? "Remove from Favourites" : "Add to Favourites"}
                          onAction={() => handleToggleFavorite(item.id, item.isFavourited)}
                          shortcut={{ modifiers: ["cmd"], key: "f" }}
                        />
                      )}
                      {item.spaceUrl && (
                        <Action.OpenInBrowser
                          icon={Icon.House}
                          title={`Open Space Homepage${item.spaceName ? ` (${item.spaceName})` : ""}`}
                          url={item.spaceUrl}
                        />
                      )}
                      {cql && <Action title="Copy CQL" icon={Icon.CopyClipboard} onAction={() => copyCQL()} />}
                      <Action
                        title="Refresh"
                        icon={Icon.ArrowClockwise}
                        shortcut={{ modifiers: ["cmd"], key: "r" }}
                        onAction={handleRefresh}
                      />
                      <Action title="Clear Cache" icon={Icon.Trash} onAction={clearAllCacheWithToast} />
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
