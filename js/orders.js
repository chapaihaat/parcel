// Orders Page Controller
const orders = {
  async render() {
    try {
      console.log('Orders rendering...');
      const container = document.getElementById('pageContainer');
      const allOrders = await parcel.getAllOrders();
      allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      container.innerHTML = `
        <div class="orders-page">
          <div class="flex flex-wrap gap-8 mb-16">
            <button class="btn btn-primary" onclick="window.orders.showAddForm()">
              <span class="material-icons-round">add</span> New Order
            </button>
            <button class="btn btn-secondary" onclick="window.orders.importExcel()">
              <span class="material-icons-round">upload_file</span> Import
            </button>
            <button class="btn btn-secondary" onclick="window.orders.bulkPrint()">
              <span class="material-icons-round">print</span> Bulk Print
            </button>
            <div style="flex:1;min-width:150px;">
              <input type="text" id="searchInput" placeholder="Search parcel, mobile, name..." 
                     class="form-control" style="width:100%;" 
                     oninput="window.orders.search(this.value)">
            </div>
          </div>
          
          <div class="card">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th><input type="checkbox" id="selectAll" onchange="window.orders.toggleAll(this.checked)"></th>
                    <th>Parcel ID</th>
                    <th>Customer</th>
                    <th>Mobile</th>
                    <th>COD</th>
                    <th>Delivery</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="ordersTableBody">
                  ${this.renderRows(allOrders)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Orders render error:', error);
      const container = document.getElementById('pageContainer');
      container.innerHTML = `
        <div class="card" style="text-align:center;padding:40px;margin:20px;">
          <span class="material-icons-round" style="font-size:48px;color:#e74c3c;">error</span>
          <h3 style="color:#e74c3c;margin:12px 0;">Error Loading Orders</h3>
          <p style="color:var(--text-secondary);">${error.message}</p>
          <button class="btn btn-primary" style="margin-top:16px;" onclick="app.navigate('orders')">Retry</button>
        </div>
      `;
    }
  },

  renderRows(orders) {
    if (!orders || orders.length === 0) {
      return '<tr><td colspan="8" class="text-center" style="padding:20px;color:var(--text-secondary);">No orders found</td></tr>';
    }
    return orders.map(order => {
      const isFree = order.freeShipping || order.deliveryCharge === 0;
      return `
      <tr>
        <td><input type="checkbox" class="order-check" value="${order.id}"></td>
        <td><strong>${order.parcelId}</strong></td>
        <td>${order.customerName}</td>
        <td>${order.mobile}</td>
        <td>৳${order.codAmount.toFixed(2)}</td>
        <td>${isFree ? '<span style="color:#1C6B20;font-weight:600;font-size:11px;">FREE</span>' : '৳' + (order.deliveryCharge || 0).toFixed(2)}</td>
        <td><span class="badge-status ${order.status}">${order.status}</span></td>
        <td>
          <div class="flex" style="gap:4px;flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" onclick="window.orders.editOrder('${order.id}')">
              <span class="material-icons-round" style="font-size:16px;">edit</span>
            </button>
            <button class="btn btn-danger btn-sm" onclick="window.orders.deleteOrder('${order.id}')">
              <span class="material-icons-round" style="font-size:16px;">delete</span>
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.orders.printLabel('${order.id}')">
              <span class="material-icons-round" style="font-size:16px;">print</span>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  async search(query) {
    try {
      const results = await parcel.searchOrders(query);
      const tbody = document.getElementById('ordersTableBody');
      if (tbody) {
        tbody.innerHTML = this.renderRows(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  },

  toggleAll(checked) {
    document.querySelectorAll('.order-check').forEach(cb => cb.checked = checked);
  },

  showAddForm() {
    this.showForm(null);
  },

  async editOrder(id) {
    try {
      const order = await parcel.getOrder(id);
      if (order) {
        this.showForm(order);
      }
    } catch (error) {
      console.error('Edit order error:', error);
      alert('Error loading order: ' + error.message);
    }
  },

  showForm(order) {
    const isEdit = !!order;
    const isFree = order ? (order.freeShipping || order.deliveryCharge === 0) : false;
    const container = document.getElementById('pageContainer');
    
    container.innerHTML = `
      <div class="card">
        <h3 style="margin-bottom:16px;">${isEdit ? 'Edit' : 'New'} Order</h3>
        <form id="orderForm" onsubmit="window.orders.saveOrder(event)">
          <input type="hidden" name="id" value="${isEdit ? order.id : ''}">
          <div class="grid-2">
            <div class="form-group">
              <label>Customer Name *</label>
              <input type="text" name="customerName" class="form-control" 
                     value="${isEdit ? order.customerName : ''}" required placeholder="Enter customer name">
            </div>
            <div class="form-group">
              <label>Mobile Number *</label>
              <input type="tel" name="mobile" class="form-control" 
                     value="${isEdit ? order.mobile : ''}" required placeholder="01XXXXXXXXX">
            </div>
            <div class="form-group" style="grid-column:span 2;">
              <label>Address *</label>
              <input type="text" name="address" class="form-control" 
                     value="${isEdit ? order.address : ''}" required placeholder="Enter full address">
            </div>
            <div class="form-group">
              <label>District</label>
              <input type="text" name="district" class="form-control" 
                     value="${isEdit ? order.district : ''}" placeholder="Enter district">
            </div>
            <div class="form-group">
              <label>Area</label>
              <input type="text" name="area" class="form-control" 
                     value="${isEdit ? order.area : ''}" placeholder="Enter area">
            </div>
            <div class="form-group">
              <label>Delivery Charge (BDT)</label>
              <input type="number" name="deliveryCharge" class="form-control" step="0.01" 
                     value="${isEdit && !isFree ? order.deliveryCharge : ''}" placeholder="0.00" 
                     ${isFree ? 'disabled style="opacity:0.6;"' : ''}>
              <div style="margin-top:6px;">
                <label style="display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer;">
                  <input type="checkbox" name="freeShipping" id="freeShippingCheckbox" 
                         ${isFree ? 'checked' : ''} 
                         onchange="window.orders.toggleFreeShipping(this.checked)">
                  <span>☑ Free Shipping (Delivery Charge = 0 BDT)</span>
                </label>
              </div>
            </div>
            <div class="form-group">
              <label>COD Amount (BDT) *</label>
              <input type="number" name="codAmount" class="form-control" step="0.01" 
                     value="${isEdit ? order.codAmount : ''}" required placeholder="0.00">
            </div>
            <div class="form-group">
              <label>Product Name</label>
              <input type="text" name="productName" class="form-control" 
                     value="${isEdit ? order.productName : ''}" placeholder="Product name">
            </div>
            <div class="form-group">
              <label>Quantity</label>
              <input type="number" name="quantity" class="form-control" 
                     value="${isEdit ? order.quantity : 1}" min="1">
            </div>
            <div class="form-group">
              <label>Status</label>
              <select name="status" class="form-control">
                <option value="pending" ${isEdit && order.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="delivered" ${isEdit && order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                <option value="cancelled" ${isEdit && order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Note</label>
            <textarea name="note" class="form-control" rows="2" placeholder="Optional notes">${isEdit ? order.note : ''}</textarea>
          </div>
          <div class="flex flex-wrap gap-8" style="margin-top:16px;">
            <button type="submit" class="btn btn-primary">
              <span class="material-icons-round">save</span> ${isEdit ? 'Update' : 'Save'} Order
            </button>
            <button type="button" class="btn btn-secondary" onclick="app.navigate('orders')">Cancel</button>
          </div>
        </form>
      </div>
    `;
  },

  toggleFreeShipping(checked) {
    const deliveryInput = document.querySelector('input[name="deliveryCharge"]');
    if (checked) {
      deliveryInput.value = '0';
      deliveryInput.disabled = true;
      deliveryInput.style.opacity = '0.6';
    } else {
      deliveryInput.disabled = false;
      deliveryInput.style.opacity = '1';
      deliveryInput.value = '';
      deliveryInput.focus();
    }
  },

  async saveOrder(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    data.freeShipping = document.getElementById('freeShippingCheckbox')?.checked || false;
    
    if (!data.customerName || !data.mobile || !data.address || !data.codAmount) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      if (data.id) {
        await parcel.updateOrder(data.id, data);
      } else {
        await parcel.createOrder(data);
      }
      app.navigate('orders');
    } catch (error) {
      alert('Error saving order: ' + error.message);
    }
  },

  async deleteOrder(id) {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await parcel.deleteOrder(id);
        app.navigate('orders');
      } catch (error) {
        alert('Error deleting order: ' + error.message);
      }
    }
  },

  async printLabel(id) {
    try {
      const order = await parcel.getOrder(id);
      if (order) {
        printManager.printLabel(order);
      }
    } catch (error) {
      alert('Error printing: ' + error.message);
    }
  },

  async bulkPrint() {
    const checked = document.querySelectorAll('.order-check:checked');
    if (checked.length === 0) {
      alert('Please select at least one order');
      return;
    }
    
    try {
      const ids = Array.from(checked).map(cb => cb.value);
      const orders = await Promise.all(ids.map(id => parcel.getOrder(id)));
      printManager.printLabels(orders.filter(o => o));
    } catch (error) {
      alert('Error printing: ' + error.message);
    }
  },

  async importExcel() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const data = await excelImporter.parseFile(file);
          const result = await this.importOrders(data);
          alert(`Imported ${result.success} orders successfully. ${result.errors} errors.`);
          app.navigate('orders');
        } catch (error) {
          alert('Import error: ' + error.message);
        }
      }
    };
    input.click();
  },

  async importOrders(rows) {
    let success = 0;
    let errors = 0;
    
    for (const row of rows) {
      try {
        await parcel.createOrder({
          customerName: row.customerName || row['Customer Name'] || '',
          mobile: row.mobile || row['Mobile'] || '',
          address: row.address || row['Address'] || '',
          district: row.district || row['District'] || '',
          area: row.area || row['Area'] || '',
          deliveryCharge: parseFloat(row.deliveryCharge || row['Delivery Charge'] || 0),
          codAmount: parseFloat(row.codAmount || row['COD Amount'] || 0),
          productName: row.productName || row['Product Name'] || '',
          quantity: parseInt(row.quantity || row['Quantity'] || 1),
          note: row.note || row['Note'] || '',
          freeShipping: row.freeShipping === 'true' || row.freeShipping === 'yes' || row['Free Shipping'] === 'true'
        });
        success++;
      } catch (e) {
        errors++;
      }
    }
    
    return { success, errors };
  }
};

// Make orders globally accessible
window.orders = orders;