import type { ActivityType, RequestStatus, UserRole } from "@prisma/client";

/** Wire-format DTOs returned by the API. Dates are ISO strings (JSON has no
 * date type), so these are distinct from the Prisma model types. */

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  office: string;
}

export interface EquipmentItemDTO {
  id: string;
  name: string;
  quantity: number;
}

export interface RequestActivityDTO {
  id: string;
  type: ActivityType;
  fromStatus: RequestStatus | null;
  toStatus: RequestStatus | null;
  note: string | null;
  createdAt: string;
  actor: Pick<UserDTO, "id" | "name" | "role">;
}

export interface RequestSummaryDTO {
  id: number;
  requestNumber: string;
  employeeName: string;
  roleTitle: string;
  department: string;
  officeLocation: string;
  neededByDate: string;
  isNewHire: boolean;
  startDate: string | null;
  status: RequestStatus;
  progress: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: Pick<UserDTO, "id" | "name" | "role">;
  equipmentItems: EquipmentItemDTO[];
}

export interface RequestDetailDTO extends RequestSummaryDTO {
  activities: RequestActivityDTO[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface DashboardStatsDTO {
  totalCount: number;
  statusCounts: Record<RequestStatus, number>;
  recentActivity: (RequestActivityDTO & {
    requestId: number;
    requestNumber: string;
    employeeName: string;
  })[];
}

export interface CatalogItemDTO {
  id: string;
  name: string;
  category: string | null;
  active: boolean;
}

export interface RolePackageDTO {
  id: string;
  roleName: string;
  items: { id: string; name: string; quantity: number }[];
}
