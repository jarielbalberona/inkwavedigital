import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import type { QRCode as QRCodeType } from "../types/qr.types";

interface QRCodeDisplayProps {
  qrCode: QRCodeType;
  onDownload: (qrCode: QRCodeType) => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCode, onDownload }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{qrCode.tableLabel}</h3>
      
      <div className="mb-4">
        <div id={`qr-${qrCode.tableId}`} className="flex justify-center">
          <QRCodeSVG
            value={qrCode.qrData}
            size={200}
            level="M"
            includeMargin={true}
          />
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">QR Code URL:</p>
        <p className="text-xs text-gray-500 break-all bg-gray-50 p-2 rounded">
          {qrCode.qrUrl}
        </p>
      </div>
      
      <button
        onClick={() => onDownload(qrCode)}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
        Download QR Code
      </button>
    </div>
  );
};
