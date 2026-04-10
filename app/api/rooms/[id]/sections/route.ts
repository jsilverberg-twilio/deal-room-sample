import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const room = await prisma.room.findFirst({ where: { id, sellerId: session.user.id } });
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { title } = await req.json();
  const maxOrder = await prisma.section.aggregate({ where: { roomId: id }, _max: { order: true } });
  const section = await prisma.section.create({
    data: { roomId: id, title, order: (maxOrder._max.order ?? -1) + 1 },
  });
  return NextResponse.json(section);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const room = await prisma.room.findFirst({ where: { id, sellerId: session.user.id } });
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { sections } = await req.json(); // [{id, order}]
  await Promise.all(
    sections.map((s: { id: string; order: number }) =>
      prisma.section.update({ where: { id: s.id }, data: { order: s.order } })
    )
  );
  return NextResponse.json({ ok: true });
}
