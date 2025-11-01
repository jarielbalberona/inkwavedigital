import React, { useState, useEffect } from "react";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Toaster } from "sonner";
import { KDSPage } from "./features/kds/components/KDSPage";
import { MenuManagementPage } from "./features/menu-management/components/MenuManagementPage";
import { TableManagementPage } from "./features/table-management/components/TableManagementPage";
import { TenantManagementPage } from "./features/admin/components/TenantManagementPage";
import { VenueManagementPage } from "./features/venue-management/components/VenueManagementPage";
import { SettingsPage } from "./features/settings/components/SettingsPage";
import { useSuperAdmin } from "./hooks/useSuperAdmin";
import { useUserRole } from "./hooks/useUserRole";
import { useTenantInfo } from "./hooks/useTenantInfo";
import { VenueSelector } from "./components/VenueSelector";
import { AuthProvider } from "./components/AuthProvider";
import { Button } from "./components/ui/button";
// import { SentryTestButton } from "./components/SentryTestButton";
import { 
  QueueListIcon, 
  Cog6ToothIcon, 
  TableCellsIcon,
  BuildingOfficeIcon,
  HomeIcon,
  Cog8ToothIcon,
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
    { icon: Cog8ToothIcon, label: 'Settings', path: '/settings', id: 'settings' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Toaster position="top-center" richColors />
        <SignedOut>
        <Routes>
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                   Dashboard</h2>
                <p className="text-muted-foreground mb-6">Please sign in to access the dashboard features</p>
                <SignInButton mode="modal">
                  <Button size="lg">
                    Sign In
                  </Button>
                </SignInButton>
              </div>
            </div>
          } />
        </Routes>
      </SignedOut>

      <SignedIn>
        {location.pathname !== '/' && <nav className="bg-card shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-bold text-foreground">
                  {isSuperAdmin ? "Super Admin Dashboard" : `${tenantInfo?.name || "Dumadine"} Dashboard`}
                </h1>
                
                {isSuperAdmin ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">Super Admin Mode</span>
                    <div className="h-6 w-px bg-border"></div>
                    <div className="flex items-center text-sm">
                      <BuildingOfficeIcon className="w-5 h-5 mr-2 text-primary" />
                      <span className="font-medium text-primary">Tenant Management</span>
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
                      <div className="h-6 w-px bg-border"></div>
                    </div>
                    <div className="flex space-x-1">
                      {navItems.map((item) => (
                        <Button
                          key={item.id}
                          variant={isActive(item.path) ? "default" : "ghost"}
                          size="sm"
                          onClick={() => navigate(item.path)}
                        >
                          <item.icon className="w-4 h-4 mr-2" />
                          {item.label}
                        </Button>
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
                <p className="text-muted-foreground mb-4">Please select a venue to view KDS</p>
                <Button onClick={() => navigate('/venues')}>
                  Go to Venues
                </Button>
              </div>
            )
          } />
          <Route path="/menu" element={
            selectedVenueId ? (
              <MenuManagementPage venueId={selectedVenueId} />
            ) : (
              <div className="p-6 text-center">
                <p className="text-muted-foreground mb-4">Please select a venue to manage menu</p>
                <Button onClick={() => navigate('/venues')}>
                  Go to Venues
                </Button>
              </div>
            )
          } />
          <Route path="/tables" element={
            selectedVenueId ? (
              <TableManagementPage venueId={selectedVenueId} />
            ) : (
              <div className="p-6 text-center">
                <p className="text-muted-foreground mb-4">Please select a venue to manage tables</p>
                <Button onClick={() => navigate('/venues')}>
                  Go to Venues
                </Button>
              </div>
            )
          } />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </SignedIn>
      </div>
      {/* <SentryTestButton /> */}
      <ReactQueryDevtools initialIsOpen={true} />
    </AuthProvider>
  );
}

export default App;
