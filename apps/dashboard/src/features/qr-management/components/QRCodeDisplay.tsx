import React, { useState, useEffect } from 'react';
import { QRCodeGenerator, type QRCodeData } from '../../../lib/qrCodeGenerator';

interface QRCodeDisplayProps {
  data: QRCodeData;
  title: string;
  subtitle?: string;
  showDownloadButtons?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  data,
  title,
  subtitle,
  showDownloadButtons = true,
}) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const dataURL = await QRCodeGenerator.generateQRCodeDataURL(data);
        setQrCodeDataURL(dataURL);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateQR();
  }, [data]);

  const handleDownloadPNG = () => {
    QRCodeGenerator.downloadQRCode(data, `${title.replace(/\s+/g, '_')}_QR`);
  };

  const handleDownloadSVG = () => {
    QRCodeGenerator.downloadQRCodeSVG(data, `${title.replace(/\s+/g, '_')}_QR`);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Generating QR code...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {subtitle && (
        <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
      )}
      
      <div className="mb-4">
        <img 
          src={qrCodeDataURL} 
          alt={`QR Code for ${title}`}
          className="mx-auto border border-gray-200 rounded-lg"
        />
      </div>

      {showDownloadButtons && (
        <div className="flex gap-2 justify-center">
          <button
            onClick={handleDownloadPNG}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Download PNG
          </button>
          <button
            onClick={handleDownloadSVG}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Download SVG
          </button>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>Scan this QR code to access the menu for this table</p>
      </div>
    </div>
  );
};