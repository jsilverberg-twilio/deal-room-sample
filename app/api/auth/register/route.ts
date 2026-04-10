import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  if (!email || !password || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const exists = await prisma.seller.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Email taken" }, { status: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const seller = await prisma.seller.create({
    data: { email, name, passwordHash },
  });
  return NextResponse.json({ id: seller.id, email: seller.email });
}
