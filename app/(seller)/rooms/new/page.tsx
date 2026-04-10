"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewRoomPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    customerName: "",
    description: "",
    slug: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const body: Record<string, string> = {
        name: form.name,
        customerName: form.customerName,
      };
      if (form.description.trim()) body.description = form.description.trim();
      if (form.slug.trim()) body.slug = form.slug.trim();

      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create room");
      }

      const room = await res.json();
      router.push(`/rooms/${room.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="px-6 py-8 mx-auto max-w-2xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link
          href="/dashboard"
          className="hover:text-gray-300 transition"
        >
          Dashboard
        </Link>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-gray-300">New Room</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Create a new room</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set up a digital asset room for your customer.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Room Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Room name <span className="text-red-400">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Q1 2025 Proposal"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          />
        </div>

        {/* Customer Name */}
        <div>
          <label
            htmlFor="customerName"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Customer name <span className="text-red-400">*</span>
          </label>
          <input
            id="customerName"
            name="customerName"
            type="text"
            required
            value={form.customerName}
            onChange={handleChange}
            placeholder="e.g. Acme Corp"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Description{" "}
            <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
            placeholder="A brief description shown to the customer"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"
          />
        </div>

        {/* Slug Override */}
        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Custom URL slug{" "}
            <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <div className="flex items-center gap-0">
            <span className="flex items-center rounded-l-lg border border-r-0 border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-gray-500 select-none">
              /r/
            </span>
            <input
              id="slug"
              name="slug"
              type="text"
              value={form.slug}
              onChange={handleChange}
              placeholder="acme-corp-q1"
              pattern="[a-z0-9-]+"
              className="flex-1 rounded-r-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-600">
            Lowercase letters, numbers, and hyphens only. Leave blank to
            auto-generate.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
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
                Creating…
              </>
            ) : (
              "Create Room"
            )}
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-400 transition hover:border-gray-600 hover:text-white"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
