import { SearchFilter } from "./search-bar-accessory";

export type QueryType = "JQL" | "CQL";

export type LogicOperator = "AND" | "OR" | "NOT";

export interface ProcessUserInputParams {
  userInput: string;
  filter?: SearchFilter | null;
  buildClauseFromText: (input: string) => string;
  queryType: QueryType;
}
