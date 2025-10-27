import type { QRCode } from "../../types/table.types";

export const generateQRData = (venueId: string, tableId: string, tableLabel?: string): string => {
  // Customer app runs on port 5173
  const customerAppUrl = import.meta.env.VITE_CUSTOMER_APP_URL || 'http://localhost:5173';
  const params = new URLSearchParams({
    venue: venueId,
    table: tableId,
  });
  if (tableLabel) {
    params.append('label', tableLabel);
  }
  return `${customerAppUrl}/menu?${params.toString()}`;
};

export const generateQRCode = (venueId: string, tableId: string, tableLabel: string): QRCode => {
  const qrData = generateQRData(venueId, tableId, tableLabel);
  return {
    tableId,
    tableLabel,
    qrUrl: qrData,
    qrData,
  };
};

export const downloadQRCode = (qrCode: QRCode): void => {
  const canvas = document.querySelector(`#qr-${qrCode.tableId} canvas`) as HTMLCanvasElement;
  if (canvas) {
    const link = document.createElement('a');
    link.download = `qr-${qrCode.tableLabel.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }
};
