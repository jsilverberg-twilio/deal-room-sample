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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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

  const inputCls = "w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition";

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link href="/dashboard" className="hover:text-slate-600 transition">Dashboard</Link>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
        </svg>
        <span className="text-slate-500">New Room</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create a new room</h1>
        <p className="mt-1 text-sm text-slate-500">Set up a digital asset room for your customer.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
            Room name <span className="text-red-500">*</span>
          </label>
          <input
            id="name" name="name" type="text" required
            value={form.name} onChange={handleChange}
            placeholder="e.g. Q3 Business Review"
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="customerName" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
            Customer name <span className="text-red-500">*</span>
          </label>
          <input
            id="customerName" name="customerName" type="text" required
            value={form.customerName} onChange={handleChange}
            placeholder="e.g. Acme Corp"
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
            Description <span className="font-normal normal-case text-slate-400">(optional)</span>
          </label>
          <textarea
            id="description" name="description" rows={3}
            value={form.description} onChange={handleChange}
            placeholder="A brief description of this room"
            className={`${inputCls} resize-none`}
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
            Custom URL slug <span className="font-normal normal-case text-slate-400">(optional)</span>
          </label>
          <div className="flex items-center">
            <span className="flex items-center rounded-l-lg border border-r-0 border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-400 select-none">
              yoursite.com/
            </span>
            <input
              id="slug" name="slug" type="text"
              value={form.slug} onChange={handleChange}
              placeholder="acme-corp-q3"
              pattern="[a-z0-9-]+"
              className="flex-1 rounded-r-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition"
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-400">Lowercase letters, numbers, and hyphens only. Leave blank to auto-generate.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating…
              </>
            ) : "Create Room"}
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
