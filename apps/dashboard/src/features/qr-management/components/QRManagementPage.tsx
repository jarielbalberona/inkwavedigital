import React, { useState } from "react";
import { QrCodeIcon } from "@heroicons/react/24/outline";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { generateQRData } from "../hooks/helpers/qrHelpers";
import { useTablesQuery } from "../hooks/useTablesQuery";

interface QRManagementPageProps {
  venueId: string;
}

export const QRManagementPage: React.FC<QRManagementPageProps> = ({ venueId }) => {
  const [generatedTables, setGeneratedTables] = useState<Set<string>>(new Set());
  
  const { data: tables, isLoading, error } = useTablesQuery(venueId);

  const handleGenerateQR = (tableId: string) => {
    setGeneratedTables(prev => new Set([...prev, tableId]));
  };

  const handleGenerateAll = () => {
    if (tables) {
      setGeneratedTables(new Set(tables.map(table => table.id)));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tables...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading tables: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">QR Code Management</h1>
            <p className="text-gray-600">Generate QR codes for your tables</p>
          </div>
          <button
            onClick={handleGenerateAll}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <QrCodeIcon className="w-5 h-5 mr-2" />
            Generate All QR Codes
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!tables || tables.length === 0 ? (
          <div className="text-center py-12">
            <QrCodeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No tables found</p>
            <p className="text-sm text-gray-400">Add tables to your venue to generate QR codes</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tables List */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tables</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((table) => (
                  <div key={table.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900">{table.label}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        table.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {table.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleGenerateQR(table.id)}
                      className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                      <QrCodeIcon className="w-4 h-4 mr-2" />
                      Generate QR Code
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated QR Codes */}
            {generatedTables.size > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Generated QR Codes ({generatedTables.size})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tables
                    .filter(table => generatedTables.has(table.id))
                    .map((table) => {
                      const qrUrl = generateQRData(venueId, table.id);
                      return (
                        <QRCodeDisplay
                          key={table.id}
                          data={{
                            venueId: venueId,
                            tableId: table.id,
                            deviceId: `table-${table.id}`
                          }}
                          qrUrl={qrUrl}
                          title={table.label}
                          subtitle={`Table QR Code`}
                          showDownloadButtons={true}
                        />
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
