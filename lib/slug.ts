import { prisma } from "./db";

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base);
  let count = 0;
  while (await prisma.room.findUnique({ where: { slug } })) {
    count++;
    slug = `${slugify(base)}-${count}`;
  }
  return slug;
}
