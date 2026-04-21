import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; sectionId: string; assetId: string }> }
) {
  const user = await getCurrentUser();
  const { id, sectionId, assetId } = await params;
  const room = await prisma.room.findFirst({ where: { id, sellerId: user.id } });
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const order = body?.order;
  if (typeof order !== "number") {
    return NextResponse.json({ error: "order must be a number" }, { status: 400 });
  }
  await prisma.asset.updateMany({ where: { id: assetId, sectionId }, data: { order } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; sectionId: string; assetId: string }> }
) {
  const user = await getCurrentUser();
  const { id, sectionId, assetId } = await params;
  const room = await prisma.room.findFirst({ where: { id, sellerId: user.id } });
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.asset.deleteMany({ where: { id: assetId, sectionId } });
  return NextResponse.json({ ok: true });
}
