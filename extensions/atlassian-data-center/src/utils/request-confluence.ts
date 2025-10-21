import { confluenceRequest, writeResponseFile } from "@/utils";
import { CONFLUENCE_API, COMMAND_NAME, PAGINATION_SIZE } from "@/constants";
import type { ConfluenceSearchContentResponse, ConfluenceSearchResponse, ConfluenceCurrentUser } from "@/types";

export async function searchContent(cql: string, limit: number = PAGINATION_SIZE, start: number = 0) {
  const params = {
    cql,
    start,
    limit,
    expand: "space,history.createdBy,history.lastUpdated,metadata.currentuser.favourited",
  };

  const data = await confluenceRequest<ConfluenceSearchContentResponse>("GET", CONFLUENCE_API.SEARCH_CONTENT, params);

  if (data) {
    writeResponseFile(JSON.stringify(data, null, 2), COMMAND_NAME.CONFLUENCE_SEARCH_CONTENT);
  }

  return data;
}

export async function addToFavorite(contentId: string): Promise<void> {
  const endpoint = `${CONFLUENCE_API.CONTENT_FAVOURITE}${contentId}`;
  await confluenceRequest<void>("PUT", endpoint);
}

export async function removeFromFavorite(contentId: string): Promise<void> {
  const endpoint = `${CONFLUENCE_API.CONTENT_FAVOURITE}${contentId}`;
  await confluenceRequest<void>("DELETE", endpoint);
}

export async function searchUser(cql: string, limit: number = PAGINATION_SIZE, start: number = 0) {
  const params = {
    cql,
    start,
    limit,
    expand: "user,user.status",
  };

  const data = await confluenceRequest<ConfluenceSearchResponse>("GET", CONFLUENCE_API.SEARCH, params);

  if (data) {
    writeResponseFile(JSON.stringify(data, null, 2), COMMAND_NAME.CONFLUENCE_SEARCH_USER);
  }

  return data;
}

export async function searchSpace(cql: string, limit: number = PAGINATION_SIZE, start: number = 0) {
  const params = {
    cql,
    start,
    limit,
    expand: "space,space.description.plain,space.icon,space.metadata.labels",
  };

  const data = await confluenceRequest<ConfluenceSearchResponse>("GET", CONFLUENCE_API.SEARCH, params);

  if (data) {
    writeResponseFile(JSON.stringify(data, null, 2), COMMAND_NAME.CONFLUENCE_SEARCH_SPACE);
  }

  return data;
}

export async function getConfluenceCurrentUser(): Promise<ConfluenceCurrentUser> {
  const data = await confluenceRequest<ConfluenceCurrentUser>("GET", CONFLUENCE_API.CURRENT_USER);

  if (data) {
    writeResponseFile(JSON.stringify(data, null, 2), "confluence-current-user");
  }

  return data;
}
