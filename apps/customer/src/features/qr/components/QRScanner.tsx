import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "../../menu/hooks/stores/useSessionStore";
import { PaxPrompt } from "./PaxPrompt";

interface QRScannerProps {
  onScanSuccess: (data: { venueId: string; tableId: string; tableLabel?: string }) => void;
  onClose: () => void;
}

export const QRScannerComponent: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onClose,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [showPaxPrompt, setShowPaxPrompt] = useState(false);
  const [scannedData, setScannedData] = useState<{ venueId: string; tableId: string; tableLabel?: string } | null>(null);
  const { setSession } = useSessionStore();
  const navigate = useNavigate();

  const handleScan = (result: any) => {
    try {
      // Parse QR code data
      const qrData = JSON.parse(result);
      
      if (!qrData.venueId || !qrData.tableId) {
        throw new Error("Invalid QR code format");
      }

      // Store scanned data and show pax prompt
      setScannedData({
        venueId: qrData.venueId,
        tableId: qrData.tableId,
        tableLabel: qrData.tableLabel,
      });
      setShowPaxPrompt(true);
      
    } catch (err) {
      setError("Invalid QR code. Please scan a valid table QR code.");
      console.error("QR scan error:", err);
    }
  };

  const handlePaxConfirm = (pax: number) => {
    if (scannedData) {
      // Set session data with pax
      setSession(scannedData.venueId, scannedData.tableId, undefined, pax, scannedData.tableLabel);
      
      // Call success callback
      onScanSuccess(scannedData);
      
      // Navigate to menu
      navigate('/menu');
      
      onClose();
    }
  };

  const handlePaxSkip = () => {
    if (scannedData) {
      // Set session data without pax
      setSession(scannedData.venueId, scannedData.tableId, undefined, undefined, scannedData.tableLabel);
      
      // Call success callback
      onScanSuccess(scannedData);
      
      // Navigate to menu
      navigate('/menu');
      
      onClose();
    }
  };

  const handleError = (error: any) => {
    console.error("QR scanner error:", error);
    setError("Camera access denied or QR scanner error. Please check permissions.");
  };

  // Show PaxPrompt if QR scan was successful
  if (showPaxPrompt && scannedData) {
    return (
      <PaxPrompt
        tableId={scannedData.tableLabel || scannedData.tableId}
        onConfirm={handlePaxConfirm}
        onSkip={handlePaxSkip}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Scan QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="relative">
          <Scanner
            onScan={handleScan}
            onError={handleError}
            containerStyle={{
              width: "100%",
              height: "300px",
            }}
            videoStyle={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Point your camera at the QR code on your table</p>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // For demo purposes, simulate a QR scan
              const demoData = {
                venueId: "e9aa1151-05e2-488b-a18b-d50ac42909e5",
                tableId: "fa6d4b4d-5a89-42ab-b990-74cf2f4907d6",
                deviceId: `demo-device-${Date.now()}`,
              };
              setSession(demoData.venueId, demoData.tableId, demoData.deviceId);
              onScanSuccess({
                venueId: demoData.venueId,
                tableId: demoData.tableId,
              });
              // Navigate to menu
              navigate('/menu');
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Demo Mode
          </button>
        </div>
      </div>
    </div>
  );
};
