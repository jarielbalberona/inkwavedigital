import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SessionStore {
  venueId: string | null;
  tableId: string | null;
  deviceId: string;
  setSession: (venueId: string, tableId?: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      venueId: null,
      tableId: null,
      deviceId: crypto.randomUUID(),
      
      setSession: (venueId: string, tableId?: string) => {
        set({ venueId, tableId: tableId || null });
      },
      
      clearSession: () => {
        set({ venueId: null, tableId: null });
      },
    }),
    {
      name: "session-storage",
    }
  )
);
