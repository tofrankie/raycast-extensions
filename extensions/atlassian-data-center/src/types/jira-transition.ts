import type { JiraIssueStatus } from "@/types";

export interface JiraTransition {
  /**
   * Transition ID
   */
  id: string;
  name: string;
  to: JiraIssueStatus;
}

export interface JiraTransitionResponse {
  expand: string;
  transitions: JiraTransition[];
}

export interface JiraIssueTransitionRequest {
  transition: {
    id: string;
  };
}
