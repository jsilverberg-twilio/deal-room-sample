"use client";

import { createContext, useContext, useState } from "react";

export interface Asset {
  id: string;
  type: string;
  title: string;
  description: string | null;
  url: string | null;
  metadata: string;
  order: number;
}

export interface Section {
  id: string;
  title: string;
  order: number;
  assets: Asset[];
}

interface RoomContextValue {
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  reloadSections: () => Promise<void>;
  roomId: string;
}

const RoomContext = createContext<RoomContextValue | null>(null);

export function RoomProvider({
  roomId,
  initialSections,
  children,
}: {
  roomId: string;
  initialSections: Section[];
  children: React.ReactNode;
}) {
  const [sections, setSections] = useState<Section[]>(
    [...initialSections].sort((a, b) => a.order - b.order)
  );

  async function reloadSections() {
    const res = await fetch(`/api/rooms/${roomId}`);
    if (res.ok) {
      const room = await res.json();
      setSections(
        [...(room.sections as Section[])].sort((a, b) => a.order - b.order)
      );
    }
  }

  return (
    <RoomContext.Provider value={{ sections, setSections, reloadSections, roomId }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used inside RoomProvider");
  return ctx;
}
