"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

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

interface CommunityRoom {
  id: string;
  title: string;
  description: string;
  tags: string[];
  cloneCount: number;
  viewCount: number;
  sellerName: string;
  sectionCount: number;
  assetCount: number;
  createdAt: string;
}

export default function CommunityPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<CommunityRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [cloningId, setCloningId] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (activeTag) params.set("tag", activeTag);
    try {
      const res = await fetch(`/api/community?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } finally {
      setLoading(false);
    }
  }, [search, activeTag]);

  useEffect(() => {
    const timer = setTimeout(fetchRooms, 300);
    return () => clearTimeout(timer);
  }, [fetchRooms]);

  async function handleClone(roomId: string) {
    setCloningId(roomId);
    try {
      const res = await fetch(`/api/community/${roomId}/clone`, {
        method: "POST",
      });
      if (res.ok) {
        const { roomId: newRoomId } = await res.json();
        router.push(`/rooms/${newRoomId}`);
      } else {
        const err = await res.json();
        alert(err.error ?? "Failed to clone room");
      }
    } finally {
      setCloningId(null);
    }
  }

  return (
    <div className="px-6 py-8 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Community Library</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse shared room templates from the community. Clone any room to use as a starting point.
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tag filter pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTag("")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            activeTag === ""
              ? "bg-blue-600 text-white"
              : "border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white"
          }`}
        >
          All
        </button>
        {AVAILABLE_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              activeTag === tag
                ? "bg-blue-600 text-white"
                : "border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <svg
            className="h-6 w-6 animate-spin text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {/* Empty state */}
      {!loading && rooms.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900/40 py-24 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mb-4 h-12 w-12 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p className="text-lg font-medium text-gray-400">No rooms found.</p>
          <p className="mt-1 text-sm text-gray-600">
            {search || activeTag
              ? "Try adjusting your search or filter."
              : "Be the first to share a room to the community!"}
          </p>
        </div>
      )}

      {/* Room cards */}
      {!loading && rooms.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="flex flex-col rounded-xl border border-gray-800 bg-gray-900 p-5 transition hover:border-gray-700 hover:bg-gray-800/60"
            >
              {/* Card header */}
              <div className="mb-3">
                <h2 className="text-base font-semibold text-white leading-snug line-clamp-1">
                  {room.title}
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">by {room.sellerName}</p>
              </div>

              {/* Description */}
              {room.description && (
                <p className="mb-3 text-sm text-gray-400 line-clamp-2">{room.description}</p>
              )}

              {/* Tags */}
              {room.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {room.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-blue-900/40 border border-blue-800/50 px-2 py-0.5 text-xs text-blue-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="mb-4 flex items-center gap-3 text-xs text-gray-500">
                <span>
                  {room.sectionCount} section{room.sectionCount !== 1 ? "s" : ""}
                </span>
                <span className="text-gray-700">·</span>
                <span>
                  {room.assetCount} asset{room.assetCount !== 1 ? "s" : ""}
                </span>
                <span className="text-gray-700">·</span>
                <span>
                  {room.cloneCount} clone{room.cloneCount !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Use as Template button */}
              <div className="mt-auto pt-3 border-t border-gray-800">
                <button
                  onClick={() => handleClone(room.id)}
                  disabled={cloningId === room.id}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cloningId === room.id ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Cloning…
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
                      Use as Template
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
