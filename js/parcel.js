// Parcel management module - Fixed
class ParcelManager {
  constructor() {
    this.db = db;
  }

  async createOrder(data) {
    try {
      const parcelId = await this.db.getNextParcelId();
      const freeShipping = data.freeShipping === 'on' || data.freeShipping === true;
      const deliveryCharge = freeShipping ? 0 : (parseFloat(data.deliveryCharge) || 0);
      
      const order = {
        id: Date.now().toString(),
        parcelId,
        customerName: data.customerName || '',
        mobile: data.mobile || '',
        address: data.address || '',
        district: data.district || '',
        area: data.area || '',
        deliveryCharge: deliveryCharge,
        codAmount: parseFloat(data.codAmount) || 0,
        productName: data.productName || '',
        quantity: parseInt(data.quantity) || 1,
        note: data.note || '',
        freeShipping: freeShipping,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await this.db.add('orders', order);
      return order;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  }

  async updateOrder(id, data) {
    try {
      const existing = await this.db.get('orders', id);
      if (!existing) throw new Error('Order not found');
      
      const freeShipping = data.freeShipping === 'on' || data.freeShipping === true || data.freeShipping === 'true';
      const deliveryCharge = freeShipping ? 0 : (parseFloat(data.deliveryCharge) || existing.deliveryCharge);
      
      const updated = {
        ...existing,
        customerName: data.customerName || existing.customerName,
        mobile: data.mobile || existing.mobile,
        address: data.address || existing.address,
        district: data.district || existing.district,
        area: data.area || existing.area,
        deliveryCharge: deliveryCharge,
        codAmount: parseFloat(data.codAmount) || existing.codAmount,
        productName: data.productName || existing.productName,
        quantity: parseInt(data.quantity) || existing.quantity,
        note: data.note || existing.note,
        freeShipping: freeShipping,
        status: data.status || existing.status,
        updatedAt: new Date().toISOString()
      };
      
      await this.db.put('orders', updated);
      return updated;
    } catch (error) {
      console.error('Update order error:', error);
      throw error;
    }
  }

  async deleteOrder(id) {
    try {
      await this.db.delete('orders', id);
    } catch (error) {
      console.error('Delete order error:', error);
      throw error;
    }
  }

  async getOrder(id) {
    try {
      return await this.db.get('orders', id);
    } catch (error) {
      console.error('Get order error:', error);
      throw error;
    }
  }

  async getAllOrders() {
    try {
      return await this.db.getAll('orders');
    } catch (error) {
      console.error('Get all orders error:', error);
      return [];
    }
  }

  async getOrdersByStatus(status) {
    try {
      return await this.db.getByIndex('orders', 'status', status);
    } catch (error) {
      console.error('Get orders by status error:', error);
      return [];
    }
  }

  async searchOrders(query) {
    try {
      return await this.db.searchOrders(query);
    } catch (error) {
      console.error('Search orders error:', error);
      return [];
    }
  }

  async getTodayOrders() {
    try {
      const all = await this.getAllOrders();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return all.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });
    } catch (error) {
      console.error('Get today orders error:', error);
      return [];
    }
  }

  async getStats() {
    try {
      const all = await this.getAllOrders();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayOrders = all.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });
      
      const totalCOD = all.reduce((sum, o) => sum + (o.codAmount || 0), 0);
      const todayCOD = todayOrders.reduce((sum, o) => sum + (o.codAmount || 0), 0);
      const totalRevenue = all.reduce((sum, o) => sum + (o.deliveryCharge || 0), 0);
      
      return {
        totalOrders: all.length,
        totalCOD,
        totalRevenue,
        todayOrders: todayOrders.length,
        todayCOD,
        pendingOrders: all.filter(o => o.status === 'pending').length,
        deliveredOrders: all.filter(o => o.status === 'delivered').length,
        cancelledOrders: all.filter(o => o.status === 'cancelled').length
      };
    } catch (error) {
      console.error('Get stats error:', error);
      return {
        totalOrders: 0,
        totalCOD: 0,
        totalRevenue: 0,
        todayOrders: 0,
        todayCOD: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0
      };
    }
  }

  async getDailyReport(date) {
    try {
      const all = await this.getAllOrders();
      const target = new Date(date);
      target.setHours(0, 0, 0, 0);
      
      return all.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === target.getTime();
      });
    } catch (error) {
      console.error('Get daily report error:', error);
      return [];
    }
  }

  async getMonthlyReport(year, month) {
    try {
      const all = await this.getAllOrders();
      return all.filter(order => {
        const date = new Date(order.createdAt);
        return date.getFullYear() === year && date.getMonth() === month;
      });
    } catch (error) {
      console.error('Get monthly report error:', error);
      return [];
    }
  }

  async getYearlyReport(year) {
    try {
      const all = await this.getAllOrders();
      return all.filter(order => {
        const date = new Date(order.createdAt);
        return date.getFullYear() === year;
      });
    } catch (error) {
      console.error('Get yearly report error:', error);
      return [];
    }
  }

  async getReportStats(orders) {
    try {
      return {
        totalOrders: orders.length,
        totalCOD: orders.reduce((sum, o) => sum + (o.codAmount || 0), 0),
        totalDelivery: orders.reduce((sum, o) => sum + (o.deliveryCharge || 0), 0),
        pending: orders.filter(o => o.status === 'pending').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        freeShipping: orders.filter(o => o.freeShipping).length
      };
    } catch (error) {
      console.error('Get report stats error:', error);
      return {
        totalOrders: 0,
        totalCOD: 0,
        totalDelivery: 0,
        pending: 0,
        delivered: 0,
        cancelled: 0,
        freeShipping: 0
      };
    }
  }
}

const parcel = new ParcelManager();