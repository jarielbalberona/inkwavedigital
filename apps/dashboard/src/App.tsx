import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { KDSPage } from "./features/kds/components/KDSPage";
import { MenuManagementPage } from "./features/menu-management/components/MenuManagementPage";
import { TableManagementPage } from "./features/table-management/components/TableManagementPage";
import { TenantManagementPage } from "./features/admin/components/TenantManagementPage";
import { VenueManagementPage } from "./features/venue-management/components/VenueManagementPage";
import { useSuperAdmin } from "./hooks/useSuperAdmin";
import { useUserRole } from "./hooks/useUserRole";
import { useTenantInfo } from "./hooks/useTenantInfo";
import { VenueSelector } from "./components/VenueSelector";
import { AuthProvider } from "./components/AuthProvider";
import { 
  QueueListIcon, 
  Cog6ToothIcon, 
  TableCellsIcon,
  BuildingOfficeIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { UserButton } from "@clerk/clerk-react";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin, isLoading: isCheckingSuperAdmin } = useSuperAdmin();
  const { role, assignedVenueIds } = useUserRole();
  const { tenantInfo } = useTenantInfo();
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);

  // Redirect authenticated users to appropriate default page
  useEffect(() => {
    // Don't redirect on the root path - let it show the login screen
    if (!isCheckingSuperAdmin && location.pathname !== '/' && isSuperAdmin) {
      // Redirect any authenticated user away from root
      navigate('/admin', { replace: true });
    }
  }, [isCheckingSuperAdmin, isSuperAdmin, location.pathname, navigate]);

  const navItems = [
    { icon: HomeIcon, label: 'Venues', path: '/venues', id: 'venues' },
    { icon: QueueListIcon, label: 'KDS', path: '/kds', id: 'kds' },
    { icon: Cog6ToothIcon, label: 'Menu', path: '/menu', id: 'menu' },
    { icon: TableCellsIcon, label: 'Tables', path: '/tables', id: 'tables' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <SignedOut>
        <Routes>
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                   Dashboard</h2>
                <p className="text-gray-600 mb-6">Please sign in to access the dashboard features</p>
                <SignInButton mode="modal">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            </div>
          } />
        </Routes>
      </SignedOut>

      <SignedIn>
        {location.pathname !== '/' && <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-bold text-gray-900">
                  {isSuperAdmin ? "Super Admin Dashboard" : `${tenantInfo?.name || "Ink Wave"} Dashboard`}
                </h1>
                
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
                      {navItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => navigate(item.path)}
                          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive(item.path)
                              ? "bg-blue-100 text-blue-700"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          }`}
                        >
                          <item.icon className="w-4 h-4 mr-2" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div>
                <UserButton />
              </div>
            </div>
          </div>
        </nav>}

        <Routes>
          <Route path="/" element={
            isSuperAdmin ? (
              <TenantManagementPage />
            ) : (
              <Navigate to="/venues" replace />
            )
          } />
          <Route path="/admin" element={<TenantManagementPage />} />
          <Route path="/venues" element={<VenueManagementPage role={role} assignedVenueIds={assignedVenueIds} />} />
          <Route path="/kds" element={
            selectedVenueId ? (
              <KDSPage venueId={selectedVenueId} />
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-600 mb-4">Please select a venue to view KDS</p>
                <button
                  onClick={() => navigate('/venues')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Go to Venues
                </button>
              </div>
            )
          } />
          <Route path="/menu" element={
            selectedVenueId ? (
              <MenuManagementPage venueId={selectedVenueId} />
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-600 mb-4">Please select a venue to manage menu</p>
                <button
                  onClick={() => navigate('/venues')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Go to Venues
                </button>
              </div>
            )
          } />
          <Route path="/tables" element={
            selectedVenueId ? (
              <TableManagementPage venueId={selectedVenueId} />
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-600 mb-4">Please select a venue to manage tables</p>
                <button
                  onClick={() => navigate('/venues')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Go to Venues
                </button>
              </div>
            )
          } />
        </Routes>
      </SignedIn>
      </div>
    </AuthProvider>
  );
}

export default App;
