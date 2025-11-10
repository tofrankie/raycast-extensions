import type { UseInfiniteQueryOptions, UseQueryOptions, QueryKey } from "@tanstack/react-query";

export type InfiniteQueryPageParam = { offset: number; limit: number };

export type InfiniteQueryOptions<TQueryFnData, TSelect = TQueryFnData, TPageParam = InfiniteQueryPageParam> = Partial<
  UseInfiniteQueryOptions<TQueryFnData, Error, TSelect, QueryKey, TPageParam>
>;

export type QueryOptions<TQueryFnData, TSelect = TQueryFnData> = Partial<
  UseQueryOptions<TQueryFnData, Error, TSelect, QueryKey>
>;
