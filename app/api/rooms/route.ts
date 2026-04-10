import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rooms = await prisma.room.findMany({
    where: { sellerId: session.user.id },
    include: { sections: { include: { assets: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(rooms);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, customerName, description, slug: customSlug } = await req.json();
  if (!name || !customerName) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const slug = customSlug ? customSlug : await uniqueSlug(customerName);
  const room = await prisma.room.create({
    data: { name, customerName, description, slug, sellerId: session.user.id },
  });
  return NextResponse.json(room);
}
