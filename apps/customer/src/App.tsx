import { Routes, Route, Navigate } from 'react-router-dom';
import { QRLandingPage } from './components/QRLandingPage';
import { MenuPage } from './features/menu/components/MenuPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<QRLandingPage />} />
      {/* New slug-based route */}
      <Route path="/:tenantSlug/:venueSlug/menu" element={<MenuPage />} />
      {/* Legacy UUID-based route for backward compatibility */}
      <Route path="/menu" element={<MenuPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
