import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { setAuthToken } from "../lib/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set the getToken function for the API client
    setAuthToken(getToken);
  }, [getToken]);

  return <>{children}</>;
}

