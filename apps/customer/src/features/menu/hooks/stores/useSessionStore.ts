import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SessionStore {
  venueId: string | null;
  tableId: string | null;
  tableLabel: string | null;
  deviceId: string;
  pax: number | null;
  sessionStartedAt: string | null;
  setSession: (venueId: string, tableId?: string, deviceId?: string, pax?: number, tableLabel?: string) => void;
  setPax: (pax: number) => void;
  clearSession: () => void;
  resetDeviceId: () => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      venueId: null,
      tableId: null,
      tableLabel: null,
      deviceId: crypto.randomUUID(),
      pax: null,
      sessionStartedAt: null,
      
      setSession: (venueId: string, tableId?: string, deviceId?: string, pax?: number, tableLabel?: string) => {
        set({ 
          venueId, 
          tableId: tableId || null,
          deviceId: deviceId || crypto.randomUUID(),
          pax: pax || null,
          tableLabel: tableLabel || null,
          sessionStartedAt: new Date().toISOString(),
        });
      },
      
      setPax: (pax: number) => {
        set({ pax });
      },
      
      clearSession: () => {
        set({ venueId: null, tableId: null, pax: null, tableLabel: null });
        // Note: deviceId and sessionStartedAt are preserved for order tracking
      },
      
      resetDeviceId: () => {
        set({ deviceId: crypto.randomUUID(), sessionStartedAt: new Date().toISOString() });
      },
    }),
    {
      name: "session-storage",
    }
  )
);
