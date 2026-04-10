import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; sectionId: string; assetId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, sectionId, assetId } = await params;

  // Verify the room belongs to this seller
  const room = await prisma.room.findFirst({
    where: { id, sellerId: session.user.id },
  });
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.asset.deleteMany({ where: { id: assetId, sectionId } });
  return NextResponse.json({ ok: true });
}
