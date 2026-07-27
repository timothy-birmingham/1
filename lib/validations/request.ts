import { z } from "zod";

/** Single source of truth for equipment-request validation, used both by
 * React Hook Form on the client and by the API route handlers on the
 * server, so the two can never drift out of sync. */

export const equipmentItemInputSchema = z.object({
  name: z.string().trim().min(1, "Item name is required").max(100),
  quantity: z.coerce.number().int().min(1).max(50),
});

export type EquipmentItemInput = z.infer<typeof equipmentItemInputSchema>;

const baseRequestFields = {
  employeeName: z.string().trim().min(1, "Employee name is required").max(120),
  roleTitle: z.string().trim().min(1, "Role is required").max(120),
  department: z.string().trim().min(1, "Department is required").max(120),
  officeLocation: z.string().trim().min(1, "Office location is required").max(120),
  neededByDate: z.coerce.date({ message: "A valid needed-by date is required" }),
  isNewHire: z.boolean(),
  startDate: z.coerce.date().nullable().optional(),
  notes: z.string().trim().max(2000).optional().default(""),
  equipmentItems: z.array(equipmentItemInputSchema).max(50).default([]),
};

function requireStartDateForNewHire<
  T extends { isNewHire: boolean; startDate?: Date | null }
>(data: T, ctx: z.RefinementCtx) {
  if (data.isNewHire && !data.startDate) {
    ctx.addIssue({
      code: "custom",
      path: ["startDate"],
      message: "Start date is required for new hires",
    });
  }
}

export const createRequestSchema = z
  .object(baseRequestFields)
  .superRefine(requireStartDateForNewHire);

export type CreateRequestInput = z.infer<typeof createRequestSchema>;

export const updateRequestSchema = z
  .object(baseRequestFields)
  .superRefine(requireStartDateForNewHire);

export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;

export const RequestStatusValues = [
  "UNTOUCHED",
  "ORDER_SUBMITTED",
  "IN_TRANSIT",
  "DELIVERED",
] as const;

export const statusUpdateSchema = z.object({
  status: z.enum(RequestStatusValues),
  note: z.string().trim().max(500).optional(),
});

export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;

export const requestListQuerySchema = z.object({
  q: z.string().trim().optional(),
  status: z.enum(RequestStatusValues).optional(),
  department: z.string().trim().optional(),
  office: z.string().trim().optional(),
  role: z.string().trim().optional(),
  sort: z
    .enum([
      "createdAt",
      "neededByDate",
      "employeeName",
      "department",
      "officeLocation",
      "roleTitle",
      "status",
    ])
    .optional()
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type RequestListQuery = z.infer<typeof requestListQuerySchema>;
