import React from "react";
import { MenuPage } from "./features/menu/components/MenuPage";
import { useSessionStore } from "./features/menu/hooks/stores/useSessionStore";

function App() {
  const { venueId } = useSessionStore();

  // For demo purposes, set a default venue ID
  React.useEffect(() => {
    if (!venueId) {
      // Use the demo venue ID from our seed data
      useSessionStore.getState().setSession("9662b039-7056-436d-b336-63fa662412e3");
    }
  }, [venueId]);

  return <MenuPage />;
}

export default App;

