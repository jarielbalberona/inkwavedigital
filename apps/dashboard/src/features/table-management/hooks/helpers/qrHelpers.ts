import type { QRCode } from "../../types/table.types";

export const generateQRData = (
  tenantSlug: string,
  venueSlug: string, 
  tableId: string, 
  tableLabel?: string
): string => {
  // Customer app URL from environment
  const customerAppUrl = import.meta.env.VITE_CUSTOMER_APP_URL || 'http://localhost:5173';
  const params = new URLSearchParams({
    table: tableId,
  });
  if (tableLabel) {
    params.append('label', tableLabel);
  }
  // New slug-based URL format: /{tenant-slug}/{venue-slug}/menu?table={id}&label={label}
  return `${customerAppUrl}/${tenantSlug}/${venueSlug}/menu?${params.toString()}`;
};

export const generateQRCode = (
  tenantSlug: string,
  venueSlug: string,
  tableId: string, 
  tableLabel: string
): QRCode => {
  const qrData = generateQRData(tenantSlug, venueSlug, tableId, tableLabel);
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
