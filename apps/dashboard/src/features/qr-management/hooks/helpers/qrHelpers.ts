import type { QRCode } from "../types/qr.types";

export const generateQRData = (venueId: string, tableId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/menu?venue=${venueId}&table=${tableId}`;
};

export const generateQRCode = (venueId: string, tableId: string, tableLabel: string): QRCode => {
  const qrData = generateQRData(venueId, tableId);
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
