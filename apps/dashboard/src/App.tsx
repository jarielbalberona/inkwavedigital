import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "./lib/api";
import type { HealthCheckResponse } from "@inkwave/types";

function App() {
  const { data, isLoading, error } = useQuery<HealthCheckResponse>({
    queryKey: ["health"],
    queryFn: () => api.get("/health"),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Ink Wave Dashboard</h1>
            </div>
            <div>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Merchant Dashboard</h2>
            <p className="text-gray-600">Manage your café orders and menu</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">API Health Check</h3>
            
            {isLoading && (
              <div className="text-purple-600">Checking API connection...</div>
            )}

            {error && (
              <div className="text-red-600">
                ❌ Failed to connect to API
                <div className="text-sm mt-2 text-gray-600">
                  {error instanceof Error ? error.message : "Unknown error"}
                </div>
              </div>
            )}

            {data && (
              <div className="text-green-600">
                ✅ API is {data.status.toUpperCase()}
                <div className="text-sm mt-2 text-gray-600">
                  Last checked: {new Date(data.timestamp).toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>

          <SignedOut>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800">
                ⚠️ Please sign in to access dashboard features
              </p>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-800">
                ✅ You are signed in! Dashboard features coming soon...
              </p>
            </div>
          </SignedIn>

          <div className="text-sm text-gray-500 text-center mt-6">
            Skeleton setup complete. Ready for features! 🚀
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

