import { useState, useMemo, useEffect } from "react";
import { List, ActionPanel, Action, Icon, showToast, Toast } from "@raycast/api";
import { showFailureToast, useCachedState } from "@raycast/utils";

import QueryProvider from "@/query-provider";
import { DebugActions } from "@/components";
import { JiraIssueTransition } from "@/pages";
import { CACHE_KEY } from "@/constants";
import { useJiraBoards, useJiraBoardActiveSprint, useJiraBoardConfiguration, useJiraBoardSprintIssues } from "@/hooks";
import { clearAllCacheWithToast, processAndGroupIssues, copyToClipboardWithToast } from "@/utils";

export default function JiraBoardViewProvider() {
  return (
    <QueryProvider>
      <JiraBoardView />
    </QueryProvider>
  );
}

function JiraBoardView() {
  const [cachedBoardId, setCachedBoardId] = useCachedState(CACHE_KEY.JIRA_SELECTED_BOARD_ID, -1);
  const [cachedSprintId, setCachedSprintId] = useCachedState(CACHE_KEY.JIRA_SELECTED_BOARD_SPRINT_ID, -1);

  const [selectedBoardId, setSelectedBoardId] = useState("");

  const { data: boards, isLoading: boardsLoading, error: boardsError, isSuccess: boardsSuccess } = useJiraBoards();

  const {
    data: activeSprint,
    isLoading: sprintLoading,
    error: sprintError,
    isSuccess: sprintSuccess,
  } = useJiraBoardActiveSprint(cachedBoardId);

  const {
    data: boardConfiguration,
    isLoading: isBoardConfigurationLoading,
    error: boardConfigurationError,
  } = useJiraBoardConfiguration(cachedBoardId);

  const {
    data: sprintIssues,
    isLoading: issuesLoading,
    error: issuesError,
    refetch: refetchIssues,
  } = useJiraBoardSprintIssues(cachedBoardId, cachedSprintId);

  const groupedIssues = useMemo(() => {
    if (!boardConfiguration?.columnConfig.columns || !sprintIssues?.issues) {
      return {};
    }
    return processAndGroupIssues(sprintIssues.issues, boardConfiguration);
  }, [sprintIssues, boardConfiguration]);

  useEffect(() => {
    if (boardsSuccess && boards) {
      const boardExists = boards.some((board) => board.id === cachedBoardId);
      if (!boardExists) {
        setCachedBoardId(-1);
        setCachedSprintId(-1);
      } else {
        setSelectedBoardId(cachedBoardId.toString());
      }
    }
  }, [boardsSuccess, boards, cachedBoardId]);

  useEffect(() => {
    if (sprintSuccess && activeSprint && activeSprint.id !== cachedSprintId) {
      setCachedSprintId(activeSprint.id);
    }
  }, [sprintSuccess, activeSprint, cachedSprintId]);

  const handleRefresh = async () => {
    try {
      await refetchIssues();
      showToast(Toast.Style.Success, "Refreshed");
    } catch {
      // Error handling is done by useEffect
    }
  };

  const copySprintInfo = async () => {
    if (!activeSprint) return;

    const sprintInfo = `Sprint: ${activeSprint.name}\nStart: ${activeSprint.startDate}\nEnd: ${activeSprint.endDate}\nGoal: ${activeSprint.goal || "No goal set"}`;
    await copyToClipboardWithToast(sprintInfo);
  };

  const isLoading = boardsLoading || sprintLoading || isBoardConfigurationLoading || issuesLoading;

  useEffect(() => {
    if (boardsError) {
      showFailureToast(boardsError, { title: "Failed to Load Boards" });
    }
  }, [boardsError]);

  useEffect(() => {
    if (sprintError) {
      showFailureToast(sprintError, { title: "Failed to Load Sprint" });
    }
  }, [sprintError]);

  useEffect(() => {
    if (boardConfigurationError) {
      showFailureToast(boardConfigurationError, { title: "Failed to Load Board Configuration" });
    }
  }, [boardConfigurationError]);

  useEffect(() => {
    if (issuesError) {
      showFailureToast(issuesError, { title: "Failed to Load Sprint Issues" });
    }
  }, [issuesError]);

  const onBoardChange = (newValue: string) => {
    if (!boardsSuccess) return;
    setCachedBoardId(newValue ? parseInt(newValue) : -1);
  };

  if (!cachedBoardId && boards?.length) {
    return (
      <List
        isLoading={boardsLoading}
        searchBarPlaceholder="Select Board"
        searchBarAccessory={
          <List.Dropdown tooltip="Select Board" value={selectedBoardId} onChange={onBoardChange} storeValue>
            {boards.map((board) => (
              <List.Dropdown.Item key={board.id} title={board.name} value={board.id.toString()} />
            ))}
          </List.Dropdown>
        }
      >
        <List.EmptyView
          icon={Icon.List}
          title="Select Board"
          description="Choose a board from the dropdown to view its active sprint issues"
        />
      </List>
    );
  }

  if (!cachedSprintId) {
    return (
      <List
        isLoading={isLoading}
        searchBarAccessory={
          <List.Dropdown tooltip="Select Board" value={selectedBoardId} onChange={onBoardChange} storeValue>
            {boards?.map((board) => (
              <List.Dropdown.Item key={board.id} title={board.name} value={board.id.toString()} />
            ))}
          </List.Dropdown>
        }
      >
        <List.EmptyView
          icon={Icon.Clock}
          title="No Active Sprint"
          description="This board doesn't have an active sprint"
          actions={
            <ActionPanel>
              <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={handleRefresh} />
              <DebugActions />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  return (
    <List
      throttle
      isLoading={isLoading}
      searchBarPlaceholder="Filter issues by summary, key, assignee, epic, status..."
      searchBarAccessory={
        <List.Dropdown tooltip="Select Board" value={selectedBoardId} onChange={onBoardChange} storeValue>
          {boards?.map((board) => (
            <List.Dropdown.Item key={board.id} title={board.name} value={board.id.toString()} />
          ))}
        </List.Dropdown>
      }
    >
      {Object.values(groupedIssues).flat().length === 0 ? (
        <List.EmptyView
          icon={Icon.MagnifyingGlass}
          title="No Issues"
          description="This sprint has no issues"
          actions={
            <ActionPanel>
              <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={handleRefresh} />
              <DebugActions />
            </ActionPanel>
          }
        />
      ) : (
        <>
          {Object.entries(groupedIssues).map(([columnName, issues]) => (
            <List.Section key={columnName} title={`${columnName} (${issues.length})`}>
              {issues.map((item) => (
                <List.Item
                  key={item.renderKey}
                  title={item.title}
                  subtitle={item.subtitle}
                  icon={item.icon}
                  accessories={item.accessories}
                  keywords={item.keywords}
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
                        icon={Icon.Switch}
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
                      <Action title="Copy Sprint Info" icon={Icon.CopyClipboard} onAction={copySprintInfo} />
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
          ))}
        </>
      )}
    </List>
  );
}
