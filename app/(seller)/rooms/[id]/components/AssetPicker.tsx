"use client";

import { useState, useRef, useCallback } from "react";

type Tab = "file" | "link" | "note" | "twilio" | "demo";

interface AssetPickerProps {
  roomId: string;
  sectionId: string;
  onClose: () => void;
  onSaved: () => void;
}

export function AssetPicker({
  roomId,
  sectionId,
  onClose,
  onSaved,
}: AssetPickerProps) {
  const [tab, setTab] = useState<Tab>("file");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // File tab state
  const [file, setFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState("");
  const [fileDescription, setFileDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Link tab state
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkDescription, setLinkDescription] = useState("");

  // Note tab state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      if (!fileTitle) setFileTitle(dropped.name.replace(/\.[^.]+$/, ""));
    }
  }, [fileTitle]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const fd = new FormData();

      if (tab === "file") {
        if (!file) throw new Error("Please select a file.");
        if (!fileTitle.trim()) throw new Error("Please enter a title.");
        fd.append("type", "file");
        fd.append("title", fileTitle.trim());
        fd.append("description", fileDescription.trim());
        fd.append("file", file);
      } else if (tab === "link") {
        if (!linkUrl.trim()) throw new Error("Please enter a URL.");
        if (!linkTitle.trim()) throw new Error("Please enter a title.");
        fd.append("type", "link");
        fd.append("title", linkTitle.trim());
        fd.append("description", linkDescription.trim());
        fd.append("url", linkUrl.trim());
      } else if (tab === "note") {
        if (!noteTitle.trim()) throw new Error("Please enter a title.");
        fd.append("type", "richtext");
        fd.append("title", noteTitle.trim());
        fd.append("content", noteContent.trim());
      }

      const res = await fetch(
        `/api/rooms/${roomId}/sections/${sectionId}/assets`,
        { method: "POST", body: fd }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save asset");
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  const tabs: { id: Tab; label: string; disabled?: boolean }[] = [
    { id: "file", label: "Upload File" },
    { id: "link", label: "Add Link" },
    { id: "note", label: "Write Note" },
    { id: "twilio", label: "Twilio Docs", disabled: true },
    { id: "demo", label: "Live Demo", disabled: true },
  ];

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-xl border border-gray-700 bg-gray-900 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-800 shrink-0">
          <h2 className="text-base font-semibold text-white">Add Asset</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-0 border-b border-gray-800 px-5 shrink-0 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => !t.disabled && setTab(t.id)}
              disabled={t.disabled}
              className={`relative shrink-0 px-3 py-2.5 text-sm font-medium transition
                ${
                  t.disabled
                    ? "cursor-not-allowed text-gray-600"
                    : tab === t.id
                    ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500"
                    : "text-gray-400 hover:text-gray-200"
                }`}
            >
              {t.label}
              {t.disabled && (
                <span className="ml-1.5 rounded-full bg-gray-800 px-1.5 py-0.5 text-xs text-gray-500">
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <form id="asset-form" onSubmit={handleSubmit}>
            {/* Upload File Tab */}
            {tab === "file" && (
              <div className="space-y-4">
                {/* Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 cursor-pointer transition
                    ${
                      dragOver
                        ? "border-blue-500 bg-blue-500/10"
                        : file
                        ? "border-green-700 bg-green-900/20"
                        : "border-gray-700 bg-gray-800/40 hover:border-gray-600 hover:bg-gray-800/60"
                    }`}
                >
                  {file ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-8 w-8 text-green-400 mb-2"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm font-medium text-green-400 text-center truncate max-w-xs">
                        {file.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {(file.size / 1024).toFixed(0)} KB — click to replace
                      </p>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-8 w-8 text-gray-500 mb-2"
                      >
                        <path d="M9.25 13.25a.75.75 0 001.5 0V4.636l2.955 3.129a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25 4.5a.75.75 0 101.09 1.03L9.25 4.636v8.614z" />
                        <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-300">
                        Drop a file or click to browse
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        PDF, PPTX, DOCX, images, videos, and more
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setFile(f);
                      if (!fileTitle)
                        setFileTitle(f.name.replace(/\.[^.]+$/, ""));
                    }
                  }}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fileTitle}
                    onChange={(e) => setFileTitle(e.target.value)}
                    placeholder="e.g. Product Overview Deck"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Description{" "}
                    <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={fileDescription}
                    onChange={(e) => setFileDescription(e.target.value)}
                    placeholder="Short description for the customer"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"
                  />
                </div>
              </div>
            )}

            {/* Add Link Tab */}
            {tab === "link" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    placeholder="e.g. Pricing Page"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Description{" "}
                    <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={linkDescription}
                    onChange={(e) => setLinkDescription(e.target.value)}
                    placeholder="What will the customer find here?"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"
                  />
                </div>
              </div>
            )}

            {/* Write Note Tab */}
            {tab === "note" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="e.g. Welcome Message"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Content
                  </label>
                  <textarea
                    rows={6}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write your note here…"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"
                  />
                </div>
              </div>
            )}

            {/* Disabled tabs fallback */}
            {(tab === "twilio" || tab === "demo") && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-700 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <p className="text-base font-medium text-gray-500">Coming Soon</p>
                <p className="mt-1 text-sm text-gray-600">
                  This feature is under development.
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 px-5 py-4 shrink-0 flex items-center justify-between gap-3">
          {error && (
            <p className="text-sm text-red-400 flex-1 truncate">{error}</p>
          )}
          {!error && <div className="flex-1" />}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-400 transition hover:border-gray-600 hover:text-white"
            >
              Cancel
            </button>
            {tab !== "twilio" && tab !== "demo" && (
              <button
                type="submit"
                form="asset-form"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Saving…
                  </>
                ) : (
                  "Save Asset"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
