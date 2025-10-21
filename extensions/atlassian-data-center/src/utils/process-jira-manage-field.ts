import { Icon } from "@raycast/api";

import { CACHE_KEY } from "@/constants";
import { jiraCustomFieldCache } from "@/utils";
import type { JiraField, ListItemAccessories, ProcessedJiraFieldItem } from "@/types";

export function getSelectedCustomFields(): JiraField[] {
  const cached = jiraCustomFieldCache.get(CACHE_KEY.JIRA_SELECTED_CUSTOM_FIELD);
  return cached ? JSON.parse(cached) : [];
}

export function getSelectedCustomFieldIds(): string[] {
  const fields = getSelectedCustomFields();
  return (fields || []).map((field) => field.id);
}

export function setSelectedCustomFields(fields: JiraField[]): void {
  jiraCustomFieldCache.set(CACHE_KEY.JIRA_SELECTED_CUSTOM_FIELD, JSON.stringify(fields));
}

export function addCustomField(field: JiraField): void {
  const current = getSelectedCustomFields();
  if (!current.some((item) => item.id === field.id)) {
    setSelectedCustomFields([...current, field]);
  }
}

export function removeCustomField(fieldId: string): void {
  const current = getSelectedCustomFields();
  setSelectedCustomFields(current.filter((field) => field.id !== fieldId));
}

export function processJiraFieldItem(field: JiraField, isAdded: boolean): ProcessedJiraFieldItem {
  const schemaType = field.schema?.type || "Unknown";
  const subtitle = {
    value: field.id,
    tooltip: "Field ID",
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
      tooltip: "Field Schema Type",
    },
    {
      text: field.custom ? "Custom" : "System",
      tooltip: "Field Type",
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
