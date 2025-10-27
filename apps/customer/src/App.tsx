import { Routes, Route, Navigate } from 'react-router-dom';
import { QRLandingPage } from './components/QRLandingPage';
import { MenuPage } from './features/menu/components/MenuPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<QRLandingPage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
