import type { SearchFilter } from "@/types";

interface SectionTitleParams {
  fetchedCount: number;
  totalCount: number;
}

/**
 * Generate section title based on filter configuration
 */
export function getSectionTitle(filter: SearchFilter | null | undefined, params: SectionTitleParams): string {
  if (filter?.sectionTitle) {
    if (typeof filter.sectionTitle === "string") {
      return filter.sectionTitle;
    } else {
      return filter.sectionTitle(params);
    }
  }
  return `Results (${params.fetchedCount}/${params.totalCount})`;
}
