import { useState, useEffect, useMemo } from "react";
import { Form, ActionPanel, Action, Icon, showToast, Toast, useNavigation } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";

import QueryProvider from "@/query-provider";
import {
  useJiraCurrentUser,
  useJiraIssueQuery,
  useJiraIssueTransitionsQuery,
  useJiraIssueTransitionMutation,
} from "@/hooks";

interface JiraIssueTransitionProps {
  issueKey: string;
  onUpdate?: () => void;
}

export function JiraIssueTransition(props: JiraIssueTransitionProps) {
  return (
    <QueryProvider>
      <JiraIssueTransitionContent {...props} />
    </QueryProvider>
  );
}

function JiraIssueTransitionContent({ issueKey, onUpdate }: JiraIssueTransitionProps) {
  const { pop } = useNavigation();
  const [selectedTransitionId, setSelectedTransitionId] = useState<string>("");
  const { currentUser } = useJiraCurrentUser();
  const { data: issue, isLoading: issueLoading, error: issueError } = useJiraIssueQuery(issueKey);

  const {
    data: transitions,
    isLoading: transitionsLoading,
    error: transitionsError,
  } = useJiraIssueTransitionsQuery(issueKey);

  const transitionMutation = useJiraIssueTransitionMutation({
    onSuccess: () => {
      showToast({
        style: Toast.Style.Success,
        title: "Status Updated",
        message: `Issue ${issueKey} status has been updated successfully`,
      });
    },
    onError: (error) => {
      showFailureToast(error, {
        title: "Failed to Update Status",
        message: `Failed to update status for issue ${issueKey}`,
      });
    },
  });

  const handleSubmit = async (values: { transitionId: string }) => {
    if (!values.transitionId) {
      showToast({
        style: Toast.Style.Failure,
        title: "No Status Selected",
      });
      return;
    }

    try {
      await transitionMutation.mutateAsync({
        issueKey,
        transitionId: values.transitionId,
      });
      onUpdate?.();
      pop();
    } catch {
      // Error handling is done by mutation onError
    }
  };

  const handleCancel = () => {
    pop();
  };

  useEffect(() => {
    if (issueError) {
      showFailureToast(issueError, { title: "Failed to Load Issue" });
    }
  }, [issueError]);

  useEffect(() => {
    if (transitionsError) {
      showFailureToast(transitionsError, { title: "Failed to Load Issue Transitions" });
    }
  }, [transitionsError]);

  const isLoading = issueLoading || transitionsLoading || transitionMutation.isPending;

  const availableStatusList = useMemo(() => {
    if (!issue || !transitions) return [];
    return transitions.transitions
      .filter((transition) => transition.to.id !== issue.fields.status?.id)
      .map((item) => ({ ...item, displayName: `${item.name} (${item.to.name})` }));
  }, [issue, transitions]);

  const displayValues = useMemo(() => {
    if (!issue) {
      return { issueKey: "-", summary: "-", status: "-", assignee: "-" };
    }

    const assigneeName = issue.fields.assignee?.displayName;
    const isAssignee = currentUser?.key === issue.fields.assignee?.key;
    const assigneeTips = !isAssignee ? " (not assigned to you)" : "";
    return {
      issueKey: issue.key,
      summary: issue.fields.summary,
      status: issue.fields.status?.name,
      assignee: assigneeName ? `${assigneeName}${assigneeTips}` : `Unassigned${assigneeTips}`,
    };
  }, [issue, currentUser]);

  return (
    <Form
      isLoading={isLoading}
      navigationTitle="Transition Status"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit" icon={Icon.Checkmark} onSubmit={handleSubmit} />
          <Action title="Cancel" icon={Icon.Xmark} onAction={handleCancel} />
        </ActionPanel>
      }
    >
      <Form.Description title="Issue Key" text={displayValues.issueKey} />
      <Form.Description title="Summary" text={displayValues.summary} />
      <Form.Description title="Assignee" text={displayValues.assignee} />
      <Form.Description title="Status" text={displayValues.status} />
      <Form.Dropdown
        id="transitionId"
        title="Transition Action"
        placeholder="Select transition action..."
        value={selectedTransitionId}
        onChange={setSelectedTransitionId}
      >
        {availableStatusList.map((item) => (
          <Form.Dropdown.Item key={item.id} value={item.id} title={item.displayName} />
        ))}
      </Form.Dropdown>
    </Form>
  );
}
