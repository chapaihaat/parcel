// Excel import/export module
class ExcelImporter {
  async parseFile(file) {
    const text = await file.text();
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (extension === 'csv') {
      return this.parseCSV(text);
    } else if (extension === 'xlsx' || extension === 'xls') {
      // For XLSX, we'll use a simple CSV-like fallback
      // In production, you'd use SheetJS library
      return this.parseCSV(text);
    } else {
      throw new Error('Unsupported file format');
    }
  }

  parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = this.parseCSVLine(lines[0]);
    const results = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const obj = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = values[index] || '';
      });
      results.push(obj);
    }
    
    return results;
  }

  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }
}

class ExcelExporter {
  exportToExcel(orders) {
    if (orders.length === 0) {
      alert('No data to export');
      return;
    }
    
    let csv = 'Parcel ID,Customer,Mobile,Address,District,Area,COD,Delivery Charge,Product,Quantity,Status,Date,Note\n';
    
    orders.forEach(order => {
      csv += `${order.parcelId},"${order.customerName}",${order.mobile},"${order.address}","${order.district || ''}","${order.area || ''}",${order.codAmount},${order.deliveryCharge},"${order.productName || ''}",${order.quantity || 1},${order.status},"${new Date(order.createdAt).toLocaleDateString()}","${order.note || ''}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chapai-haat-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

const excelImporter = new ExcelImporter();
const excelExporter = new ExcelExporter();