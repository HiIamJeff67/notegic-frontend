import {
  SearchRootShelfSortBy,
  SearchRootShelvesDocument,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import { MaxSearchLimit } from "@shared/lib/search/limits";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/lib/url/api";
import { print } from "graphql";
import { getAccessToken } from "../tokens/accessToken";

export type SearchedRootShelf = {
  id: string;
  name: string;
  permission: AccessControlPermission;
  subShelfCount: number;
  itemCount: number;
  updatedAt: Date;
  deletedAt: Date | null;
};

type SearchRootShelvesPayload = {
  data?: {
    searchRootShelves?: {
      searchEdges?: Array<{
        node?: {
          id: string;
          name: string;
          permission: AccessControlPermission;
          subShelfCount: number;
          itemCount: number;
          updatedAt: string;
          deletedAt?: string | null;
        };
      }>;
    };
  };
};

export const SearchRootShelves = async (): Promise<SearchedRootShelf[]> => {
  const response = await fetch(
    `${APIURLPathDictionary.origin()}/${CurrentAPIBaseURL}/graphql/`,
    {
      method: "POST",
      headers: {
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        "Content-Type": "application/json",
      },
      credentials: "omit",
      body: JSON.stringify({
        query: print(SearchRootShelvesDocument),
        variables: {
          input: {
            query: "",
            first: MaxSearchLimit,
            sortBy: SearchRootShelfSortBy.Name,
            sortOrder: SearchSortOrder.Asc,
          },
        },
      }),
    }
  );
  if (!response.ok) throw new Error("searchRootShelves failed");
  const payload = (await response.json()) as SearchRootShelvesPayload;
  return (payload.data?.searchRootShelves?.searchEdges ?? []).flatMap(edge => {
    const node = edge.node;
    if (!node) return [];
    return [
      {
        id: node.id,
        name: node.name,
        permission: node.permission,
        subShelfCount: node.subShelfCount,
        itemCount: node.itemCount,
        updatedAt: new Date(node.updatedAt),
        deletedAt: node.deletedAt ? new Date(node.deletedAt) : null,
      },
    ];
  });
};
