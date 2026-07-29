// Settings Page Controller
const settings = {
  async render() {
    try {
      console.log('Settings rendering...');
      const container = document.getElementById('pageContainer');
      const settingsData = await db.getSettings();
      const defaults = await db.getDefaultSettings();
      
      container.innerHTML = `
        <div class="settings-page">
          <div class="grid-2">
            <div class="card">
              <h3 style="margin-bottom:16px;">Company Settings</h3>
              <form id="settingsForm" onsubmit="window.settings.saveSettings(event)">
                <div class="form-group">
                  <label>Company Name</label>
                  <input type="text" name="companyName" class="form-control" 
                         value="${settingsData.companyName || defaults.companyName}">
                </div>
                <div class="form-group">
                  <label>Address</label>
                  <textarea name="address" class="form-control" rows="3">${settingsData.address || defaults.address}</textarea>
                </div>
                <div class="form-group">
                  <label>Phone</label>
                  <input type="text" name="phone" class="form-control" 
                         value="${settingsData.phone || defaults.phone}">
                </div>
                <button type="submit" class="btn btn-primary">Save Settings</button>
              </form>
            </div>
            
            <div class="card">
              <h3 style="margin-bottom:16px;">Data Management</h3>
              <div style="display:flex;flex-direction:column;gap:10px;">
                <button class="btn btn-secondary" onclick="window.settings.backupData()">
                  <span class="material-icons-round">backup</span> Backup Database
                </button>
                <button class="btn btn-secondary" onclick="window.settings.restoreData()">
                  <span class="material-icons-round">restore</span> Restore Database
                </button>
                <button class="btn btn-danger" onclick="window.settings.resetDatabase()">
                  <span class="material-icons-round">delete_forever</span> Reset Database
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Settings render error:', error);
      const container = document.getElementById('pageContainer');
      container.innerHTML = `
        <div class="card" style="text-align:center;padding:40px;margin:20px;">
          <span class="material-icons-round" style="font-size:48px;color:#e74c3c;">error</span>
          <h3 style="color:#e74c3c;margin:12px 0;">Error Loading Settings</h3>
          <p style="color:var(--text-secondary);">${error.message}</p>
          <button class="btn btn-primary" style="margin-top:16px;" onclick="app.navigate('settings')">Retry</button>
        </div>
      `;
    }
  },

  async saveSettings(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    try {
      for (const [key, value] of formData.entries()) {
        await db.updateSetting(key, value);
      }
      alert('Settings saved successfully');
      app.navigate('settings');
    } catch (error) {
      alert('Error saving settings: ' + error.message);
    }
  },

  async backupData() {
    try {
      const data = await db.backup();
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chapai-haat-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      alert('Backup downloaded successfully');
    } catch (error) {
      alert('Backup error: ' + error.message);
    }
  },

  async restoreData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          await db.restore(data);
          alert('Database restored successfully');
          app.navigate('settings');
        } catch (error) {
          alert('Restore error: ' + error.message);
        }
      }
    };
    input.click();
  },

  async resetDatabase() {
    if (confirm('WARNING: This will delete ALL data. Are you sure?')) {
      if (confirm('This cannot be undone. Confirm again?')) {
        try {
          await db.resetDatabase();
          alert('Database reset successfully. The page will reload.');
          location.reload();
        } catch (error) {
          alert('Reset error: ' + error.message);
        }
      }
    }
  }
};

// Make settings globally accessible
window.settings = settings;