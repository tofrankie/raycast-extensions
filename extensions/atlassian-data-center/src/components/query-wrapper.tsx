import { List, Icon, ActionPanel, Action } from "@raycast/api";

import { isCQL, isJQL, validateQuery } from "@/utils";
import { QUERY_TYPE } from "@/constants";
import type { QueryType } from "@/types";

const DOC_URL = {
  [QUERY_TYPE.JQL]: "https://developer.atlassian.com/server/jira/platform/rest/v11001/intro/#gettingstarted",
  [QUERY_TYPE.CQL]: "https://developer.atlassian.com/server/confluence/rest/v1010/intro/#advanced-searching-using-cql",
} as const;

interface QueryWrapperProps {
  query: string;
  queryType: QueryType;
  children: React.ReactNode;
}

// TODO: rename
export default function QueryWrapper({ query, queryType, children }: QueryWrapperProps) {
  const isQuery = queryType === QUERY_TYPE.JQL ? isJQL : isCQL;

  if (!isQuery(query)) {
    return <>{children}</>;
  }

  const validation = validateQuery({ query, queryType });
  if (validation.isValid) {
    return <>{children}</>;
  }

  return (
    <List.EmptyView
      icon={Icon.ExclamationMark}
      title={`${queryType} Syntax Error`}
      description={validation.error}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser icon={Icon.Book} title={`Open ${queryType} Documentation`} url={DOC_URL[queryType]} />
        </ActionPanel>
      }
    />
  );
}
