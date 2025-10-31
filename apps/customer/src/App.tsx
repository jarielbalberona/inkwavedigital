import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QRLandingPage } from './components/QRLandingPage';
import { MenuPage } from './features/menu/components/MenuPage';
// import { SentryTestButton } from './components/SentryTestButton';

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<QRLandingPage />} />
        {/* New slug-based route */}
        <Route path="/:tenantSlug/:venueSlug/menu" element={<MenuPage />} />
        {/* Legacy UUID-based route for backward compatibility */}
        <Route path="/menu" element={<MenuPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* <SentryTestButton /> */}
      <ReactQueryDevtools initialIsOpen={true} />
    </>
  );
}

export default App;
