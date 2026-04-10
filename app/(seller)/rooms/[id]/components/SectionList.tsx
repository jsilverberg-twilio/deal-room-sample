"use client";

import { useState } from "react";
import { AssetPicker } from "./AssetPicker";

interface Asset {
  id: string;
  type: string;
  title: string;
  description: string | null;
  url: string | null;
  order: number;
}

interface Section {
  id: string;
  title: string;
  order: number;
  assets: Asset[];
}

interface SectionListProps {
  roomId: string;
  initialSections: Section[];
}

function assetTypeLabel(type: string) {
  switch (type) {
    case "file":
      return { label: "FILE", bg: "bg-gray-600" };
    case "link":
      return { label: "LINK", bg: "bg-blue-700" };
    case "richtext":
      return { label: "NOTE", bg: "bg-yellow-600" };
    default:
      return { label: type.toUpperCase(), bg: "bg-gray-600" };
  }
}

function AssetCard({
  asset,
  roomId,
  sectionId,
  onDeleted,
}: {
  asset: Asset;
  roomId: string;
  sectionId: string;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const { label, bg } = assetTypeLabel(asset.type);

  async function handleDelete() {
    if (!confirm(`Delete "${asset.title}"?`)) return;
    setDeleting(true);
    await fetch(
      `/api/rooms/${roomId}/sections/${sectionId}/assets/${asset.id}`,
      { method: "DELETE" }
    );
    onDeleted();
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-800 bg-gray-900/60 p-3 hover:border-gray-700 hover:bg-gray-800/40 transition">
      {/* Type badge */}
      <span
        className={`inline-flex items-center justify-center rounded px-2 py-1 text-xs font-bold text-white shrink-0 ${bg}`}
      >
        {label}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{asset.title}</p>
        {asset.description && (
          <p className="mt-0.5 text-xs text-gray-500 truncate">
            {asset.description}
          </p>
        )}
        {asset.url && (
          <a
            href={asset.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 block text-xs text-blue-400 hover:text-blue-300 truncate"
          >
            {asset.url}
          </a>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="shrink-0 rounded p-1 text-gray-600 hover:bg-red-900/40 hover:text-red-400 transition disabled:opacity-50"
        title="Delete asset"
      >
        {deleting ? (
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
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

export function SectionList({ roomId, initialSections }: SectionListProps) {
  const [sections, setSections] = useState<Section[]>(
    [...initialSections].sort((a, b) => a.order - b.order)
  );
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [pickerSection, setPickerSection] = useState<string | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  async function reloadSections() {
    const res = await fetch(`/api/rooms/${roomId}`);
    if (res.ok) {
      const room = await res.json();
      setSections(
        [...(room.sections as Section[])].sort((a, b) => a.order - b.order)
      );
    }
  }

  async function addSection(e: React.FormEvent) {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    setLoading((p) => ({ ...p, addSection: true }));
    const res = await fetch(`/api/rooms/${roomId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newSectionTitle.trim() }),
    });
    if (res.ok) {
      setNewSectionTitle("");
      setAddingSection(false);
      await reloadSections();
    }
    setLoading((p) => ({ ...p, addSection: false }));
  }

  async function deleteSection(sectionId: string, title: string) {
    if (!confirm(`Delete section "${title}" and all its assets?`)) return;
    setLoading((p) => ({ ...p, [sectionId]: true }));
    await fetch(`/api/rooms/${roomId}/sections/${sectionId}`, {
      method: "DELETE",
    });
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    setLoading((p) => ({ ...p, [sectionId]: false }));
  }

  async function moveSection(sectionId: string, direction: "up" | "down") {
    const idx = sections.findIndex((s) => s.id === sectionId);
    if (idx === -1) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= sections.length) return;

    const reordered = [...sections];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    const updated = reordered.map((s, i) => ({ ...s, order: i }));
    setSections(updated);

    await fetch(`/api/rooms/${roomId}/sections`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sections: updated.map((s) => ({ id: s.id, order: s.order })),
      }),
    });
  }

  return (
    <div className="space-y-4">
      {sections.length === 0 && !addingSection && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900/40 py-14 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mb-3 h-10 w-10 text-gray-700"
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
          <p className="text-sm text-gray-500">No sections yet</p>
          <p className="mt-0.5 text-xs text-gray-600">
            Add your first section to start organizing content
          </p>
        </div>
      )}

      {sections.map((section, idx) => (
        <div
          key={section.id}
          className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden"
        >
          {/* Section header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-900">
            {/* Up/Down arrows */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                onClick={() => moveSection(section.id, "up")}
                disabled={idx === 0}
                className="rounded p-0.5 text-gray-600 hover:text-gray-300 disabled:opacity-25 disabled:cursor-default transition"
                title="Move section up"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={() => moveSection(section.id, "down")}
                disabled={idx === sections.length - 1}
                className="rounded p-0.5 text-gray-600 hover:text-gray-300 disabled:opacity-25 disabled:cursor-default transition"
                title="Move section down"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Title */}
            <h3 className="flex-1 text-sm font-semibold text-white truncate">
              {section.title}
              <span className="ml-2 text-xs font-normal text-gray-500">
                {section.assets.length} asset
                {section.assets.length !== 1 ? "s" : ""}
              </span>
            </h3>

            {/* Delete section */}
            <button
              onClick={() => deleteSection(section.id, section.title)}
              disabled={loading[section.id]}
              className="shrink-0 rounded p-1.5 text-gray-600 hover:bg-red-900/40 hover:text-red-400 transition disabled:opacity-50"
              title="Delete section"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Assets */}
          <div className="p-4 space-y-2">
            {section.assets.length === 0 && (
              <p className="text-xs text-gray-600 italic py-1">
                No assets yet — add one below
              </p>
            )}
            {section.assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                roomId={roomId}
                sectionId={section.id}
                onDeleted={reloadSections}
              />
            ))}

            {/* Add Asset button */}
            <button
              onClick={() => setPickerSection(section.id)}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-700 px-4 py-2 text-sm text-gray-500 transition hover:border-blue-600 hover:text-blue-400 hover:bg-blue-500/5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Add Asset
            </button>
          </div>
        </div>
      ))}

      {/* Add Section */}
      {addingSection ? (
        <form
          onSubmit={addSection}
          className="flex items-center gap-2 rounded-xl border border-blue-700 bg-gray-900 px-4 py-3"
        >
          <input
            autoFocus
            type="text"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            placeholder="Section title…"
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading.addSection || !newSectionTitle.trim()}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading.addSection ? "Adding…" : "Add"}
          </button>
          <button
            type="button"
            onClick={() => {
              setAddingSection(false);
              setNewSectionTitle("");
            }}
            className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-400 transition hover:text-white"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={() => setAddingSection(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-700 px-4 py-3 text-sm text-gray-500 transition hover:border-blue-600 hover:text-blue-400 hover:bg-blue-500/5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Add Section
        </button>
      )}

      {/* Asset Picker Modal */}
      {pickerSection && (
        <AssetPicker
          roomId={roomId}
          sectionId={pickerSection}
          onClose={() => setPickerSection(null)}
          onSaved={reloadSections}
        />
      )}
    </div>
  );
}
