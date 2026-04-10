"use client";

import { useRef, useState } from "react";

interface BrandingData {
  sellerLogoUrl?: string;
  customerLogoUrl?: string;
  primaryColor?: string;
  companyName?: string;
}

interface Props {
  roomId: string;
  initialBranding: BrandingData;
}

export function BrandingEditor({ roomId, initialBranding }: Props) {
  const [branding, setBranding] = useState<BrandingData>(initialBranding);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sellerFileRef = useRef<HTMLInputElement>(null);
  const customerFileRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    const sellerFile = sellerFileRef.current?.files?.[0];
    const customerFile = customerFileRef.current?.files?.[0];

    const formData = new FormData();
    if (sellerFile) formData.append("sellerLogo", sellerFile);
    if (customerFile) formData.append("customerLogo", customerFile);
    if (branding.primaryColor) formData.append("primaryColor", branding.primaryColor);
    if (branding.companyName !== undefined) formData.append("companyName", branding.companyName ?? "");

    try {
      const res = await fetch(`/api/rooms/${roomId}/branding`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Save failed");
      }
      const updated: BrandingData = await res.json();
      setBranding(updated);
      if (sellerFileRef.current) sellerFileRef.current.value = "";
      if (customerFileRef.current) customerFileRef.current.value = "";
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-500">
        Branding
      </h2>

      <div className="space-y-6">
        {/* Logo row */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Seller logo */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Seller / Company Logo
            </label>
            {branding.sellerLogoUrl && (
              <div className="mb-2 rounded-lg border border-gray-800 bg-gray-950 p-3 flex items-center justify-center h-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={branding.sellerLogoUrl}
                  alt="Seller logo"
                  className="max-h-14 max-w-full object-contain"
                />
              </div>
            )}
            <input
              ref={sellerFileRef}
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-400 file:mr-3 file:rounded-lg file:border file:border-gray-700 file:bg-gray-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-gray-300 file:transition hover:file:border-gray-600 hover:file:bg-gray-700 cursor-pointer"
            />
          </div>

          {/* Customer logo */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Customer Logo
            </label>
            {branding.customerLogoUrl && (
              <div className="mb-2 rounded-lg border border-gray-800 bg-gray-950 p-3 flex items-center justify-center h-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={branding.customerLogoUrl}
                  alt="Customer logo"
                  className="max-h-14 max-w-full object-contain"
                />
              </div>
            )}
            <input
              ref={customerFileRef}
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-400 file:mr-3 file:rounded-lg file:border file:border-gray-700 file:bg-gray-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-gray-300 file:transition hover:file:border-gray-600 hover:file:bg-gray-700 cursor-pointer"
            />
          </div>
        </div>

        {/* Color + company name row */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Accent color */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={branding.primaryColor ?? "#3b82f6"}
                onChange={(e) =>
                  setBranding((prev) => ({ ...prev, primaryColor: e.target.value }))
                }
                className="h-9 w-14 cursor-pointer rounded-lg border border-gray-700 bg-gray-800 p-1"
              />
              <input
                type="text"
                value={branding.primaryColor ?? "#3b82f6"}
                onChange={(e) =>
                  setBranding((prev) => ({ ...prev, primaryColor: e.target.value }))
                }
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="#3b82f6"
                maxLength={9}
              />
            </div>
          </div>

          {/* Company name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Company Name{" "}
              <span className="text-gray-600 font-normal">(overrides &ldquo;Twilio&rdquo;)</span>
            </label>
            <input
              type="text"
              value={branding.companyName ?? ""}
              onChange={(e) =>
                setBranding((prev) => ({ ...prev, companyName: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              placeholder="Twilio"
            />
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            {saving ? "Saving…" : "Save Branding"}
          </button>
          {saved && (
            <span className="text-sm text-green-400">Saved!</span>
          )}
          {error && (
            <span className="text-sm text-red-400">{error}</span>
          )}
        </div>
      </div>
    </div>
  );
}
