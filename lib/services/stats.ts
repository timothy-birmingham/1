import "server-only";
import { prisma } from "@/lib/prisma";
import { formatRequestId, STATUS_ORDER } from "@/lib/format";
import type { DashboardStatsDTO } from "@/lib/types";

export async function getDashboardStats(): Promise<DashboardStatsDTO> {
  const [totalCount, statusGroups, recentActivity] = await Promise.all([
    prisma.equipmentRequest.count(),
    prisma.equipmentRequest.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.requestActivity.findMany({
      include: {
        actor: { select: { id: true, name: true, role: true } },
        request: { select: { id: true, employeeName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const statusCounts = Object.fromEntries(
    STATUS_ORDER.map((status) => [
      status,
      statusGroups.find((group) => group.status === status)?._count._all ?? 0,
    ])
  ) as DashboardStatsDTO["statusCounts"];

  return {
    totalCount,
    statusCounts,
    recentActivity: recentActivity.map((activity) => ({
      id: activity.id,
      type: activity.type,
      fromStatus: activity.fromStatus,
      toStatus: activity.toStatus,
      note: activity.note,
      createdAt: activity.createdAt.toISOString(),
      actor: activity.actor,
      requestId: activity.request.id,
      requestNumber: formatRequestId(activity.request.id),
      employeeName: activity.request.employeeName,
    })),
  };
}
