"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type {
  DashboardStatsDTO,
  PaginatedResult,
  RequestDetailDTO,
  RequestSummaryDTO,
} from "@/lib/types";
import type { CreateRequestInput, UpdateRequestInput } from "@/lib/validations/request";
import type { RequestStatus } from "@prisma/client";

export interface RequestsListParams {
  q?: string;
  /** Accepts "ALL" as a sentinel for "no filter" (stripped before the request
   * goes out) so it can be bound directly to the shared RequestFilters UI. */
  status?: string;
  department?: string;
  office?: string;
  role?: string;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

function buildQueryString(params: RequestsListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || value === "ALL") continue;
    search.set(key, String(value));
  }
  return search.toString();
}

export function useRequestsList(params: RequestsListParams) {
  const queryString = buildQueryString(params);
  return useQuery({
    queryKey: ["requests", queryString],
    queryFn: () =>
      apiFetch<PaginatedResult<RequestSummaryDTO>>(`/api/requests?${queryString}`),
    placeholderData: keepPreviousData,
  });
}

export function useRequestFacets() {
  return useQuery({
    queryKey: ["requests", "facets"],
    queryFn: () => apiFetch<{ departments: string[]; roles: string[] }>(
      "/api/requests/facets"
    ),
    staleTime: 60_000,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => apiFetch<DashboardStatsDTO>("/api/stats"),
  });
}

export function useRequest(id: number) {
  return useQuery({
    queryKey: ["requests", "detail", id],
    queryFn: () => apiFetch<RequestDetailDTO>(`/api/requests/${id}`),
    enabled: Number.isFinite(id),
  });
}

function useInvalidateRequests() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["requests"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
  };
}

export function useCreateRequest() {
  const invalidate = useInvalidateRequests();
  return useMutation({
    mutationFn: (input: CreateRequestInput) =>
      apiFetch<RequestDetailDTO>("/api/requests", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: invalidate,
  });
}

export function useUpdateRequest(id: number) {
  const invalidate = useInvalidateRequests();
  return useMutation({
    mutationFn: (input: UpdateRequestInput) =>
      apiFetch<RequestDetailDTO>(`/api/requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: invalidate,
  });
}

export function useUpdateRequestStatus(id: number) {
  const invalidate = useInvalidateRequests();
  return useMutation({
    mutationFn: (input: { status: RequestStatus; note?: string }) =>
      apiFetch<RequestDetailDTO>(`/api/requests/${id}/status`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: invalidate,
  });
}

export function useDeleteRequest() {
  const invalidate = useInvalidateRequests();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/api/requests/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}
