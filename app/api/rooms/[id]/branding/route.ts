import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LocalStorage } from "@/lib/storage";

const storage = new LocalStorage();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify ownership
  const room = await prisma.room.findFirst({
    where: { id, sellerId: session.user.id },
    select: { id: true, branding: true },
  });
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await req.formData();

  // Parse existing branding
  let existing: Record<string, string> = {};
  try {
    existing = JSON.parse(room.branding ?? "{}");
  } catch {
    existing = {};
  }

  const merged = { ...existing };

  // Upload seller logo
  const sellerFile = formData.get("sellerLogo");
  if (sellerFile instanceof File && sellerFile.size > 0) {
    const buffer = Buffer.from(await sellerFile.arrayBuffer());
    const key = await storage.upload(buffer, sellerFile.name);
    merged.sellerLogoUrl = storage.getUrl(key);
  }

  // Upload customer logo
  const customerFile = formData.get("customerLogo");
  if (customerFile instanceof File && customerFile.size > 0) {
    const buffer = Buffer.from(await customerFile.arrayBuffer());
    const key = await storage.upload(buffer, customerFile.name);
    merged.customerLogoUrl = storage.getUrl(key);
  }

  // Text fields
  const primaryColor = formData.get("primaryColor");
  if (typeof primaryColor === "string") merged.primaryColor = primaryColor;

  const companyName = formData.get("companyName");
  if (typeof companyName === "string") merged.companyName = companyName;

  const brandingJson = JSON.stringify(merged);

  await prisma.room.updateMany({
    where: { id, sellerId: session.user.id },
    data: { branding: brandingJson },
  });

  return NextResponse.json(merged);
}
