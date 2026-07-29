// IndexedDB wrapper for Chapai Haat - Fixed version
class ChapaiDB {
  constructor() {
    this.dbName = 'ChapaiHaatDB';
    this.version = 1; // Reset to version 1 to avoid upgrade errors
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      // Check if database exists and handle version properly
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = (event) => {
        console.error('Database error:', event.target.error);
        reject(event.target.error);
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('Database connected successfully');
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('Database upgrade needed...');
        
        // Create orders store
        if (!db.objectStoreNames.contains('orders')) {
          const store = db.createObjectStore('orders', { keyPath: 'id' });
          store.createIndex('parcelId', 'parcelId', { unique: true });
          store.createIndex('mobile', 'mobile', { unique: false });
          store.createIndex('customerName', 'customerName', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('status', 'status', { unique: false });
          console.log('Orders store created');
        }
        
        // Create settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
          console.log('Settings store created');
        }
        
        // Create sequence store
        if (!db.objectStoreNames.contains('sequence')) {
          db.createObjectStore('sequence', { keyPath: 'id' });
          console.log('Sequence store created');
        }
      };
    });
  }

  async add(storeName, data) {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  async put(storeName, data) {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  async get(storeName, id) {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getAll(storeName, indexName = null, value = null) {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        let request;
        
        if (indexName && value !== null) {
          const index = store.index(indexName);
          request = index.getAll(value);
        } else {
          request = store.getAll();
        }
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  async clear(storeName) {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(value);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  async searchOrders(query) {
    try {
      const allOrders = await this.getAll('orders');
      if (!query || query.trim() === '') return allOrders;
      
      const q = query.toLowerCase().trim();
      return allOrders.filter(order => {
        return order.parcelId.toLowerCase().includes(q) ||
               order.mobile.includes(q) ||
               order.customerName.toLowerCase().includes(q);
      });
    } catch (error) {
      console.error('Search orders error:', error);
      return [];
    }
  }

  async getNextParcelId() {
    try {
      const seq = await this.get('sequence', 'parcel');
      let nextNum = 1;
      if (seq) {
        nextNum = seq.value + 1;
      }
      const newId = `CH${String(nextNum).padStart(6, '0')}`;
      await this.put('sequence', { id: 'parcel', value: nextNum });
      return newId;
    } catch (error) {
      console.error('Get next parcel ID error:', error);
      // Fallback: generate based on timestamp
      return `CH${Date.now().toString().slice(-6)}`;
    }
  }

  async getSettings() {
    try {
      const settings = {};
      const all = await this.getAll('settings');
      all.forEach(item => {
        settings[item.key] = item.value;
      });
      return settings;
    } catch (error) {
      console.error('Get settings error:', error);
      return {};
    }
  }

  async updateSetting(key, value) {
    try {
      await this.put('settings', { key, value });
    } catch (error) {
      console.error('Update setting error:', error);
    }
  }

  async getDefaultSettings() {
    return {
      companyName: 'Chapai Haat - চাঁপাই হাট',
      address: 'Monakasha Bazar, Shibganj, Chapainawabganj, Rajshahi, Bangladesh',
      phone: '01325940272',
      currency: 'BDT'
    };
  }

  async ensureSettings() {
    try {
      const defaults = await this.getDefaultSettings();
      for (const [key, value] of Object.entries(defaults)) {
        const existing = await this.get('settings', key);
        if (!existing) {
          await this.updateSetting(key, value);
        }
      }
    } catch (error) {
      console.error('Ensure settings error:', error);
    }
  }

  async backup() {
    try {
      const orders = await this.getAll('orders');
      const settings = await this.getAll('settings');
      const sequence = await this.get('sequence', 'parcel');
      return { orders, settings, sequence, backupDate: new Date().toISOString() };
    } catch (error) {
      console.error('Backup error:', error);
      throw error;
    }
  }

  async restore(data) {
    try {
      await this.clear('orders');
      await this.clear('settings');
      await this.clear('sequence');
      
      if (data.orders) {
        for (const order of data.orders) {
          await this.add('orders', order);
        }
      }
      if (data.settings) {
        for (const setting of data.settings) {
          await this.add('settings', setting);
        }
      }
      if (data.sequence) {
        await this.add('sequence', data.sequence);
      }
    } catch (error) {
      console.error('Restore error:', error);
      throw error;
    }
  }

  // Reset database (delete and recreate)
  async resetDatabase() {
    return new Promise((resolve, reject) => {
      try {
        // Close existing connection
        if (this.db) {
          this.db.close();
          this.db = null;
        }
        
        // Delete the database
        const deleteRequest = indexedDB.deleteDatabase(this.dbName);
        deleteRequest.onsuccess = () => {
          console.log('Database deleted successfully');
          resolve();
        };
        deleteRequest.onerror = () => {
          reject(deleteRequest.error);
        };
        deleteRequest.onblocked = () => {
          console.log('Database delete blocked - close other tabs');
          // Try again after a delay
          setTimeout(() => {
            indexedDB.deleteDatabase(this.dbName);
          }, 1000);
        };
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Global instance
const db = new ChapaiDB();

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('Initializing database...');
    await db.init();
    await db.ensureSettings();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('DB init error:', error);
    // Show error but don't crash the app
    const container = document.getElementById('pageContainer');
    if (container) {
      container.innerHTML = `
        <div class="card" style="text-align:center;padding:40px;margin:20px;">
          <span class="material-icons-round" style="font-size:48px;color:#e74c3c;">database</span>
          <h3 style="color:#e74c3c;margin:12px 0;">Database Error</h3>
          <p style="color:var(--text-secondary);">${error.message || 'Failed to initialize database'}</p>
          <div style="margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="location.reload()">Reload</button>
            <button class="btn btn-danger" onclick="window.resetDatabase()">Reset Database</button>
          </div>
          <p style="color:var(--text-secondary);font-size:12px;margin-top:12px;">
            If the problem persists, try clearing your browser data or using a different browser.
          </p>
        </div>
      `;
    }
  }
});

// Reset database function (expose globally)
window.resetDatabase = async function() {
  if (confirm('WARNING: This will delete ALL data. Are you sure?')) {
    if (confirm('This cannot be undone. Confirm again?')) {
      try {
        await db.resetDatabase();
        alert('Database reset successfully. The page will reload.');
        location.reload();
      } catch (error) {
        alert('Error resetting database: ' + error.message);
      }
    }
  }
};