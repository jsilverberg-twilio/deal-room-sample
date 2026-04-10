export interface AssetOption {
  title: string;
  description?: string;
  type: "file" | "link" | "richtext";
  url?: string;
  fileKey?: string;
  metadata?: Record<string, unknown>;
}

export interface AssetAdapter {
  sourceType: string;
  displayName: string;
  enabled: boolean;
}
