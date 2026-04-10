import { NextResponse } from "next/server";
import { captureEvent } from "@/lib/events";
import { cookies } from "next/headers";
import { createId } from "@paralleldrive/cuid2";

export async function POST(req: Request) {
  const { roomId, assetId, action } = await req.json();
  const cookieStore = await cookies();
  let visitorId = cookieStore.get("visitor_id")?.value;
  if (!visitorId) {
    visitorId = createId();
  }
  const userAgent = req.headers.get("user-agent") ?? undefined;
  await captureEvent({ roomId, assetId, visitorId, action, userAgent });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("visitor_id", visitorId, { maxAge: 60 * 60 * 24 * 365, httpOnly: true });
  return res;
}
