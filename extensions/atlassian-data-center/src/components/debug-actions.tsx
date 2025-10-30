import { Action, ActionPanel, environment, Icon } from "@raycast/api";

import { DEBUG_ENABLE } from "@/constants";
import { clearAllCacheWithToast } from "@/utils";

const SUPPORT_PATH = environment.supportPath;

export default function DebugActions() {
  return (
    <ActionPanel.Section title="Debug">
      {DEBUG_ENABLE && <Action.Open title="Open Support Directory" target={SUPPORT_PATH} />}
      <Action title="Clear Cache" icon={Icon.Trash} onAction={clearAllCacheWithToast} />
    </ActionPanel.Section>
  );
}
