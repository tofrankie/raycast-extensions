import { CACHE_KEY, JIRA_BOARD_TYPE } from "@/constants";
import { useCachedState } from "@raycast/utils";

import type { JiraBoardType } from "@/types";

const DEFAULT_NOTIFICATION_AVAILABLE = true;

export function useJiraNotificationAvailableCachedState() {
  const [available, setAvailable] = useCachedState(
    CACHE_KEY.JIRA_NOTIFICATION_AVAILABLE,
    DEFAULT_NOTIFICATION_AVAILABLE,
  );

  const resetAvailable = () => {
    setAvailable(DEFAULT_NOTIFICATION_AVAILABLE);
  };

  return {
    available,
    setAvailable,
    resetAvailable,
  };
}

const DEFAULT_BOARD_ID = -1;
const DEFAULT_SPRINT_ID = -1;
const DEFAULT_BOARD_TYPE = JIRA_BOARD_TYPE.SCRUM;

export function useJiraBoardCachedState() {
  const [boardId, setBoardId] = useCachedState(CACHE_KEY.JIRA_SELECTED_BOARD_ID, DEFAULT_BOARD_ID);
  const [boardType, setBoardType] = useCachedState<JiraBoardType>(
    CACHE_KEY.JIRA_SELECTED_BOARD_TYPE,
    DEFAULT_BOARD_TYPE,
  );
  const [sprintId, setSprintId] = useCachedState(CACHE_KEY.JIRA_SELECTED_BOARD_SPRINT_ID, DEFAULT_SPRINT_ID);

  const reset = () => {
    setBoardId(DEFAULT_BOARD_ID);
    setBoardType(DEFAULT_BOARD_TYPE);
    setSprintId(DEFAULT_SPRINT_ID);
  };

  return {
    boardId,
    setBoardId,
    boardType,
    setBoardType,
    sprintId,
    setSprintId,
    reset,
  };
}
