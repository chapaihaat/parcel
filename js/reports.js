// Reports Page Controller
const reports = {
  async render() {
    try {
      console.log('Reports rendering...');
      const container = document.getElementById('pageContainer');
      const today = new Date();
      
      container.innerHTML = `
        <div class="reports-page">
          <div class="flex flex-wrap gap-8 mb-16">
            <button class="btn btn-primary btn-sm" onclick="window.reports.generate('daily')">
              <span class="material-icons-round">today</span> Daily
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.reports.generate('monthly')">
              <span class="material-icons-round">calendar_month</span> Monthly
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.reports.generate('yearly')">
              <span class="material-icons-round">calendar_today</span> Yearly
            </button>
            <button class="btn btn-success btn-sm" onclick="window.reports.exportExcel()">
              <span class="material-icons-round">table_chart</span> Export Excel
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.reports.exportPDF()">
              <span class="material-icons-round">picture_as_pdf</span> Export PDF
            </button>
          </div>
          
          <div id="reportContent" class="card">
            <p class="text-center text-muted" style="padding:20px;">Select a report type above</p>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Reports render error:', error);
      const container = document.getElementById('pageContainer');
      container.innerHTML = `
        <div class="card" style="text-align:center;padding:40px;margin:20px;">
          <span class="material-icons-round" style="font-size:48px;color:#e74c3c;">error</span>
          <h3 style="color:#e74c3c;margin:12px 0;">Error Loading Reports</h3>
          <p style="color:var(--text-secondary);">${error.message}</p>
          <button class="btn btn-primary" style="margin-top:16px;" onclick="app.navigate('reports')">Retry</button>
        </div>
      `;
    }
  },

  async generate(type) {
    const container = document.getElementById('reportContent');
    const today = new Date();
    let orders = [];
    let title = '';
    
    try {
      switch(type) {
        case 'daily':
          orders = await parcel.getDailyReport(today);
          title = `Daily Report - ${today.toLocaleDateString()}`;
          break;
        case 'monthly':
          orders = await parcel.getMonthlyReport(today.getFullYear(), today.getMonth());
          title = `Monthly Report - ${today.toLocaleDateString('default', { month: 'long', year: 'numeric' })}`;
          break;
        case 'yearly':
          orders = await parcel.getYearlyReport(today.getFullYear());
          title = `Yearly Report - ${today.getFullYear()}`;
          break;
      }
      
      const stats = await parcel.getReportStats(orders);
      
      container.innerHTML = `
        <h4 style="margin-bottom:16px;">${title}</h4>
        <div class="grid-4 mb-16">
          <div class="stat-card">
            <div class="stat-value">${stats.totalOrders}</div>
            <div class="stat-label">Total Orders</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">৳${stats.totalCOD.toFixed(2)}</div>
            <div class="stat-label">Total COD</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">৳${stats.totalDelivery.toFixed(2)}</div>
            <div class="stat-label">Delivery Charge</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.freeShipping || 0}</div>
            <div class="stat-label">Free Shipping</div>
          </div>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Parcel ID</th>
                <th>Customer</th>
                <th>Mobile</th>
                <th>COD</th>
                <th>Delivery</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(order => {
                const isFree = order.freeShipping || order.deliveryCharge === 0;
                return `
                <tr>
                  <td>${order.parcelId}</td>
                  <td>${order.customerName}</td>
                  <td>${order.mobile}</td>
                  <td>৳${order.codAmount.toFixed(2)}</td>
                  <td>${isFree ? 'FREE' : '৳' + (order.deliveryCharge || 0).toFixed(2)}</td>
                  <td><span class="badge-status ${order.status}">${order.status}</span></td>
                  <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>`;
              }).join('')}
              ${orders.length === 0 ? '<tr><td colspan="7" class="text-center text-muted" style="padding:20px;">No orders found</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      container.innerHTML = `
        <div class="text-center" style="padding:20px;color:#e74c3c;">
          <span class="material-icons-round" style="font-size:36px;">error</span>
          <p>Error loading report: ${error.message}</p>
        </div>
      `;
    }
  },

  async exportExcel() {
    try {
      const orders = await parcel.getAllOrders();
      excelExporter.exportToExcel(orders);
    } catch (error) {
      alert('Error exporting: ' + error.message);
    }
  },

  async exportPDF() {
    try {
      const orders = await parcel.getAllOrders();
      printManager.printReport(orders);
    } catch (error) {
      alert('Error exporting: ' + error.message);
    }
  }
};

// Make reports globally accessible
window.reports = reports;