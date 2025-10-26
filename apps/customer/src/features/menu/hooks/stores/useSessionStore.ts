import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SessionStore {
  venueId: string | null;
  tableId: string | null;
  deviceId: string;
  pax: number | null;
  setSession: (venueId: string, tableId?: string, deviceId?: string, pax?: number) => void;
  setPax: (pax: number) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      venueId: null,
      tableId: null,
      deviceId: crypto.randomUUID(),
      pax: null,
      
      setSession: (venueId: string, tableId?: string, deviceId?: string, pax?: number) => {
        set({ 
          venueId, 
          tableId: tableId || null,
          deviceId: deviceId || crypto.randomUUID(),
          pax: pax || null
        });
      },
      
      setPax: (pax: number) => {
        set({ pax });
      },
      
      clearSession: () => {
        set({ venueId: null, tableId: null, pax: null });
      },
    }),
    {
      name: "session-storage",
    }
  )
);
