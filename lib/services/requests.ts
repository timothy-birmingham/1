import "server-only";
import { Prisma, type User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatRequestId, STATUS_PROGRESS } from "@/lib/format";
import { NotFoundError } from "@/lib/api-utils";
import type {
  CreateRequestInput,
  RequestListQuery,
  StatusUpdateInput,
  UpdateRequestInput,
} from "@/lib/validations/request";
import type {
  PaginatedResult,
  RequestDetailDTO,
  RequestSummaryDTO,
} from "@/lib/types";

const summaryInclude = {
  createdBy: { select: { id: true, name: true, role: true } },
  equipmentItems: { select: { id: true, name: true, quantity: true } },
} satisfies Prisma.EquipmentRequestInclude;

type RequestWithSummaryRelations = Prisma.EquipmentRequestGetPayload<{
  include: typeof summaryInclude;
}>;

function serializeSummary(request: RequestWithSummaryRelations): RequestSummaryDTO {
  return {
    id: request.id,
    requestNumber: formatRequestId(request.id),
    employeeName: request.employeeName,
    roleTitle: request.roleTitle,
    department: request.department,
    officeLocation: request.officeLocation,
    neededByDate: request.neededByDate.toISOString(),
    isNewHire: request.isNewHire,
    startDate: request.startDate?.toISOString() ?? null,
    status: request.status,
    progress: STATUS_PROGRESS[request.status],
    notes: request.notes,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    createdBy: request.createdBy,
    equipmentItems: request.equipmentItems,
  };
}

const detailInclude = {
  ...summaryInclude,
  activities: {
    orderBy: { createdAt: "asc" },
    include: { actor: { select: { id: true, name: true, role: true } } },
  },
} satisfies Prisma.EquipmentRequestInclude;

type RequestWithDetailRelations = Prisma.EquipmentRequestGetPayload<{
  include: typeof detailInclude;
}>;

function serializeDetail(request: RequestWithDetailRelations): RequestDetailDTO {
  return {
    ...serializeSummary(request),
    activities: request.activities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      fromStatus: activity.fromStatus,
      toStatus: activity.toStatus,
      note: activity.note,
      createdAt: activity.createdAt.toISOString(),
      actor: activity.actor,
    })),
  };
}

function buildWhere(query: RequestListQuery): Prisma.EquipmentRequestWhereInput {
  const where: Prisma.EquipmentRequestWhereInput = {};

  if (query.status) where.status = query.status;
  if (query.department) where.department = query.department;
  if (query.office) where.officeLocation = query.office;
  if (query.role) where.roleTitle = query.role;

  if (query.q) {
    where.OR = [
      { employeeName: { contains: query.q } },
      { roleTitle: { contains: query.q } },
      { department: { contains: query.q } },
      { officeLocation: { contains: query.q } },
      { notes: { contains: query.q } },
    ];
  }

  return where;
}

export async function listRequests(
  query: RequestListQuery
): Promise<PaginatedResult<RequestSummaryDTO>> {
  const where = buildWhere(query);

  // "requestNumber" search (e.g. "REQ-000004" or "4") isn't a real column,
  // so match it against the numeric id directly.
  if (query.q) {
    const numericMatch = query.q.match(/(\d+)/);
    if (numericMatch) {
      const idGuess = Number(numericMatch[1]);
      where.OR = [...(where.OR ?? []), { id: idGuess }];
    }
  }

  const orderBy: Prisma.EquipmentRequestOrderByWithRelationInput =
    query.sort === "createdAt"
      ? { createdAt: query.order }
      : { [query.sort]: query.order };

  const [items, total] = await Promise.all([
    prisma.equipmentRequest.findMany({
      where,
      include: summaryInclude,
      orderBy,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.equipmentRequest.count({ where }),
  ]);

  return {
    items: items.map(serializeSummary),
    total,
    page: query.page,
    pageSize: query.pageSize,
    pageCount: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function getRequestById(id: number): Promise<RequestDetailDTO> {
  const request = await prisma.equipmentRequest.findUnique({
    where: { id },
    include: detailInclude,
  });
  if (!request) throw new NotFoundError(`Request ${formatRequestId(id)} not found`);
  return serializeDetail(request);
}

export async function createRequest(
  input: CreateRequestInput,
  actor: User
): Promise<RequestDetailDTO> {
  const request = await prisma.equipmentRequest.create({
    data: {
      employeeName: input.employeeName,
      roleTitle: input.roleTitle,
      department: input.department,
      officeLocation: input.officeLocation,
      neededByDate: input.neededByDate,
      isNewHire: input.isNewHire,
      startDate: input.isNewHire ? input.startDate ?? null : null,
      notes: input.notes ?? "",
      createdByUserId: actor.id,
      equipmentItems: { create: input.equipmentItems },
      activities: {
        create: {
          type: "CREATED",
          toStatus: "UNTOUCHED",
          actorUserId: actor.id,
        },
      },
    },
    include: detailInclude,
  });

  return serializeDetail(request);
}

export async function updateRequestDetails(
  id: number,
  input: UpdateRequestInput,
  actor: User
): Promise<RequestDetailDTO> {
  const existing = await prisma.equipmentRequest.findUnique({
    where: { id },
    include: { equipmentItems: true },
  });
  if (!existing) throw new NotFoundError(`Request ${formatRequestId(id)} not found`);

  const equipmentChanged =
    JSON.stringify(
      existing.equipmentItems
        .map((item) => ({ name: item.name, quantity: item.quantity }))
        .sort((a, b) => a.name.localeCompare(b.name))
    ) !==
    JSON.stringify(
      [...input.equipmentItems].sort((a, b) => a.name.localeCompare(b.name))
    );

  const request = await prisma.equipmentRequest.update({
    where: { id },
    data: {
      employeeName: input.employeeName,
      roleTitle: input.roleTitle,
      department: input.department,
      officeLocation: input.officeLocation,
      neededByDate: input.neededByDate,
      isNewHire: input.isNewHire,
      startDate: input.isNewHire ? input.startDate ?? null : null,
      notes: input.notes ?? "",
      equipmentItems: {
        deleteMany: {},
        create: input.equipmentItems,
      },
      activities: {
        create: [
          { type: "DETAILS_UPDATED", actorUserId: actor.id },
          ...(equipmentChanged
            ? [{ type: "EQUIPMENT_UPDATED" as const, actorUserId: actor.id }]
            : []),
        ],
      },
    },
    include: detailInclude,
  });

  return serializeDetail(request);
}

export async function updateRequestStatus(
  id: number,
  input: StatusUpdateInput,
  actor: User
): Promise<RequestDetailDTO> {
  const existing = await prisma.equipmentRequest.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError(`Request ${formatRequestId(id)} not found`);

  const request = await prisma.equipmentRequest.update({
    where: { id },
    data: {
      status: input.status,
      activities: {
        create: {
          type: "STATUS_CHANGED",
          fromStatus: existing.status,
          toStatus: input.status,
          note: input.note,
          actorUserId: actor.id,
        },
      },
    },
    include: detailInclude,
  });

  return serializeDetail(request);
}

/** Distinct department/role values in use across all requests, powering the
 * filter dropdowns. Both fields are free text, so (unlike office, which is a
 * fixed constant) the set of real-world values can only come from the data
 * itself. */
export async function getRequestFacets(): Promise<{
  departments: string[];
  roles: string[];
}> {
  const [departments, roles] = await Promise.all([
    prisma.equipmentRequest.findMany({
      distinct: ["department"],
      select: { department: true },
      orderBy: { department: "asc" },
    }),
    prisma.equipmentRequest.findMany({
      distinct: ["roleTitle"],
      select: { roleTitle: true },
      orderBy: { roleTitle: "asc" },
    }),
  ]);

  return {
    departments: departments.map((d) => d.department),
    roles: roles.map((r) => r.roleTitle),
  };
}

export async function deleteRequest(id: number): Promise<void> {
  const existing = await prisma.equipmentRequest.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError(`Request ${formatRequestId(id)} not found`);
  await prisma.equipmentRequest.delete({ where: { id } });
}
