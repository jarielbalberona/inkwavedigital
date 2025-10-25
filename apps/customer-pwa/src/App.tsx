import { useQuery } from "@tanstack/react-query";
import { api } from "./lib/api";
import type { HealthCheckResponse } from "@inkwave/types";

function App() {
  const { data, isLoading, error } = useQuery<HealthCheckResponse>({
    queryKey: ["health"],
    queryFn: () => api.get("/health"),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Ink Wave Digital</h1>
          <p className="text-lg text-gray-600 mb-8">Customer PWA</p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">API Health Check</h2>
            
            {isLoading && (
              <div className="text-blue-600">Checking API connection...</div>
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

          <div className="text-sm text-gray-500">
            Skeleton setup complete. Ready for features! 🚀
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

