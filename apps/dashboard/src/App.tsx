import React, { useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { KDSPage } from "./features/kds/components/KDSPage";
import { MenuManagementPage } from "./features/menu-management/components/MenuManagementPage";
import { QRManagementPage } from "./features/qr-management/components/QRManagementPage";
import { TenantManagementPage } from "./features/admin/components/TenantManagementPage";
import { useSuperAdmin } from "./hooks/useSuperAdmin";
import { 
  QueueListIcon, 
  Cog6ToothIcon, 
  QrCodeIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

type DashboardPage = "kds" | "menu" | "qr" | "admin";

function App() {
  // For demo purposes, use the demo venue ID
  const venueId = "e9aa1151-05e2-488b-a18b-d50ac42909e5";
  const { isSuperAdmin, isLoading: isCheckingSuperAdmin } = useSuperAdmin();
  
  // Default page based on role
  const defaultPage = isSuperAdmin ? "admin" : "kds";
  const [currentPage, setCurrentPage] = useState<DashboardPage>(defaultPage);

  // Update default page when role is determined
  React.useEffect(() => {
    if (!isCheckingSuperAdmin) {
      setCurrentPage(isSuperAdmin ? "admin" : "kds");
    }
  }, [isSuperAdmin, isCheckingSuperAdmin]);

  const renderPage = () => {
    // Super admin only sees tenant management
    if (isSuperAdmin) {
      return <TenantManagementPage />;
    }

    // Regular tenant admin sees venue management pages
    switch (currentPage) {
      case "kds":
        return <KDSPage venueId={venueId} />;
      case "menu":
        return <MenuManagementPage venueId={venueId} />;
      case "qr":
        return <QRManagementPage venueId={venueId} />;
      default:
        return <KDSPage venueId={venueId} />;
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
                  <div className="flex space-x-1">
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

