import { CONFLUENCE_CONTENT_TYPE, CONFLUENCE_ENTITY_TYPE, CONFLUENCE_SPACE_TYPE } from "@/constants";
import type { ValueOf } from "@/types";

export type ConfluenceEntityType = ValueOf<typeof CONFLUENCE_ENTITY_TYPE>;

export type ConfluenceContentType = ValueOf<typeof CONFLUENCE_CONTENT_TYPE>;

export type ConfluenceSpaceType = ValueOf<typeof CONFLUENCE_SPACE_TYPE>;

export type ConfluenceIconType = ConfluenceEntityType | ConfluenceContentType;

export type ConfluenceLabelType = ConfluenceEntityType | ConfluenceContentType;

export interface ConfluenceSearchContentResponse {
  results: ConfluenceSearchContentResult[];
  start: number;
  limit: number;
  size: number;
  cqlQuery: string;
  searchDuration: number;
  /**
   * Note: The API documentation states 'totalCount', but the actual response returns 'totalSize'. It's unclear which one is correct.
   */
  totalCount?: number;
  /**
   * Note: The API documentation states 'totalCount', but the actual response returns 'totalSize'. It's unclear which one is correct.
   */
  totalSize?: number;
  _links: ConfluenceSearchLinks;
}

export interface ConfluenceSearchContentResult {
  id: string;
  type: string;
  status: string;
  title: string;
  space: {
    id: number;
    key: string;
    name: string;
    type: string;
    status: string;
    _links: {
      webui: string;
      self: string;
    };
    _expandable: {
      metadata: string;
      icon: string;
      description: string;
      retentionPolicy: string;
      homepage: string;
    };
  };
  position: number;
  extensions: {
    position: string;
  };
  _links: {
    webui: string;
    edit: string;
    tinyui: string;
    self: string;
  };
  history: {
    latest: boolean;
    createdBy: {
      type: string;
      username: string;
      userKey: string;
      profilePicture: ConfluenceIcon;
      displayName: string;
      _links: {
        self: string;
      };
      _expandable: {
        status: string;
      };
    };
    createdDate: string;
    lastUpdated: {
      by: {
        type: string;
        username: string;
        userKey: string;
        profilePicture: ConfluenceIcon;
        displayName: string;
        _links: {
          self: string;
        };
        _expandable: {
          status: string;
        };
      };
      when: string;
      message: string;
      number: number;
      minorEdit: boolean;
      hidden: boolean;
      _links: {
        self: string;
      };
      _expandable: {
        content: string;
      };
    };
    _links: {
      self: string;
    };
    _expandable: {
      lastUpdated: string;
      previousVersion: string;
      contributors: string;
      nextVersion: string;
    };
  };
  metadata: {
    currentuser: {
      favourited?: {
        isFavourite: boolean;
        favouritedDate: number;
      };
      _expandable: {
        lastmodified: string;
        viewed: string;
        lastcontributed: string;
      };
    };
    _expandable: {
      properties: string;
      frontend: string;
      editorHtml: string;
      labels: string;
    };
  };
  _expandable: {
    container: string;
    metadata: string;
    operations: string;
    children: string;
    restrictions: string;
    history: string;
    ancestors: string;
    descendants: string;
  };
}

export interface ConfluenceSearchResponse {
  results: ConfluenceSearchResult[];
  start: number;
  limit: number;
  size: number;
  /**
   * Note: The API documentation states 'totalCount', but the actual response returns 'totalSize'. It's unclear which one is correct.
   */
  totalCount?: number;
  /**
   * Note: The API documentation states 'totalCount', but the actual response returns 'totalSize'. It's unclear which one is correct.
   */
  totalSize?: number;
  cqlQuery: string;
  searchDuration: number;
  _links: ConfluenceSearchLinks;
}

export interface ConfluenceSearchResult {
  content?: ConfluenceSearchContentResult;
  user?: ConfluenceUser;
  space?: ConfluenceSpace;
  title: string;
  excerpt: string;
  url: string;
  resultGlobalContainer?: {
    title: string;
    displayUrl: string;
  };
  entityType: ConfluenceEntityType;
  iconCssClass: string;
  lastModified: string;
  friendlyLastModified: string;
  timestamp: number;
}

export interface ConfluenceUser {
  type: string;
  status: string;
  username: string;
  userKey?: string;
  profilePicture: ConfluenceIcon;
  displayName: string;
  _links: {
    self: string;
  };
}

export interface ConfluenceCurrentUser {
  type: string;
  username: string;
  userKey: string;
  profilePicture: {
    path: string;
    width: number;
    height: number;
    isDefault: boolean;
  };
  displayName: string;
  _links: {
    base: string;
    context: string;
    self: string;
  };
  _expandable: {
    status: string;
  };
}

export interface ConfluenceSpace {
  id: number;
  key: string;
  name: string;
  status: string;
  type: string;
  icon: {
    path: string;
    width: number;
    height: number;
    isDefault: boolean;
  };
  description?: {
    plain: {
      value: string;
      representation: string;
    };
    _expandable: {
      view: string;
    };
  };
  metadata?: {
    labels: {
      results: Array<{
        prefix: string;
        name: string;
        id: string;
        label: string;
      }>;
      start: number;
      limit: number;
      size: number;
    };
  };
  _links: {
    self: string;
    webui: string;
  };
  _expandable: {
    retentionPolicy: string;
    homepage: string;
  };
}

export interface ConfluenceIcon {
  path: string;
  width: number;
  height: number;
  isDefault: boolean;
}

export interface ConfluenceSearchLinks {
  self?: string;
  next?: string;
  base: string;
  context: string;
}
