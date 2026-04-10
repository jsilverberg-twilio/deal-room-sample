"use client";

import { useState, useRef, useEffect } from "react";

const AVAILABLE_TAGS = [
  "Contact Center",
  "CPaaS",
  "Messaging",
  "Video",
  "Voice",
  "Email",
  "Verification",
  "IoT",
];

interface ShareToCommunityProps {
  roomId: string;
  roomName: string;
}

export function ShareToCommunity({ roomId, roomName }: ShareToCommunityProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(roomName);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  function handleClose() {
    if (loading) return;
    setOpen(false);
    // Reset form on close (but keep success visible briefly)
    if (!success) {
      setError("");
    }
  }

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, title: title.trim(), description: description.trim(), tags }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to share room.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setSuccess(false);
          setError("");
          setTitle(roomName);
          setDescription("");
          setTags([]);
          setTagInput("");
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-2 text-sm font-medium text-gray-300 transition hover:border-gray-600 hover:text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.341l-6.733-3.367a2.5 2.5 0 110-3.474l6.733-3.367A2.5 2.5 0 0113 4.5z" />
        </svg>
        Share to Community
      </button>

      <dialog
        ref={dialogRef}
        onClose={handleClose}
        className="w-full max-w-lg rounded-xl border border-gray-700 bg-gray-900 p-0 text-white backdrop:bg-black/60 open:flex open:flex-col"
        style={{ margin: "auto" }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <h2 className="text-base font-semibold text-white">Share to Community</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="rounded-md p-1 text-gray-500 transition hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {success ? (
          /* Success state */
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-900/50 border border-green-700">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6 text-green-400">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-white">Shared to community!</p>
              <p className="mt-1 text-sm text-gray-400">Your room is now visible in the Community Library.</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-gray-600 hover:text-white"
            >
              Close
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-5">
            {/* Warning banner */}
            <div className="flex items-start gap-3 rounded-lg border border-yellow-800/60 bg-yellow-900/20 px-4 py-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 text-yellow-400 shrink-0">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-yellow-300">
                Customer-specific info (name, notes) will be stripped. Only structure and assets are shared.
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400" htmlFor="community-title">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="community-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Give your template a descriptive title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400" htmlFor="community-description">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="community-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                placeholder="Describe what this template is useful for..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">
                Tags
              </label>
              {/* Quick-select pills */}
              <div className="mb-2 flex flex-wrap gap-1.5">
                {AVAILABLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
                      tags.includes(tag)
                        ? "bg-blue-600 text-white"
                        : "border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {/* Custom tag input */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-900/60 border border-blue-800/50 px-2 py-0.5 text-xs text-blue-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-400 hover:text-white transition"
                      aria-label={`Remove ${tag}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                        <path d="M5.28 4.22a.75.75 0 00-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 101.06 1.06L8 9.06l2.72 2.72a.75.75 0 101.06-1.06L9.06 8l2.72-2.72a.75.75 0 00-1.06-1.06L8 6.94 5.28 4.22z" />
                      </svg>
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={tags.length === 0 ? "Type a tag and press Enter..." : ""}
                  className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
                />
              </div>
              <p className="mt-1 text-xs text-gray-600">Press Enter or comma to add a custom tag.</p>
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-lg border border-red-800/60 bg-red-900/20 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-800 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-gray-600 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sharing…
                  </>
                ) : (
                  "Share to Community"
                )}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
