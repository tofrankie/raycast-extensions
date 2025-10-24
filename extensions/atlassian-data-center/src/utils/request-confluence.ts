import { confluenceRequest, handleApiResponse } from "@/utils";
import { CONFLUENCE_API, COMMAND_NAME, PAGINATION_SIZE } from "@/constants";
import type { ConfluenceSearchContentResponse, ConfluenceSearchResponse, ConfluenceCurrentUser } from "@/types";

type SearchContentParams = {
  cql: string;
  limit?: number;
  start?: number;
};

export async function searchContent({
  cql,
  limit = PAGINATION_SIZE,
  start = 0,
}: SearchContentParams): Promise<ConfluenceSearchContentResponse> {
  const params = {
    cql,
    start,
    limit,
    expand: "space,history.createdBy,history.lastUpdated,metadata.currentuser.favourited",
  };

  const data = await confluenceRequest<ConfluenceSearchContentResponse>({
    method: "GET",
    endpoint: CONFLUENCE_API.SEARCH_CONTENT,
    params,
  });

  return handleApiResponse({
    data,
    fileName: COMMAND_NAME.CONFLUENCE_SEARCH_CONTENT,
    defaultValue: {
      results: [],
      start: 0,
      limit,
      size: 0,
      totalSize: 0,
      totalCount: 0,
      _links: {
        base: "",
        context: "",
      },
      cqlQuery: cql,
      searchDuration: 0,
    },
  });
}

type AddToFavoriteParams = {
  contentId: string;
};

export async function addToFavorite({ contentId }: AddToFavoriteParams): Promise<void> {
  const endpoint = `${CONFLUENCE_API.CONTENT_FAVOURITE}${contentId}`;
  await confluenceRequest<void>({ method: "PUT", endpoint });
}

type RemoveFromFavoriteParams = {
  contentId: string;
};

export async function removeFromFavorite({ contentId }: RemoveFromFavoriteParams): Promise<void> {
  const endpoint = `${CONFLUENCE_API.CONTENT_FAVOURITE}${contentId}`;
  await confluenceRequest<void>({ method: "DELETE", endpoint });
}

type SearchUserParams = {
  cql: string;
  limit?: number;
  start?: number;
};

export async function searchUser({
  cql,
  limit = PAGINATION_SIZE,
  start = 0,
}: SearchUserParams): Promise<ConfluenceSearchResponse> {
  const params = {
    cql,
    start,
    limit,
    expand: "user,user.status",
  };

  const data = await confluenceRequest<ConfluenceSearchResponse>({
    method: "GET",
    endpoint: CONFLUENCE_API.SEARCH,
    params,
  });

  return handleApiResponse({
    data,
    fileName: COMMAND_NAME.CONFLUENCE_SEARCH_USER,
    defaultValue: {
      results: [],
      start: 0,
      limit,
      size: 0,
      totalSize: 0,
      totalCount: 0,
      cqlQuery: cql,
      searchDuration: 0,
      _links: {
        base: "",
        context: "",
      },
    },
  });
}

type SearchSpaceParams = {
  cql: string;
  limit?: number;
  start?: number;
};

export async function searchSpace({
  cql,
  limit = PAGINATION_SIZE,
  start = 0,
}: SearchSpaceParams): Promise<ConfluenceSearchResponse> {
  const params = {
    cql,
    start,
    limit,
    expand: "space,space.description.plain,space.icon,space.metadata.labels",
  };

  const data = await confluenceRequest<ConfluenceSearchResponse>({
    method: "GET",
    endpoint: CONFLUENCE_API.SEARCH,
    params,
  });

  return handleApiResponse({
    data,
    fileName: COMMAND_NAME.CONFLUENCE_SEARCH_SPACE,
    defaultValue: {
      results: [],
      start: 0,
      limit,
      size: 0,
      totalSize: 0,
      totalCount: 0,
      _links: {
        base: "",
        context: "",
      },
      cqlQuery: cql,
      searchDuration: 0,
    },
  });
}

export async function getConfluenceCurrentUser(): Promise<ConfluenceCurrentUser | null> {
  const data = await confluenceRequest<ConfluenceCurrentUser>({ method: "GET", endpoint: CONFLUENCE_API.CURRENT_USER });

  return handleApiResponse({
    data,
    fileName: "confluence-current-user",
    defaultValue: null,
  });
}
