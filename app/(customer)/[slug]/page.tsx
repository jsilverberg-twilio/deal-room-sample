import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { RoomTracker, AssetTrackerButton } from "./tracker";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Asset type icon/label helper
function AssetTypeIcon({ type, metadata }: { type: string; metadata: string }) {
  let parsedMeta: { mimeType?: string; fileName?: string } = {};
  try {
    parsedMeta = JSON.parse(metadata ?? "{}");
  } catch {}

  if (type === "file") {
    const ext = parsedMeta.fileName?.split(".").pop()?.toUpperCase() ?? "FILE";
    const colorMap: Record<string, string> = {
      PDF: "bg-red-600",
      PPTX: "bg-orange-500",
      PPT: "bg-orange-500",
      DOCX: "bg-blue-600",
      DOC: "bg-blue-600",
      XLSX: "bg-green-600",
      XLS: "bg-green-600",
      MP4: "bg-purple-600",
      MOV: "bg-purple-600",
    };
    const color = colorMap[ext] ?? "bg-gray-600";
    return (
      <span
        className={`inline-flex items-center justify-center rounded px-2 py-1 text-xs font-bold text-white ${color}`}
      >
        {ext.length > 5 ? ext.slice(0, 4) : ext}
      </span>
    );
  }

  if (type === "link") {
    return (
      <span className="inline-flex items-center justify-center rounded bg-blue-700 px-2 py-1 text-xs font-bold text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-3.5 w-3.5 mr-1"
        >
          <path
            fillRule="evenodd"
            d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
            clipRule="evenodd"
          />
        </svg>
        LINK
      </span>
    );
  }

  if (type === "richtext") {
    return (
      <span className="inline-flex items-center justify-center rounded bg-yellow-600 px-2 py-1 text-xs font-bold text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-3.5 w-3.5 mr-1"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
        NOTE
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center rounded bg-gray-600 px-2 py-1 text-xs font-bold text-white">
      FILE
    </span>
  );
}

export default async function CustomerPortalPage({ params }: PageProps) {
  const { slug } = await params;

  const room = await prisma.room.findUnique({
    where: { slug },
    include: {
      seller: true,
      sections: {
        orderBy: { order: "asc" },
        include: {
          assets: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!room || room.status !== "published") {
    notFound();
  }

  const { seller, sections } = room;

  let branding: {
    sellerLogoUrl?: string;
    customerLogoUrl?: string;
    primaryColor?: string;
    companyName?: string;
  } = {};
  try {
    branding = JSON.parse(room.branding ?? "{}");
  } catch {
    branding = {};
  }

  const brandColor = branding.primaryColor ?? "#3b82f6";
  const companyLabel = branding.companyName || "Twilio";

  return (
    <div
      className="min-h-screen bg-gray-950 text-gray-100"
      style={{ "--brand-color": brandColor } as React.CSSProperties}
    >
      <RoomTracker roomId={room.id} />

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-6">
          {/* Logo area */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Seller logo / company name */}
            {branding.sellerLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={branding.sellerLogoUrl}
                alt={companyLabel}
                className="h-9 w-auto max-w-[140px] object-contain"
              />
            ) : (
              <span className="text-base font-semibold text-white">{companyLabel}</span>
            )}

            {/* Divider + customer logo */}
            {branding.customerLogoUrl && (
              <>
                <span className="h-8 w-px bg-gray-700 shrink-0" aria-hidden />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={branding.customerLogoUrl}
                  alt={room.customerName}
                  className="h-9 w-auto max-w-[140px] object-contain"
                />
              </>
            )}
          </div>

          {/* Room title + subtitle */}
          <div className="min-w-0 text-right">
            <h1 className="text-base font-semibold text-white truncate">{room.name}</h1>
            <p className="mt-0.5 text-xs text-gray-400 truncate">
              Prepared for{" "}
              <span className="text-gray-200">{room.customerName}</span>
              {" · "}by {seller.name}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl flex gap-0 min-h-[calc(100vh-69px)]">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 border-r border-gray-800 bg-gray-900/50 p-6 flex flex-col">
          <nav className="flex-1">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Contents
            </p>
            <ul className="space-y-1">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#section-${section.id}`}
                    className="block rounded-md px-3 py-2 text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white"
                    style={{ "--brand-color": brandColor } as React.CSSProperties}
                  >
                    {section.title}
                    <span className="ml-2 text-xs text-gray-500">
                      {section.assets.length}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Seller contact */}
          <div className="mt-6 border-t border-gray-800 pt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Your Rep
            </p>
            <div className="flex items-center gap-3">
              {seller.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={seller.avatarUrl}
                  alt={seller.name}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: brandColor }}
                >
                  {seller.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {seller.name}
                </p>
                <a
                  href={`mailto:${seller.email}`}
                  className="truncate text-xs hover:opacity-80 transition-opacity"
                  style={{ color: brandColor }}
                >
                  {seller.email}
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {room.description && (
            <p className="mb-8 text-gray-400 text-sm leading-relaxed max-w-2xl">
              {room.description}
            </p>
          )}

          {sections.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-4 h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm">No content yet</p>
            </div>
          )}

          {sections.map((section) => (
            <section key={section.id} id={`section-${section.id}`} className="mb-12">
              <h2 className="mb-4 text-lg font-semibold text-white border-b border-gray-800 pb-3">
                {section.title}
              </h2>

              {section.assets.length === 0 && (
                <p className="text-sm text-gray-600 italic">No assets in this section</p>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.assets.map((asset) => {
                  const isLink = asset.type === "link";
                  const isFile = asset.type === "file";
                  const hasAction = isLink || isFile;
                  const actionLabel = isLink
                    ? "Open Link"
                    : isFile
                    ? "View File"
                    : "Read Note";
                  const actionHref = asset.url ?? undefined;
                  const trackAction: "asset_viewed" | "link_clicked" = isLink
                    ? "link_clicked"
                    : "asset_viewed";

                  return (
                    <div
                      key={asset.id}
                      className="flex flex-col rounded-xl border border-gray-800 bg-gray-900 p-5 transition hover:border-gray-700 hover:bg-gray-800/60"
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <AssetTypeIcon type={asset.type} metadata={asset.metadata} />
                      </div>

                      <h3 className="mb-1.5 font-medium text-white leading-snug">
                        {asset.title}
                      </h3>

                      {asset.description && (
                        <p className="mb-4 text-sm text-gray-400 leading-relaxed flex-1">
                          {asset.description}
                        </p>
                      )}

                      {!asset.description && <div className="flex-1" />}

                      {hasAction && (
                        <div className="mt-4 pt-3 border-t border-gray-800">
                          <AssetTrackerButton
                            roomId={room.id}
                            assetId={asset.id}
                            action={trackAction}
                            href={actionHref}
                            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900"
                            style={{ backgroundColor: brandColor }}
                          >
                            {isLink ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="h-4 w-4"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                                  clipRule="evenodd"
                                />
                                <path
                                  fillRule="evenodd"
                                  d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="h-4 w-4"
                              >
                                <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                                <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                              </svg>
                            )}
                            {actionLabel}
                          </AssetTrackerButton>
                        </div>
                      )}

                      {asset.type === "richtext" && asset.description && (
                        <div className="mt-4 pt-3 border-t border-gray-800">
                          <span className="text-xs text-gray-500 italic">Rich note</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
