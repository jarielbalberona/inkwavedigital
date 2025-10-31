import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SessionStore {
  venueId: string | null;
  tableId: string | null;
  tableLabel: string | null;
  deviceId: string;
  pax: number | null;
  isToGo: boolean | null;
  sessionStartedAt: string | null;
  setSession: (venueId: string, tableId?: string, deviceId?: string, pax?: number, tableLabel?: string, isToGo?: boolean) => void;
  setPax: (pax: number) => void;
  setIsToGo: (isToGo: boolean) => void;
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
      isToGo: null,
      sessionStartedAt: null,
      
      setSession: (venueId: string, tableId?: string, deviceId?: string, pax?: number, tableLabel?: string, isToGo?: boolean) => {
        set({ 
          venueId, 
          tableId: tableId || null,
          deviceId: deviceId || crypto.randomUUID(),
          pax: pax || null,
          tableLabel: tableLabel || null,
          isToGo: isToGo ?? null,
          sessionStartedAt: new Date().toISOString(),
        });
      },
      
      setPax: (pax: number) => {
        set({ pax });
      },

      setIsToGo: (isToGo: boolean) => {
        set({ isToGo });
      },
      
      clearSession: () => {
        set({ venueId: null, tableId: null, pax: null, isToGo: null, tableLabel: null });
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
