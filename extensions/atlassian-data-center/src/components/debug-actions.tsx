import { Action, environment } from "@raycast/api";

import { DEBUG_ENABLE } from "@/constants";

const SUPPORT_PATH = environment.supportPath;

export function DebugActions() {
  if (!DEBUG_ENABLE) {
    return null;
  }

  return <Action.Open title="Open Support Directory" target={SUPPORT_PATH} />;
}
