// Main Application Controller - Complete Rewrite
class App {
  constructor() {
    this.currentPage = 'dashboard';
    this.isDark = localStorage.getItem('theme') === 'dark';
    this.sidebarOpen = window.innerWidth >= 768;
    this.isOnline = navigator.onLine;
    this.deferredPrompt = null;
    this.isReady = false;
    
    // Bind methods
    this.init = this.init.bind(this);
    this.navigate = this.navigate.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.toggleTheme = this.toggleTheme.bind(this);
    
    // Start initialization
    this.init();
  }

  async init() {
    try {
      console.log('App initializing...');
      
      // Set initial theme
      if (this.isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').querySelector('.material-icons-round').textContent = 'light_mode';
      }
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Initialize database
      console.log('Initializing database...');
      await db.init();
      await db.ensureSettings();
      console.log('Database ready');
      
      // Create overlay for mobile
      this.createOverlay();
      
      // Update online status
      this.updateOnlineStatus(this.isOnline);
      
      // Initialize all page controllers
      this.initPages();
      
      // Load initial page
      console.log('Loading dashboard...');
      await this.navigate('dashboard');
      
      this.isReady = true;
      console.log('App ready');
      
      // Show install prompt if available
      this.showInstallPrompt();
      
    } catch (error) {
      console.error('App initialization error:', error);
      const container = document.getElementById('pageContainer');
      container.innerHTML = `
        <div class="card" style="text-align:center;padding:40px;margin:20px;">
          <span class="material-icons-round" style="font-size:48px;color:#e74c3c;">error</span>
          <h3 style="color:#e74c3c;margin:12px 0;">Application Error</h3>
          <p style="color:var(--text-secondary);">${error.message || 'Failed to initialize application'}</p>
          <p style="color:var(--text-secondary);font-size:12px;margin-top:8px;">Please refresh the page or try again later.</p>
          <button class="btn btn-primary" style="margin-top:16px;" onclick="location.reload()">Reload Application</button>
        </div>
      `;
    }
  }

  initPages() {
    // Initialize all page controllers and make them globally accessible
    window.orders = orders;
    window.reports = reports;
    window.settings = settings;
    window.dashboard = dashboard;
    window.parcel = parcel;
    window.printManager = printManager;
    window.excelImporter = excelImporter;
    window.excelExporter = excelExporter;
    window.barcodeGenerator = barcodeGenerator;
    window.qrGenerator = qrGenerator;
    
    console.log('All pages initialized');
  }

  setupEventListeners() {
    // Menu toggle
    document.getElementById('menuToggle').addEventListener('click', this.toggleSidebar);
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', this.toggleTheme);
    
    // Print button
    document.getElementById('printBtn').addEventListener('click', () => window.print());
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        this.navigate(page);
      });
    });
    
    // Resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth >= 768) {
          this.sidebarOpen = true;
          document.getElementById('sidebar')?.classList.add('open');
          document.querySelector('.sidebar-overlay')?.classList.remove('active');
        } else {
          this.sidebarOpen = false;
          document.getElementById('sidebar')?.classList.remove('open');
          document.querySelector('.sidebar-overlay')?.classList.remove('active');
        }
      }, 250);
    });
    
    // Online/Offline
    window.addEventListener('online', () => this.updateOnlineStatus(true));
    window.addEventListener('offline', () => this.updateOnlineStatus(false));
    
    // Install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });
  }

  createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.addEventListener('click', this.closeSidebar.bind(this));
    document.body.appendChild(overlay);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (this.sidebarOpen) {
      sidebar?.classList.add('open');
      overlay?.classList.add('active');
    } else {
      sidebar?.classList.remove('open');
      overlay?.classList.remove('active');
    }
  }

  closeSidebar() {
    this.sidebarOpen = false;
    document.getElementById('sidebar')?.classList.remove('open');
    document.querySelector('.sidebar-overlay')?.classList.remove('active');
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
    const icon = document.getElementById('themeToggle').querySelector('.material-icons-round');
    icon.textContent = this.isDark ? 'light_mode' : 'dark_mode';
  }

  updateOnlineStatus(online) {
    this.isOnline = online;
    const badge = document.getElementById('onlineBadge');
    if (badge) {
      if (online) {
        badge.className = 'badge online';
        badge.innerHTML = '<span class="material-icons-round">wifi</span> Online';
      } else {
        badge.className = 'badge offline';
        badge.innerHTML = '<span class="material-icons-round">wifi_off</span> Offline';
      }
    }
  }

  showInstallPrompt() {
    if (!this.deferredPrompt) return;
    
    if (localStorage.getItem('installPromptShown')) return;
    
    const banner = document.createElement('div');
    banner.className = 'install-banner';
    banner.innerHTML = `
      <div class="install-banner-content" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
        <span style="font-size:14px;font-weight:500;">📱 Install Chapai Haat App</span>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-primary btn-sm" id="installBtn">Install</button>
          <button class="btn btn-secondary btn-sm" id="dismissInstall">×</button>
        </div>
      </div>
    `;
    banner.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--surface);
      padding: 12px 16px;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
      z-index: 9999;
      border-top: 2px solid var(--secondary);
      backdrop-filter: blur(10px);
    `;
    document.body.appendChild(banner);
    
    document.getElementById('installBtn')?.addEventListener('click', async () => {
      try {
        const result = await this.deferredPrompt.prompt();
        if (result.outcome === 'accepted') {
          console.log('App installed');
          localStorage.setItem('installPromptShown', 'true');
        }
        banner.remove();
        this.deferredPrompt = null;
      } catch (error) {
        console.error('Install error:', error);
        banner.remove();
      }
    });
    
    document.getElementById('dismissInstall')?.addEventListener('click', () => {
      banner.remove();
      localStorage.setItem('installPromptShown', 'true');
    });
  }

  async navigate(page) {
    try {
      console.log('Navigating to:', page);
      
      this.currentPage = page;
      
      // Update navigation
      document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.page === page);
      });
      
      // Update title
      const titles = {
        dashboard: 'Dashboard',
        orders: 'Orders',
        reports: 'Reports',
        settings: 'Settings'
      };
      document.getElementById('pageTitle').textContent = titles[page] || page.charAt(0).toUpperCase() + page.slice(1);
      
      // Close sidebar on mobile
      if (window.innerWidth < 768) {
        this.closeSidebar();
      }
      
      // Show loading
      const container = document.getElementById('pageContainer');
      container.innerHTML = `
        <div class="text-center" style="padding:40px;">
          <span class="material-icons-round" style="font-size:40px;color:var(--secondary);animation:spin 1s linear infinite;">refresh</span>
          <p style="margin-top:12px;color:var(--text-secondary);">Loading ${titles[page] || page}...</p>
        </div>
      `;
      
      // Wait for page controller to be available
      await this.waitForPageController(page);
      
      // Load page
      switch(page) {
        case 'dashboard':
          await window.dashboard.render();
          break;
        case 'orders':
          await window.orders.render();
          break;
        case 'reports':
          await window.reports.render();
          break;
        case 'settings':
          await window.settings.render();
          break;
        default:
          await window.dashboard.render();
      }
      
      console.log('Page loaded:', page);
      
    } catch (error) {
      console.error('Navigation error:', error);
      const container = document.getElementById('pageContainer');
      container.innerHTML = `
        <div class="card" style="text-align:center;padding:40px;margin:20px;">
          <span class="material-icons-round" style="font-size:48px;color:#e74c3c;">error</span>
          <h3 style="color:#e74c3c;margin:12px 0;">Error Loading Page</h3>
          <p style="color:var(--text-secondary);">${error.message || 'Unknown error'}</p>
          <button class="btn btn-primary" style="margin-top:16px;" onclick="app.navigate('${page}')">Retry</button>
        </div>
      `;
    }
  }

  waitForPageController(page) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const controllers = {
          dashboard: window.dashboard,
          orders: window.orders,
          reports: window.reports,
          settings: window.settings
        };
        
        if (controllers[page]) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 5000);
    });
  }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new App();
  window.app = app;
});

// CSS for loading spinner
if (!document.getElementById('spin-style')) {
  const style = document.createElement('style');
  style.id = 'spin-style';
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}