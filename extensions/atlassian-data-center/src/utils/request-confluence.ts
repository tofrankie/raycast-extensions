import { confluenceRequest, handleApiResponse, transformURL } from "@/utils";
import { CONFLUENCE_API, COMMAND_NAME } from "@/constants";
import type { ConfluenceSearchContentsResponse, ConfluenceSearchResponse, ConfluenceCurrentUser } from "@/types";

type SearchContentParams = {
  cql: string;
  limit: number;
  offset: number;
};

export async function searchContents({
  cql,
  limit,
  offset,
}: SearchContentParams): Promise<ConfluenceSearchContentsResponse> {
  const params = {
    cql,
    start: offset,
    limit,
    expand: "space,history.createdBy,history.lastUpdated,metadata.currentuser.favourited",
  };

  const data = await confluenceRequest<ConfluenceSearchContentsResponse>({
    method: "GET",
    url: CONFLUENCE_API.SEARCH_CONTENT,
    params,
  });

  return handleApiResponse({
    data,
    fileName: COMMAND_NAME.CONFLUENCE_SEARCH_CONTENTS,
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
  const url = transformURL(CONFLUENCE_API.CONTENT_FAVOURITE, { contentId });
  await confluenceRequest<void>({ method: "PUT", url });
}

type RemoveFromFavoriteParams = {
  contentId: string;
};

export async function removeFromFavorite({ contentId }: RemoveFromFavoriteParams): Promise<void> {
  const url = transformURL(CONFLUENCE_API.CONTENT_FAVOURITE, { contentId });
  await confluenceRequest<void>({ method: "DELETE", url });
}

type SearchUserParams = {
  cql: string;
  limit: number;
  offset: number;
};

export async function searchUsers({ cql, limit, offset }: SearchUserParams): Promise<ConfluenceSearchResponse> {
  const params = {
    cql,
    start: offset,
    limit,
    expand: "user,user.status",
  };

  const data = await confluenceRequest<ConfluenceSearchResponse>({
    method: "GET",
    url: CONFLUENCE_API.SEARCH,
    params,
  });

  return handleApiResponse({
    data,
    fileName: COMMAND_NAME.CONFLUENCE_SEARCH_USERS,
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
  limit: number;
  offset: number;
};

export async function searchSpaces({ cql, limit, offset }: SearchSpaceParams): Promise<ConfluenceSearchResponse> {
  const params = {
    cql,
    start: offset,
    limit,
    expand: "space,space.description.plain,space.icon,space.metadata.labels",
  };

  const data = await confluenceRequest<ConfluenceSearchResponse>({
    method: "GET",
    url: CONFLUENCE_API.SEARCH,
    params,
  });

  return handleApiResponse({
    data,
    fileName: COMMAND_NAME.CONFLUENCE_SEARCH_SPACES,
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
  const data = await confluenceRequest<ConfluenceCurrentUser>({ method: "GET", url: CONFLUENCE_API.CURRENT_USER });

  return handleApiResponse({
    data,
    fileName: "confluence-current-user",
    defaultValue: null,
  });
}
