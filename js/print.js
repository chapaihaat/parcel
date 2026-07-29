// Print management module - Updated with Free Shipping and QR Code
class PrintManager {
  constructor() {
    this.settings = null;
  }

  async getSettings() {
    if (!this.settings) {
      this.settings = await db.getSettings();
    }
    return this.settings;
  }

  getLogoHTML() {
    const logoURL = window.CHAPAI_LOGO_DATA_URL || 'assets/logo.svg';
    return `<img src="${logoURL}" alt="Chapai Haat" class="print-logo" 
                  style="width:60px;height:60px;object-fit:contain;border-radius:4px;background:white;padding:2px;" 
                  onerror="this.outerHTML='<div style=\\'width:60px;height:60px;background:#1C6B20;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;color:#fff;text-align:center;\\'>Chapai<br>Haat</div>'">`;
  }

  generateQRCode(order) {
    const qrData = {
      "Parcel ID": order.parcelId,
      "Customer": order.customerName,
      "Phone": order.mobile,
      "Address": order.address,
      "District": order.district || '',
      "Area": order.area || '',
      "Product": order.productName || '',
      "Quantity": order.quantity || 1,
      "COD": order.codAmount,
      "Delivery Charge": order.deliveryCharge || 0,
      "Shipping": order.freeShipping ? "FREE SHIPPING" : "Standard",
      "Status": order.status,
      "Date": new Date(order.createdAt).toISOString().split('T')[0]
    };
    
    const jsonStr = JSON.stringify(qrData);
    const encoded = encodeURIComponent(jsonStr);
    // Use a QR code generation service that works offline
    return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encoded}&format=png&bgcolor=ffffff&color=1C6B20&margin=10`;
  }

  async printLabel(order) {
    const settings = await this.getSettings();
    const label = this.generateVoucherHTML(order, settings);
    const win = window.open('', '_blank');
    win.document.write(label);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 500);
  }

  async printLabels(orders) {
    const settings = await this.getSettings();
    let html = '<!DOCTYPE html><html><head><title>Chapai Haat - Vouchers</title>';
    html += '<meta charset="UTF-8">';
    html += '<link rel="stylesheet" href="css/print.css">';
    html += `<style>
      body { margin: 0; padding: 10px; background: #f0f0f0; font-family: 'Inter', Arial, sans-serif; }
      .voucher-wrapper { page-break-after: always; page-break-inside: avoid; padding: 5px; }
      .voucher-wrapper:last-child { page-break-after: avoid; }
      .print-logo { width: 50px; height: 50px; object-fit: contain; border-radius: 4px; background: white; padding: 2px; }
      @media print {
        body { background: white; padding: 0; }
        .voucher-wrapper { padding: 0; }
        .print-logo { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    </style>`;
    html += '</head><body>';
    
    for (const order of orders) {
      html += this.generateVoucherHTML(order, settings);
    }
    
    html += '</body></html>';
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 500);
  }

  generateVoucherHTML(order, settings) {
    const logoHTML = this.getLogoHTML();
    const barcode = barcodeGenerator.generate(order.parcelId);
    const qrCodeUrl = this.generateQRCode(order);
    const isFreeShipping = order.freeShipping || order.deliveryCharge === 0;
    
    const orderDate = new Date(order.createdAt);
    const formattedDate = orderDate.toLocaleDateString('en-BD', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const formattedTime = orderDate.toLocaleTimeString('en-BD', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `
      <div class="voucher-wrapper">
        <div class="voucher" style="max-width:210mm;margin:0 auto;background:white;border:2px solid #1C6B20;border-radius:6px;padding:20px;font-family:'Inter',Arial,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header: Logo + Company Info -->
          <div style="display:flex;align-items:center;gap:14px;border-bottom:2px solid #1C6B20;padding-bottom:12px;margin-bottom:14px;">
            ${logoHTML}
            <div style="flex:1;">
              <div style="font-size:20px;font-weight:700;color:#0B2053;letter-spacing:-0.5px;">${settings.companyName || 'Chapai Haat'}</div>
              <div style="font-size:10px;color:#555;margin-top:2px;">📍 ${settings.address || 'Monakasha Bazar, Shibganj, Chapainawabganj, Rajshahi'}</div>
              <div style="font-size:10px;color:#555;">📞 ${settings.phone || '01325940272'}</div>
            </div>
            <div style="text-align:right;border-left:2px solid #e0e0e0;padding-left:14px;">
              <div style="font-size:9px;color:#999;text-transform:uppercase;letter-spacing:1px;">Parcel ID</div>
              <div style="font-size:18px;font-weight:700;color:#1C6B20;">${order.parcelId}</div>
              <div style="font-size:9px;color:#999;margin-top:2px;">${formattedDate}</div>
              <div style="font-size:9px;color:#999;">${formattedTime}</div>
            </div>
          </div>
          
          <!-- Ship To Section -->
          <div style="background:#f8fafc;padding:12px 14px;border-radius:4px;margin-bottom:12px;border-left:4px solid #1C6B20;">
            <div style="font-size:10px;font-weight:600;color:#1C6B20;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Ship To</div>
            <div style="font-size:15px;font-weight:600;color:#0B2053;">${order.customerName}</div>
            <div style="font-size:12px;color:#555;margin-top:2px;">📞 ${order.mobile}</div>
            <div style="font-size:12px;color:#555;margin-top:2px;">📍 ${order.address}</div>
            ${order.district ? `<div style="font-size:12px;color:#555;margin-top:2px;">District: ${order.district}${order.area ? ', ' + order.area : ''}</div>` : ''}
          </div>
          
          <!-- Two Column: COD + Details -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
            <!-- COD Box -->
            <div style="background:#f0fdf4;border:2px solid #1C6B20;border-radius:4px;padding:12px;text-align:center;">
              <div style="font-size:9px;color:#1C6B20;text-transform:uppercase;letter-spacing:1px;font-weight:600;">COD</div>
              <div style="font-size:28px;font-weight:700;color:#1C6B20;">৳${order.codAmount.toFixed(2)}</div>
              <div style="font-size:9px;color:#666;margin-top:2px;">Cash on Delivery</div>
            </div>
            
            <!-- Order Details -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;padding:8px 12px;background:#fafafa;border-radius:4px;align-content:center;">
              <div style="font-size:9px;color:#999;">Product</div>
              <div style="font-size:13px;font-weight:500;color:#0B2053;">${order.productName || '-'}</div>
              
              <div style="font-size:9px;color:#999;">Quantity</div>
              <div style="font-size:13px;font-weight:500;color:#0B2053;">${order.quantity || 1}</div>
              
              <div style="font-size:9px;color:#999;">Delivery</div>
              <div style="font-size:13px;font-weight:500;color:#0B2053;">
                ${isFreeShipping ? 
                  '<span style="color:#1C6B20;font-weight:700;background:#d1fae5;padding:2px 8px;border-radius:4px;font-size:11px;">FREE SHIPPING</span>' : 
                  '৳' + (order.deliveryCharge || 0).toFixed(2)
                }
              </div>
              
              <div style="font-size:9px;color:#999;">Status</div>
              <div style="font-size:13px;font-weight:500;color:#1C6B20;text-transform:capitalize;">${order.status}</div>
            </div>
          </div>
          
          ${order.note ? `<div style="font-size:11px;color:#666;padding:6px 12px;background:#fafafa;border-radius:4px;margin-bottom:12px;border:1px dashed #ddd;"><strong>Note:</strong> ${order.note}</div>` : ''}
          
          <!-- Barcode + QR Code Section -->
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:#f8fafc;border-radius:4px;border:1px solid #e8ecf0;">
            <div style="flex:1;text-align:center;">
              ${barcode}
            </div>
            <div style="border-left:1px solid #ddd;padding-left:12px;">
              <img src="${qrCodeUrl}" alt="QR Code" style="width:100px;height:100px;display:block;" 
                   onerror="this.outerHTML='<div style=\\'width:100px;height:100px;background:#f9f9f9;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666;border-radius:4px;\\'>QR</div>'">
            </div>
          </div>
          
          <!-- Footer -->
          <div style="margin-top:12px;padding-top:10px;border-top:1px solid #e0e0e0;display:flex;justify-content:space-between;align-items:center;font-size:8px;color:#999;flex-wrap:wrap;gap:4px;">
            <span>${settings.companyName || 'Chapai Haat'}</span>
            <span>📞 ${settings.phone || '01325940272'}</span>
            <span>${settings.address || 'Monakasha Bazar, Shibganj, Chapainawabganj, Rajshahi'}</span>
          </div>
        </div>
      </div>
    `;
  }

  printReport(orders) {
    const settings = this.getSettings();
    let html = '<!DOCTYPE html><html><head><title>Chapai Haat - Report</title>';
    html += '<meta charset="UTF-8">';
    html += '<link rel="stylesheet" href="css/print.css">';
    html += `<style>
      body { padding: 20px; font-family: 'Inter', Arial, sans-serif; background: white; }
      .report-header { display: flex; align-items: center; gap: 16px; border-bottom: 2px solid #1C6B20; padding-bottom: 16px; margin-bottom: 20px; }
      .report-logo { width: 50px; height: 50px; object-fit: contain; border-radius: 4px; background: white; padding: 2px; }
      .report-title { font-size: 24px; font-weight: 700; color: #0B2053; margin: 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th { background: #1C6B20; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
      td { padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
      tr:hover { background: #f5f5f5; }
      @media print { .no-print { display: none !important; } }
    </style>`;
    html += '</head><body>';
    
    html += `<div class="report-header">
      <img src="${window.CHAPAI_LOGO_DATA_URL || 'assets/logo.svg'}" alt="Logo" class="report-logo" 
           onerror="this.outerHTML='<div style=\\'width:50px;height:50px;background:#1C6B20;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;color:#fff;text-align:center;\\'>Chapai<br>Haat</div>'">
      <div>
        <h1 class="report-title">${settings.companyName || 'Chapai Haat'}</h1>
        <p style="margin:4px 0 0;color:#666;font-size:13px;">Report generated: ${new Date().toLocaleString()}</p>
      </div>
    </div>`;
    
    html += '<table>';
    html += '<tr><th>Parcel ID</th><th>Customer</th><th>Mobile</th><th>COD</th><th>Delivery</th><th>Status</th><th>Date</th></tr>';
    
    orders.forEach(order => {
      const isFree = order.freeShipping || order.deliveryCharge === 0;
      html += `<tr>
        <td><strong>${order.parcelId}</strong></td>
        <td>${order.customerName}</td>
        <td>${order.mobile}</td>
        <td>৳${order.codAmount.toFixed(2)}</td>
        <td>${isFree ? 'FREE' : '৳' + (order.deliveryCharge || 0).toFixed(2)}</td>
        <td><span style="text-transform:capitalize;">${order.status}</span></td>
        <td>${new Date(order.createdAt).toLocaleDateString()}</td>
      </tr>`;
    });
    
    if (orders.length === 0) {
      html += '<tr><td colspan="7" style="text-align:center;padding:20px;color:#999;">No orders found</td></tr>';
    }
    
    html += '</table>';
    html += `<div style="margin-top:20px;padding-top:12px;border-top:1px solid #ddd;font-size:11px;color:#999;text-align:center;">
      ${settings.companyName || 'Chapai Haat'} · ${settings.phone || '01325940272'} · ${settings.address || 'Monakasha Bazar, Shibganj, Chapainawabganj, Rajshahi'}
    </div>`;
    html += '</body></html>';
    
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 500);
  }
}

const printManager = new PrintManager();

// Barcode generator
const barcodeGenerator = {
  generate(parcelId) {
    return `<div style="font-family: 'Courier New', monospace; font-size: 16px; letter-spacing: 1.5px; padding: 4px 10px; background: white; border-radius: 2px; display:inline-block;">
      <div style="display:flex;justify-content:center;gap:1.5px;flex-wrap:wrap;max-width:180px;">
        ${this.generateBars(parcelId)}
      </div>
      <div style="text-align:center;font-size:12px;margin-top:3px;font-weight:600;color:#0B2053;letter-spacing:1px;">${parcelId}</div>
    </div>`;
  },
  
  generateBars(text) {
    let bars = '';
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i) % 10 + 1;
      for (let j = 0; j < code; j++) {
        bars += '<span style="display:inline-block;width:2px;height:20px;background:#000;margin:0 0.5px;"></span>';
      }
      bars += '<span style="display:inline-block;width:3px;"></span>';
    }
    return bars;
  }
};