"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { CatalogItemDTO, RolePackageDTO } from "@/lib/types";
import type { CatalogItemInput, RolePackageInput } from "@/lib/validations/catalog";

export function useCatalog() {
  return useQuery({
    queryKey: ["catalog"],
    queryFn: () => apiFetch<CatalogItemDTO[]>("/api/catalog"),
    staleTime: 30_000,
  });
}

export function useRolePackages() {
  return useQuery({
    queryKey: ["role-packages"],
    queryFn: () => apiFetch<RolePackageDTO[]>("/api/role-packages"),
    staleTime: 30_000,
  });
}

export function useCreateCatalogItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CatalogItemInput) =>
      apiFetch<CatalogItemDTO>("/api/catalog", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog"] }),
  });
}

export function useUpdateCatalogItem(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CatalogItemInput) =>
      apiFetch<CatalogItemDTO>(`/api/catalog/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog"] }),
  });
}

export function useDeleteCatalogItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/catalog/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalog"] }),
  });
}

export function useCreateRolePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RolePackageInput) =>
      apiFetch<RolePackageDTO>("/api/role-packages", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["role-packages"] }),
  });
}

export function useUpdateRolePackage(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RolePackageInput) =>
      apiFetch<RolePackageDTO>(`/api/role-packages/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["role-packages"] }),
  });
}

export function useDeleteRolePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/role-packages/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["role-packages"] }),
  });
}
