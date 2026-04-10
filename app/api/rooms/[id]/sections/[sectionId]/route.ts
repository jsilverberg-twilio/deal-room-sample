import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, sectionId } = await params;

  // Verify the room belongs to this seller
  const room = await prisma.room.findFirst({
    where: { id, sellerId: session.user.id },
  });
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.section.deleteMany({ where: { id: sectionId, roomId: id } });
  return NextResponse.json({ ok: true });
}
