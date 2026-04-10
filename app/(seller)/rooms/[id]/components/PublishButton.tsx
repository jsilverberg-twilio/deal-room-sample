"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PublishButtonProps {
  roomId: string;
  status: string;
  shareUrl: string;
}

export function PublishButton({ roomId, status, shareUrl }: PublishButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPublished = status === "published";

  async function togglePublish() {
    setLoading(true);
    const newStatus = isPublished ? "draft" : "published";
    await fetch(`/api/rooms/${roomId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text in a temporary input
    }
  }

  if (isPublished) {
    return (
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <button
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-2 text-sm font-medium text-gray-300 transition hover:border-gray-600 hover:text-white"
        >
          {copied ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 text-green-400"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
              </svg>
              Copy Link
            </>
          )}
        </button>
        <button
          onClick={togglePublish}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-yellow-800 px-3 py-2 text-sm font-medium text-yellow-400 transition hover:border-yellow-700 hover:bg-yellow-900/30 disabled:opacity-50"
        >
          {loading ? (
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
              Updating…
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06L3.28 2.22zM10.22 5.22a.75.75 0 011.06 0l2.22 2.22A3.75 3.75 0 0116 10.5c0 .332-.043.652-.12.96l-1.56-1.56A2.251 2.251 0 0012.25 8a2.25 2.25 0 00-2.25 2.25c0 .166.018.328.053.485L8.5 9.181A3.75 3.75 0 0110.22 5.22zM3 10.5a3.75 3.75 0 003.75 3.75h.75a.75.75 0 000-1.5H6.75A2.25 2.25 0 014.5 10.5c0-.166.018-.328.053-.485l-1.53-1.53A3.728 3.728 0 003 10.5z"
                  clipRule="evenodd"
                />
              </svg>
              Unpublish
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={togglePublish}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
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
          Publishing…
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
            <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
          </svg>
          Publish Room
        </>
      )}
    </button>
  );
}
