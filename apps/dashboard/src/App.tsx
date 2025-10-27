import React, { useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { KDSPage } from "./features/kds/components/KDSPage";
import { MenuManagementPage } from "./features/menu-management/components/MenuManagementPage";
import { QRManagementPage } from "./features/qr-management/components/QRManagementPage";
import { TenantManagementPage } from "./features/admin/components/TenantManagementPage";
import { VenueManagementPage } from "./features/venue-management/components/VenueManagementPage";
import { useSuperAdmin } from "./hooks/useSuperAdmin";
import { useUserRole } from "./hooks/useUserRole";
import { VenueSelector } from "./components/VenueSelector";
import { 
  QueueListIcon, 
  Cog6ToothIcon, 
  QrCodeIcon,
  BuildingOfficeIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

type DashboardPage = "venues" | "kds" | "menu" | "qr" | "admin";

function App() {
  const { isSuperAdmin, isLoading: isCheckingSuperAdmin } = useSuperAdmin();
  const { role, assignedVenueIds, isLoading: isCheckingUserRole } = useUserRole();
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  
  // Default page based on role
  const defaultPage = isSuperAdmin ? "admin" : "venues";
  const [currentPage, setCurrentPage] = useState<DashboardPage>(defaultPage);

  // Update default page when role is determined
  React.useEffect(() => {
    if (!isCheckingSuperAdmin) {
      setCurrentPage(isSuperAdmin ? "admin" : "venues");
    }
  }, [isSuperAdmin, isCheckingSuperAdmin]);

  const renderPage = () => {
    // Super admin only sees tenant management
    if (isSuperAdmin) {
      return <TenantManagementPage />;
    }

    // Venue management page
    if (currentPage === "venues") {
      return <VenueManagementPage role={role} assignedVenueIds={assignedVenueIds} />;
    }

    // Other pages require a selected venue
    if (!selectedVenueId) {
      return (
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-4">Please select or create a venue first.</p>
          <button
            onClick={() => setCurrentPage("venues")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Go to Venues
          </button>
        </div>
      );
    }

    // Regular tenant admin sees venue-specific pages
    switch (currentPage) {
      case "kds":
        return <KDSPage venueId={selectedVenueId} />;
      case "menu":
        return <MenuManagementPage venueId={selectedVenueId} />;
      case "qr":
        return <QRManagementPage venueId={selectedVenueId} />;
      default:
        return <VenueManagementPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">Ink Wave Dashboard</h1>
              
              <SignedIn>
                {isSuperAdmin ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">Super Admin Mode</span>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <div className="flex items-center text-sm">
                      <BuildingOfficeIcon className="w-5 h-5 mr-2 text-purple-600" />
                      <span className="font-medium text-purple-600">Tenant Management</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-4">
                      <VenueSelector 
                        selectedVenueId={selectedVenueId} 
                        onVenueChange={setSelectedVenueId}
                        role={role}
                        assignedVenueIds={assignedVenueIds}
                      />
                      <div className="h-6 w-px bg-gray-300"></div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setCurrentPage("venues")}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          currentPage === "venues"
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <HomeIcon className="w-4 h-4 mr-2" />
                        Venues
                      </button>
                      <button
                        onClick={() => setCurrentPage("kds")}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          currentPage === "kds"
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <QueueListIcon className="w-4 h-4 mr-2" />
                        KDS
                      </button>
                      <button
                        onClick={() => setCurrentPage("menu")}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          currentPage === "menu"
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <Cog6ToothIcon className="w-4 h-4 mr-2" />
                        Menu
                      </button>
                      <button
                        onClick={() => setCurrentPage("qr")}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          currentPage === "qr"
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <QrCodeIcon className="w-4 h-4 mr-2" />
                        QR Codes
                      </button>
                    </div>
                  </>
                )}
              </SignedIn>
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

      <SignedOut>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Ink Wave Dashboard</h2>
            <p className="text-gray-600 mb-6">Please sign in to access the dashboard features</p>
            <SignInButton mode="modal">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {renderPage()}
      </SignedIn>
    </div>
  );
}

export default App;

