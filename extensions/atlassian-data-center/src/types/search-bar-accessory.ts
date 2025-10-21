import { COMMAND_NAME } from "@/constants";
import type { DropdownItemIcon } from "@/types";

export type SearchBarAccessoryCommandName =
  | typeof COMMAND_NAME.CONFLUENCE_SEARCH_CONTENT
  | typeof COMMAND_NAME.CONFLUENCE_SEARCH_SPACE
  | typeof COMMAND_NAME.JIRA_SEARCH_ISSUE;

export interface SearchBarAccessoryItem {
  value: string;
  title: string;
  /** Query string - CQL in Confluence, JQL in Jira */
  query: string;
  icon: DropdownItemIcon;
  autoQuery?: boolean;
  transform?: (processedQuery: string, context?: { userInput: string; filter: SearchFilter }) => string;
  sectionTitle?: string | ((params: { fetchedCount: number; totalCount: number }) => string);
  /** 逻辑运算符，用于连接用户输入和 filter 查询 */
  logicOperator?: "AND" | "OR" | "NOT";
  /** ORDER BY 子句 */
  orderBy?: string;
}

export type SearchFilter = Pick<
  SearchBarAccessoryItem,
  "value" | "query" | "transform" | "autoQuery" | "sectionTitle" | "logicOperator" | "orderBy"
>;
