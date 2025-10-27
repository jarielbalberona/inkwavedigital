import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { QRScannerComponent } from "../features/qr/components/QRScanner";

export function QRLandingPage() {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for URL query params on mount
  useEffect(() => {
    const venueParam = searchParams.get('venue');
    const tableParam = searchParams.get('table');

    // If URL has venue and table params, navigate to menu with those params preserved
    if (venueParam && tableParam) {
      navigate(`/menu?venue=${venueParam}&table=${tableParam}`);
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Ink Wave</h1>
          <p className="text-gray-600">Scan the QR code on your table to start ordering</p>
        </div>

        <button
          onClick={() => setShowQRScanner(true)}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Scan QR Code
        </button>

      </div>

      {showQRScanner && (
        <QRScannerComponent
          onScanSuccess={() => {
            setShowQRScanner(false);
          }}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  );
}

