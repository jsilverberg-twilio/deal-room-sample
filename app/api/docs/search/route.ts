import { NextResponse } from "next/server";
import catalog from "@/lib/twilio-docs-catalog.json";

type CatalogEntry = { url: string; title: string; category: string };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";

  if (!q) return NextResponse.json([]);

  const terms = q.split(/\s+/).filter(Boolean);

  const results = (catalog as CatalogEntry[])
    .filter((entry) => {
      const haystack = `${entry.title} ${entry.category} ${entry.url}`.toLowerCase();
      return terms.every((t) => haystack.includes(t));
    })
    .slice(0, 12)
    .map((entry) => ({
      title: entry.title,
      url: entry.url,
      category: entry.category,
      description: "",
    }));

  return NextResponse.json(results);
}
