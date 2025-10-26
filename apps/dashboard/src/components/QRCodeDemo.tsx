import React from 'react';
import { QRCodeDisplay } from '../features/qr-management/components/QRCodeDisplay';

export const QRCodeDemo: React.FC = () => {
  // Demo venue and table IDs from our seeded data
  const demoVenueId = "9662b039-7056-436d-b336-63fa662412e3";
  const demoTables = [
    { id: "1054b851-61e8-4bf0-9032-c46036167c7d", label: "Table 1" },
    { id: "13c726ad-61f4-4c29-bc3e-bfbbb13188f7", label: "Table 2" },
    { id: "d9856ec6-9890-4043-bdb4-577e53cb5cea", label: "Table 3" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">QR Code Generation Demo</h1>
          <p className="text-gray-600 mb-6">
            This demonstrates QR code generation for restaurant tables. 
            Each QR code contains venue and table information that customers can scan to access the menu.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>How it works:</strong> When a customer scans a QR code, it opens the customer app 
              with the correct venue and table context, allowing them to browse the menu and place orders.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoTables.map((table) => (
            <QRCodeDisplay
              key={table.id}
              data={{
                venueId: demoVenueId,
                tableId: table.id,
                deviceId: `demo-${table.id}`
              }}
              title={table.label}
              subtitle="Demo QR Code"
              showDownloadButtons={true}
            />
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">QR Code Data Structure</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-700 overflow-x-auto">
{`{
  "venueId": "9662b039-7056-436d-b336-63fa662412e3",
  "tableId": "1054b851-61e8-4bf0-9032-c46036167c7d", 
  "deviceId": "demo-1054b851-61e8-4bf0-9032-c46036167c7d"
}`}
            </pre>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            This JSON data is encoded into the QR code. When scanned, the customer app uses this information 
            to establish a session with the correct venue and table context.
          </p>
        </div>
      </div>
    </div>
  );
};
