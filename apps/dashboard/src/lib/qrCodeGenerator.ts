import QRCode from 'qrcode';

export interface QRCodeData {
  venueId: string;
  tableId: string;
  deviceId?: string;
}

export class QRCodeGenerator {
  /**
   * Generate QR code data URL from a URL string
   */
  static async generateQRCodeFromURL(url: string): Promise<string> {
    return await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  }

  /**
   * Generate QR code SVG from a URL string
   */
  static async generateQRCodeSVGFromURL(url: string): Promise<string> {
    return await QRCode.toString(url, {
      type: 'svg',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  }

  /**
   * Download QR code as PNG from URL
   */
  static downloadQRCodeFromURL(url: string, filename: string): void {
    QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }).then((dataURL) => {
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataURL;
      link.click();
    });
  }

  /**
   * Download QR code as SVG from URL
   */
  static downloadQRCodeSVGFromURL(url: string, filename: string): void {
    QRCode.toString(url, {
      type: 'svg',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }).then((svg) => {
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${filename}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  /**
   * Generate QR code data URL for a table
   */
  static async generateQRCodeDataURL(data: QRCodeData): Promise<string> {
    const qrData = JSON.stringify(data);
    return await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  }

  /**
   * Generate QR code SVG for a table
   */
  static async generateQRCodeSVG(data: QRCodeData): Promise<string> {
    const qrData = JSON.stringify(data);
    return await QRCode.toString(qrData, {
      type: 'svg',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  }

  /**
   * Download QR code as PNG
   */
  static downloadQRCode(data: QRCodeData, filename: string): void {
    QRCode.toDataURL(JSON.stringify(data), {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }).then((dataURL) => {
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataURL;
      link.click();
    });
  }

  /**
   * Download QR code as SVG
   */
  static downloadQRCodeSVG(data: QRCodeData, filename: string): void {
    QRCode.toString(JSON.stringify(data), {
      type: 'svg',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }).then((svg) => {
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${filename}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });
  }
}
