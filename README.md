# Chapai Haat Parcel & Order Management System

## চাঁপাই হাট - Complete Offline-First PWA

A production-ready Progressive Web App for managing parcels and orders for Chapai Haat e-commerce business.

### Features

- 📊 **Dashboard** - Real-time statistics, charts, and recent orders
- 📦 **Order Management** - Create, edit, delete, and search orders
- 🏷️ **Parcel Labels** - Professional courier-style labels with barcode & QR
- 📈 **Reports** - Daily, monthly, yearly reports with export
- 💾 **Offline-First** - Works without internet using IndexedDB
- 🔄 **Data Management** - Backup, restore, and reset database
- 🌙 **Dark/Light Mode** - Theme toggle with glassmorphism UI
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- 🖨️ **Print Support** - A4 and thermal label printing
- 📤 **Import/Export** - CSV/XLSX import and Excel export

### Installation

1. **Download** all files to a web server or local folder
2. **Open** `index.html` in a modern browser (Chrome, Edge, Firefox)
3. **Install** as PWA when prompted (or use browser's install option)

### Usage

#### Adding an Order
1. Go to **Orders** page
2. Click **New Order**
3. Fill in customer details
4. Click **Save Order**
5. Parcel ID (CH000001) is auto-generated

#### Printing Labels
1. In **Orders**, find the order
2. Click the **Print** icon (🖨️) for single label
3. Use **Bulk Print** for multiple labels

#### Reports
1. Go to **Reports** page
2. Select **Daily**, **Monthly**, or **Yearly**
3. View statistics and order list
4. Export to Excel or PDF

#### Settings
- Update company name, address, phone
- Backup/Restore database
- Reset all data

### Database Structure

**Orders Store:**
- `id` - Unique order ID
- `parcelId` - Auto-generated (CH000001)
- `customerName`, `mobile`, `address`, `district`, `area`
- `deliveryCharge`, `codAmount`
- `productName`, `quantity`, `note`
- `status` - pending/delivered/cancelled
- `createdAt`, `updatedAt`

**Settings Store:**
- companyName, address, phone, currency

**Sequence Store:**
- Tracks next parcel ID number

### File Structure
