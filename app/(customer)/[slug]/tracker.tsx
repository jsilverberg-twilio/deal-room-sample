"use client";

import { useEffect } from "react";

interface TrackerProps {
  roomId: string;
}

export function RoomTracker({ roomId }: TrackerProps) {
  useEffect(() => {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, action: "room_viewed" }),
    }).catch(() => {});
  }, [roomId]);

  return null;
}

interface AssetTrackerButtonProps {
  roomId: string;
  assetId: string;
  action: "asset_viewed" | "link_clicked";
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function AssetTrackerButton({
  roomId,
  assetId,
  action,
  href,
  className,
  style,
  children,
}: AssetTrackerButtonProps) {
  const handleClick = async () => {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, assetId, action }),
    }).catch(() => {});
    if (href) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button onClick={handleClick} className={className} style={style}>
      {children}
    </button>
  );
}
