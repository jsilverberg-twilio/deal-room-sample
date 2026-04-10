import fs from "fs/promises";
import path from "path";
import { StorageAdapter } from "./index";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export class LocalStorage implements StorageAdapter {
  async upload(file: Buffer, filename: string): Promise<string> {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const key = `${Date.now()}-${filename}`;
    await fs.writeFile(path.join(UPLOAD_DIR, key), file);
    return key;
  }

  getUrl(fileKey: string): string {
    return `/uploads/${fileKey}`;
  }

  async delete(fileKey: string): Promise<void> {
    await fs.unlink(path.join(UPLOAD_DIR, fileKey)).catch(() => {});
  }
}
