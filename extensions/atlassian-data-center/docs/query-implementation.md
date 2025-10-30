# 查询构建器设计文档

## 概述

本文档描述了查询构建器的整体设计思路、架构和具体实现方案。详细的技术规范请参考：

- **[JQL/CQL 语法规范](./query-syntax.md)** - 包含完整的 JQL 和 CQL 语法规范

## 1. 问题分析

### 1.1 核心问题

当前 JQL/CQL 构建逻辑存在以下问题：

1. **ORDER BY 语法冲突**：使用 `(${jql}) AND ${filterJQL}` 的方式会破坏 `ORDER BY` 子句
2. **冲突处理缺失**：用户输入与 filter 条件冲突时缺乏处理机制
3. **查询结构理解不足**：无法正确解析和重构 JQL/CQL 查询结构
4. **逻辑运算符灵活性不足**：无法灵活定义用户查询与 filter 查询的逻辑关系

### 1.2 解决方案概述

设计一个健壮的查询融合系统，能够：

- 正确解析 JQL/CQL 查询结构
- 处理用户输入与 filter 之间的冲突和重复
- 支持灵活的逻辑运算符组合
- 提供忽略 filter 的机制
- 支持完整的 JQL/CQL 语法

## 2. 设计原则

### 2.1 核心原则

1. **用户输入优先**：用户输入的条件优先于 filter 条件
2. **结构完整性**：保持 JQL/CQL 查询的完整结构
3. **灵活性**：支持多种逻辑运算符组合
4. **可扩展性**：易于添加新的查询类型和功能
5. **类型安全**：使用 TypeScript 确保类型安全

### 2.2 处理策略

#### 2.2.1 用户输入类型判断

1. **完整查询**：包含完整 JQL/CQL 语法的输入
2. **普通文本**：简单的文本输入，需要转换为查询子句

#### 2.2.2 冲突处理

1. **字段冲突**：相同字段的不同值，用户输入优先
2. **逻辑冲突**：相互矛盾的条件，用户输入优先
3. **重复处理**：相同的条件，去重处理

## 3. 核心架构

### 3.1 主要组件

#### 3.1.1 查询处理器

```typescript
// 处理用户输入和 filter 的公共逻辑
function processUserInputAndFilter(params: ProcessUserInputParams): ProcessUserInputResult;
```

#### 3.1.2 查询构建器

```typescript
// 构建完整查询的核心方法
function buildQuery(params: BuildQueryParams): string;
```

#### 3.1.3 语法检测器

```typescript
// 语法检测
function isJQL(input: string): boolean;
function isCQL(input: string): boolean;
function hasJQLOrderBy(input: string): boolean;
function hasCQLOrderBy(input: string): boolean;
```

#### 3.1.4 查询解析器

```typescript
// 查询解析
function parseJQLQuery(input: string): ParsedQuery;
function parseCQLQuery(input: string): ParsedQuery;
```

### 3.2 数据流

```
用户输入 → 语法检测 → 查询解析 → 冲突处理 → 查询构建 → 最终查询
    ↓
Filter 条件 → 逻辑组合 → 查询构建 → 最终查询
```

## 4. 实现方案

### 4.1 忽略 Filter 处理

#### 常量定义

```typescript
/**
 * 忽略 filter 的常量标识
 * 目前硬编码，后续可能做成可配置的选项
 */
export const IGNORE_FILTER = true;
```

#### 处理逻辑

- 在命令层面根据业务逻辑判断是否要忽略 filter
- 如果决定忽略 filter，则传入 undefined 或 null 给构建器

#### 使用示例

```typescript
// 在命令组件中
function handleUserInput(userInput: string, filter?: SearchFilter) {
  const effectiveFilter = IGNORE_FILTER ? undefined : filter;

  const result = processUserInputAndFilter({
    userInput,
    filter: effectiveFilter,
    buildClauseFromText: (input) => `text ~ "${input}"`,
    queryType: "JQL",
  });

  // 如果返回字符串，直接返回（完整查询且有 ORDER BY）
  if (typeof result === "string") {
    return result;
  }

  // 否则调用 buildQuery 构建最终查询
  return buildQuery({
    ...result,
    orderBy: result.orderBy || " ORDER BY created DESC", // Jira 特定的默认排序
    queryType: "JQL",
  });
}
```

### 4.2 逻辑运算符处理

#### 4.2.1 SearchFilter 接口扩展

```typescript
export interface SearchBarAccessoryItem {
  id: string;
  title: string;
  query: string;
  logicOperator?: LogicOperator; // 新增：逻辑运算符
  orderBy?: string; // 新增：ORDER BY 子句
}
```

#### 4.2.2 合并示例

```typescript
// 用户输入：project = "TEST"
// Filter 条件：assignee = currentUser()，逻辑运算符：AND
// 结果：project = "TEST" AND assignee = currentUser()

// 用户输入：project = "TEST"
// Filter 条件：assignee = currentUser()，逻辑运算符：OR
// 结果：project = "TEST" OR assignee = currentUser()

// 用户输入：project = "TEST"
// Filter 条件：assignee = currentUser()，逻辑运算符：NOT
// 结果：project = "TEST" AND NOT assignee = currentUser()
```

### 4.3 核心实现

#### 4.3.1 核心合并方法

```typescript
/**
 * 构建完整查询的核心方法
 * @param params 构建参数对象
 * @param params.clauses 子句数组（已由命令组件处理好的子句）
 * @param params.logicOperator 逻辑运算符，默认为 'AND'
 * @param params.orderBy ORDER BY 子句（已由命令组件确定）
 * @param params.queryType 查询类型：'JQL' 或 'CQL'
 * @returns 构建后的完整查询
 */
function buildQuery(params: BuildQueryParams): string {
  const { clauses, logicOperator = "AND", orderBy, queryType } = params;

  // 1. 构建 WHERE 子句部分
  const whereClause = buildWhereClause(clauses, logicOperator, queryType);

  // 2. 组合最终查询（orderBy 由命令组件处理）
  const finalQuery = whereClause + (orderBy ? ` ${orderBy}` : "");

  // 3. 格式化：移除多余空格并标准化
  return finalQuery.replace(/\s+/g, " ").trim();
}
```

#### 4.3.2 公共处理方法

```typescript
/**
 * 处理用户输入和 filter 的公共逻辑
 * @param userInput 用户输入
 * @param filter 单个 filter 对象
 * @param buildClauseFromText 将普通文本构建为查询子句的函数（命令特定）
 * @param queryType 查询类型：'JQL' 或 'CQL'
 * @returns combineClause 所需的参数（除 queryType 外）
 */
function processUserInputAndFilter(params: ProcessUserInputParams): ProcessUserInputResult {
  const { userInput, filter, buildClauseFromText, queryType } = params;

  // 根据 queryType 选择对应的处理函数
  const isCompleteQuery = queryType === "JQL" ? isJQL : isCQL;
  const hasOrderBy = queryType === "JQL" ? hasJQLOrderBy : hasCQLOrderBy;
  const parseQuery = queryType === "JQL" ? parseJQLQuery : parseCQLQuery;

  const isComplete = isCompleteQuery(userInput);
  const hasUserOrderBy = hasOrderBy(userInput);

  if (isComplete) {
    if (hasUserOrderBy) {
      // 1. 完整查询且有 ORDER BY：直接返回
      return userInput;
    } else {
      // 2a. 完整查询但无 ORDER BY：解析后使用 filter order by
      const parsed = parseQuery(userInput);
      return {
        clauses: [parsed.whereClause], // 只包含用户子句
        logicOperator: "AND",
        orderBy: filter?.orderBy, // 使用 filter order by
      };
    }
  } else {
    // 2b. 非完整查询：构建用户子句
    const userClause = buildClauseFromText(userInput);
    const filterClause = filter?.query || "";

    return {
      clauses: [userClause, filterClause], // 用户子句 + filter 子句
      logicOperator: "AND",
      orderBy: filter?.orderBy, // 使用 filter order by
    };
  }
}
```

#### 4.3.3 辅助方法

```typescript
/**
 * 构建 WHERE 子句部分
 */
function buildWhereClause(clauses: string[], logicOperator: LogicOperator, queryType: QueryType): string {
  // 过滤空子句
  const validClauses = clauses.filter((clause) => clause.trim());

  // 如果没有有效子句，返回空字符串
  if (validClauses.length === 0) {
    return "";
  }

  // 如果只有一个子句，直接返回
  if (validClauses.length === 1) {
    return validClauses[0];
  }

  // 多个子句需要组合
  return joinClauses(validClauses, logicOperator, queryType);
}

/**
 * 连接多个子句，考虑优先级规则
 */
function joinClauses(clauses: string[], logicOperator: LogicOperator, queryType: QueryType): string {
  // 根据优先级规则，可能需要添加括号
  if (logicOperator === "OR" && clauses.some((clause) => clause.includes(" AND "))) {
    // OR 连接包含 AND 的子句时，需要括号
    return clauses.map((clause) => `(${clause})`).join(` ${logicOperator} `);
  }

  return clauses.join(` ${logicOperator} `);
}
```

### 4.4 命令组件使用示例

#### 4.4.1 Jira 命令示例

```typescript
// 在 jira-search-issue.tsx 中
function handleUserInput(userInput: string, filter?: SearchFilter) {
  const result = processUserInputAndFilter({
    userInput,
    filter,
    buildClauseFromText: (input) => `text ~ "${input}"`, // Jira 特定的构建逻辑
    queryType: "JQL",
  });

  // 如果返回字符串，直接返回（完整查询且有 ORDER BY）
  if (typeof result === "string") {
    return result;
  }

  // 否则调用 buildQuery
  return buildQuery({
    ...result,
    orderBy: result.orderBy || " ORDER BY created DESC", // Jira 特定的默认排序
    queryType: "JQL",
  });
}
```

#### 4.4.2 Confluence 命令示例

```typescript
// 在 confluence-search-contents.tsx 中
function handleUserInput(userInput: string, filter?: SearchFilter) {
  const result = processUserInputAndFilter({
    userInput,
    filter,
    buildClauseFromText: (input) => `text ~ "${input}"`, // Confluence 特定的构建逻辑
    queryType: "CQL",
  });

  // 如果返回字符串，直接返回（完整查询且有 ORDER BY）
  if (typeof result === "string") {
    return result;
  }

  // 否则调用 buildQuery
  return buildQuery({
    ...result,
    orderBy: result.orderBy || " ORDER BY lastmodified DESC", // Confluence 特定的默认排序
    queryType: "CQL",
  });
}
```

## 5. 类型定义

### 5.1 核心类型

```typescript
export type QueryType = "JQL" | "CQL";
export type LogicOperator = "AND" | "OR" | "NOT";

export interface ParsedQuery {
  whereClause: string;
  orderBy: string;
}

export interface BuildQueryParams {
  clauses: string[];
  logicOperator?: LogicOperator;
  orderBy?: string;
  queryType: QueryType;
}

export interface ProcessUserInputParams {
  userInput: string;
  filter?: SearchFilter;
  buildClauseFromText: (input: string) => string;
  queryType: QueryType;
}

export type ProcessUserInputResult =
  | {
      clauses: string[];
      logicOperator: LogicOperator;
      orderBy?: string;
    }
  | string;
```

### 5.2 扩展的 SearchFilter 接口

```typescript
export interface SearchBarAccessoryItem {
  id: string;
  title: string;
  query: string;
  logicOperator?: LogicOperator; // 新增：逻辑运算符
  orderBy?: string; // 新增：ORDER BY 子句
}

export type SearchFilter = SearchBarAccessoryItem;
```

## 6. 文件组织

### 6.1 目录结构

```
src/
├── constants/
│   └── query.ts          # 查询相关常量
├── types/
│   └── query.ts          # 查询相关类型
├── utils/
│   └── query.ts          # 查询相关工具函数
└── hooks/
    └── query.ts          # 查询相关 React hooks
```

### 6.2 文件内容分配

#### 6.2.1 `src/constants/query.ts`

```typescript
export const IGNORE_FILTER = true;

export const JQL_KEYWORDS = ["AND", "OR", "NOT", "EMPTY", "NULL", "ORDER BY"];

export const CQL_KEYWORDS = ["AND", "OR", "NOT", "ORDER BY"];

export const CQL_OPERATORS = ["=", "!=", ">", ">=", "<", "<=", "in", "not in", "~", "!~"];

export const JQL_OPERATORS = [
  "=",
  "!=",
  ">",
  ">=",
  "<",
  "<=",
  "in",
  "not in",
  "~",
  "!~",
  "is",
  "is not",
  "was",
  "was in",
  "was not in",
  "was not",
  "changed",
];
```

#### 6.2.2 `src/types/query.ts`

```typescript
export type QueryType = "JQL" | "CQL";

export type LogicOperator = "AND" | "OR" | "NOT";

export interface ParsedQuery {
  whereClause: string;
  orderBy: string;
}

export interface BuildQueryParams {
  clauses: string[];
  logicOperator?: LogicOperator;
  orderBy?: string;
  queryType: QueryType;
}

export interface ProcessUserInputParams {
  userInput: string;
  filter?: SearchFilter;
  buildClauseFromText: (input: string) => string;
  queryType: QueryType;
}

export type ProcessUserInputResult =
  | {
      clauses: string[];
      logicOperator: LogicOperator;
      orderBy?: string;
    }
  | string;
```

#### 6.2.3 `src/utils/query.ts`

```typescript
import {
  QueryType,
  LogicOperator,
  ParsedQuery,
  BuildQueryParams,
  ProcessUserInputParams,
  ProcessUserInputResult,
} from "../types/query";
import { CQL_OPERATORS, JQL_OPERATORS, CQL_KEYWORDS, JQL_KEYWORDS } from "../constants/query";

// 核心方法
export function buildQuery(params: BuildQueryParams): string;
export function processUserInputAndFilter(params: ProcessUserInputParams): ProcessUserInputResult;

// 辅助方法
export function buildWhereClause(clauses: string[], logicOperator: LogicOperator, queryType: QueryType): string;

// 语法检测
export function isJQL(input: string): boolean;
export function isCQL(input: string): boolean;
export function hasJQLOrderBy(input: string): boolean;
export function hasCQLOrderBy(input: string): boolean;

// 查询解析
export function parseJQLQuery(input: string): ParsedQuery;
export function parseCQLQuery(input: string): ParsedQuery;
```

#### 6.2.4 `src/hooks/query.ts`

```typescript
import { useCallback } from "react";
import { processUserInputAndFilter, buildQuery } from "../utils/query";
import { QueryType, ProcessUserInputParams } from "../types/query";

// 如果需要 React hooks 来封装 query 处理逻辑
export function useQueryProcessor(queryType: QueryType) {
  const processQuery = useCallback(
    (params: Omit<ProcessUserInputParams, "queryType">) => {
      return processUserInputAndFilter({
        ...params,
        queryType,
      });
    },
    [queryType],
  );

  return { processQuery };
}
```

## 7. 实施步骤

### 7.1 第一阶段：基础架构

1. 创建类型定义文件
2. 创建常量定义文件
3. 实现核心的 `buildQuery` 方法
4. 实现基础的语法检测方法

### 7.2 第二阶段：查询处理

1. 实现 `processUserInputAndFilter` 方法
2. 实现查询解析方法
3. 实现冲突处理逻辑
4. 添加单元测试

### 7.3 第三阶段：集成测试

1. 更新现有命令组件
2. 测试各种查询场景
3. 性能优化
4. 文档完善

### 7.4 第四阶段：功能扩展

1. 添加更多 JQL/CQL 语法支持
2. 实现高级查询功能
3. 添加查询验证
4. 用户界面优化

## 8. 测试策略

### 8.1 单元测试

- 测试各个工具函数的正确性
- 测试边界条件和异常情况
- 测试类型安全性

### 8.2 集成测试

- 测试完整的查询构建流程
