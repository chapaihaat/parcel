// Dashboard functionality - Fixed loading issue
class Dashboard {
  constructor() {
    this.initialized = false;
  }

  async render() {
    try {
      console.log('Dashboard rendering...');
      const container = document.getElementById('pageContainer');
      
      // Get stats
      let stats;
      try {
        stats = await parcel.getStats();
      } catch (error) {
        console.error('Error getting stats:', error);
        stats = {
          todayOrders: 0,
          todayCOD: 0,
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          deliveredOrders: 0,
          cancelledOrders: 0
        };
      }
      
      // Get recent orders
      let recentOrders = [];
      try {
        const allOrders = await parcel.getAllOrders();
        allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        recentOrders = allOrders.slice(0, 10);
      } catch (error) {
        console.error('Error getting recent orders:', error);
        recentOrders = [];
      }
      
      // Render dashboard
      container.innerHTML = `
        <div class="dashboard">
          <!-- Stats Grid -->
          <div class="grid-4 mb-16">
            <div class="stat-card">
              <div class="stat-icon material-icons-round">today</div>
              <div class="stat-value">${stats.todayOrders || 0}</div>
              <div class="stat-label">Today's Orders</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon material-icons-round">payments</div>
              <div class="stat-value">৳${(stats.todayCOD || 0).toFixed(2)}</div>
              <div class="stat-label">Today's COD</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon material-icons-round">inventory</div>
              <div class="stat-value">${stats.totalOrders || 0}</div>
              <div class="stat-label">Total Orders</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon material-icons-round">trending_up</div>
              <div class="stat-value">৳${(stats.totalRevenue || 0).toFixed(2)}</div>
              <div class="stat-label">Total Revenue</div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card mb-16">
            <h3 style="margin-bottom:12px;">Quick Actions</h3>
            <div class="quick-actions">
              <div class="quick-action-btn" onclick="orders.showAddForm()">
                <span class="material-icons-round">add_shopping_cart</span>
                <span>New Order</span>
              </div>
              <div class="quick-action-btn" onclick="app.navigate('orders')">
                <span class="material-icons-round">list_alt</span>
                <span>View Orders</span>
              </div>
              <div class="quick-action-btn" onclick="reports.generate('daily')">
                <span class="material-icons-round">bar_chart</span>
                <span>Daily Report</span>
              </div>
              <div class="quick-action-btn" onclick="settings.backupData()">
                <span class="material-icons-round">backup</span>
                <span>Backup</span>
              </div>
            </div>
          </div>

          <!-- Charts -->
          <div class="grid-2 mb-16">
            <div class="card">
              <h3>Weekly Trend</h3>
              <canvas id="weeklyChart" height="200"></canvas>
            </div>
            <div class="card">
              <h3>Status Distribution</h3>
              <canvas id="statusChart" height="200"></canvas>
            </div>
          </div>

          <!-- Recent Orders -->
          <div class="card">
            <div class="flex-between mb-16">
              <h3>Recent Orders</h3>
              <button class="btn btn-primary btn-sm" onclick="app.navigate('orders')">View All</button>
            </div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Parcel ID</th>
                    <th>Customer</th>
                    <th>Mobile</th>
                    <th>COD</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${recentOrders.map(order => `
                    <tr>
                      <td><strong>${order.parcelId}</strong></td>
                      <td>${order.customerName}</td>
                      <td>${order.mobile}</td>
                      <td>৳${order.codAmount.toFixed(2)}</td>
                      <td><span class="badge-status ${order.status}">${order.status}</span></td>
                      <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  `).join('')}
                  ${recentOrders.length === 0 ? '<tr><td colspan="6" class="text-center text-muted" style="padding:20px;">No orders found</td></tr>' : ''}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

      // Render charts after DOM update
      setTimeout(() => {
        this.renderCharts();
      }, 100);
      
      this.initialized = true;
      console.log('Dashboard rendered successfully');
      
    } catch (error) {
      console.error('Dashboard render error:', error);
      const container = document.getElementById('pageContainer');
      container.innerHTML = `
        <div class="card" style="text-align:center;padding:40px;margin:20px;">
          <span class="material-icons-round" style="font-size:48px;color:#e74c3c;">error</span>
          <h3 style="color:#e74c3c;margin:12px 0;">Error Loading Dashboard</h3>
          <p style="color:var(--text-secondary);">${error.message || 'Unknown error occurred'}</p>
          <button class="btn btn-primary" style="margin-top:16px;" onclick="app.navigate('dashboard')">Retry</button>
        </div>
      `;
    }
  }

  renderCharts() {
    try {
      // Weekly chart
      const weeklyCtx = document.getElementById('weeklyChart');
      if (weeklyCtx) {
        const ctx = weeklyCtx.getContext('2d');
        const rect = weeklyCtx.parentElement?.getBoundingClientRect();
        const width = rect ? rect.width - 32 : 400;
        weeklyCtx.width = width;
        weeklyCtx.height = 200;
        
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data = [4, 7, 5, 9, 6, 11, 8];
        this.drawBarChart(ctx, days, data, '#1C6B20', width, 200);
      }

      // Status chart
      const statusCtx = document.getElementById('statusChart');
      if (statusCtx) {
        const ctx = statusCtx.getContext('2d');
        const rect = statusCtx.parentElement?.getBoundingClientRect();
        const width = rect ? rect.width - 32 : 400;
        statusCtx.width = width;
        statusCtx.height = 200;
        
        const labels = ['Pending', 'Delivered', 'Cancelled'];
        const data = [25, 40, 5];
        const colors = ['#f4a261', '#1C6B20', '#e74c3c'];
        this.drawPieChart(ctx, labels, data, colors, width, 200);
      }
    } catch (error) {
      console.error('Chart rendering error:', error);
    }
  }

  drawBarChart(ctx, labels, data, color, width, height) {
    try {
      const padding = 30;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;
      const max = Math.max(...data) * 1.2 || 10;
      const barWidth = Math.min(chartWidth / data.length * 0.6, 40);
      const gap = chartWidth / data.length;

      ctx.clearRect(0, 0, width, height);
      
      // Grid lines
      ctx.strokeStyle = 'rgba(0,0,0,0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      // Draw bars
      data.forEach((value, i) => {
        const x = padding + i * gap + (gap - barWidth) / 2;
        const barHeight = (value / max) * chartHeight;
        const y = padding + chartHeight - barHeight;
        
        const gradient = ctx.createLinearGradient(x, y, x, padding + chartHeight);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color + '66');
        ctx.fillStyle = gradient;
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, 4);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#666';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], x + barWidth / 2, padding + chartHeight + 16);
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 11px Inter';
        ctx.fillText(value, x + barWidth / 2, y - 6);
      });
    } catch (error) {
      console.error('Bar chart error:', error);
    }
  }

  drawPieChart(ctx, labels, data, colors, width, height) {
    try {
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) / 2 - 30;
      const total = data.reduce((a, b) => a + b, 0) || 1;
      
      ctx.clearRect(0, 0, width, height);
      
      let startAngle = -Math.PI / 2;
      data.forEach((value, i) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        const midAngle = startAngle + sliceAngle / 2;
        const labelRadius = radius * 0.65;
        const x = cx + Math.cos(midAngle) * labelRadius;
        const y = cy + Math.sin(midAngle) * labelRadius;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.round((value / total) * 100)}%`, x, y);
        
        startAngle += sliceAngle;
      });
      
      let legendY = 10;
      labels.forEach((label, i) => {
        ctx.fillStyle = colors[i];
        ctx.fillRect(width - 90, legendY, 12, 12);
        ctx.fillStyle = '#333';
        ctx.font = '10px Inter';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${label} (${data[i]})`, width - 74, legendY + 6);
        legendY += 18;
      });
    } catch (error) {
      console.error('Pie chart error:', error);
    }
  }
}

// RoundRect polyfill for canvas
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
    const r = typeof radii === 'number' ? radii : (radii || 0);
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    return this;
  };
}

// Create dashboard instance
const dashboard = new Dashboard();