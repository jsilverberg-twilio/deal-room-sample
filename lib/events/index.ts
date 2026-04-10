// lib/events/index.ts
import { prisma } from "@/lib/db";

type EventAction = "room_viewed" | "asset_viewed" | "asset_downloaded" | "link_clicked";

export async function captureEvent(params: {
  roomId: string;
  assetId?: string;
  visitorId: string;
  action: EventAction;
  ipHash?: string;
  userAgent?: string;
}) {
  return prisma.viewEvent.create({ data: params });
}

export async function getRoomAnalytics(roomId: string) {
  const [totalViews, uniqueVisitors, downloads, lastEvent, recentEvents] =
    await Promise.all([
      prisma.viewEvent.count({ where: { roomId } }),
      prisma.viewEvent.groupBy({
        by: ["visitorId"],
        where: { roomId },
      }),
      prisma.viewEvent.count({
        where: { roomId, action: "asset_downloaded" },
      }),
      prisma.viewEvent.findFirst({
        where: { roomId },
        orderBy: { timestamp: "desc" },
      }),
      prisma.viewEvent.findMany({
        where: { roomId },
        orderBy: { timestamp: "desc" },
        take: 20,
        include: { asset: { select: { title: true } } },
      }),
    ]);

  return {
    totalViews,
    uniqueVisitors: uniqueVisitors.length,
    downloads,
    lastActivity: lastEvent?.timestamp ?? null,
    recentEvents,
  };
}
