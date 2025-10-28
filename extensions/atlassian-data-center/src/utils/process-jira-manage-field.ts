import { Icon } from "@raycast/api";

import { CACHE_KEY } from "@/constants";
import { jiraSelectedFieldsCache } from "@/utils";
import type { JiraField, ListItemAccessories, ProcessedJiraFieldItem } from "@/types";

export function getSelectedFields(): JiraField[] {
  const cached = jiraSelectedFieldsCache.get(CACHE_KEY.JIRA_SELECTED_FIELDS);
  return cached ? JSON.parse(cached) : [];
}

export function getSelectedFieldIds(): string[] {
  const fields = getSelectedFields();
  return (fields || []).map((field) => field.id);
}

export function setSelectedFields(fields: JiraField[]): void {
  jiraSelectedFieldsCache.set(CACHE_KEY.JIRA_SELECTED_FIELDS, JSON.stringify(fields));
}

export function addSelectedField(field: JiraField): void {
  const current = getSelectedFields();
  if (!current.some((item) => item.id === field.id)) {
    setSelectedFields([...current, field]);
  }
}

export function removeSelectedField(fieldId: string): void {
  const current = getSelectedFields();
  setSelectedFields(current.filter((field) => field.id !== fieldId));
}

export function processJiraFieldItem(field: JiraField, isAdded: boolean): ProcessedJiraFieldItem {
  const schemaType = field.schema?.type || "Unknown";
  const subtitle = {
    value: field.id,
    tooltip: `Field ID: ${field.id}`,
  };

  const accessories: ListItemAccessories = [
    ...(isAdded
      ? [
          {
            icon: Icon.Checkmark,
            tooltip: "Included in search",
          },
        ]
      : []),
    {
      text: schemaType,
      tooltip: `Field Schema Type: ${schemaType}`,
    },
    {
      text: field.custom ? "Custom" : "System",
      tooltip: `Field Type: ${field.custom ? "Custom" : "System"}`,
    },
  ];

  return {
    renderKey: field.id,
    title: field.name,
    id: field.id,
    name: field.name,
    subtitle,
    accessories,
    custom: field.custom,
    isAdded,
    keywords: [field.id, schemaType],
    schema: field.schema,
  };
}
