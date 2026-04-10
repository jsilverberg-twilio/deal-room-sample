export interface StorageAdapter {
  upload(file: Buffer, filename: string): Promise<string>; // returns fileKey
  getUrl(fileKey: string): string;
  delete(fileKey: string): Promise<void>;
}

export { LocalStorage } from "./local";
