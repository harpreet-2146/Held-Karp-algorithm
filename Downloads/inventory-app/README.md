# Inventory Pro - Manufacturer-Retailer Management System

A comprehensive inventory management system for manufacturers who distribute products through retail partners on a consignment basis.

## 🎯 Features

### For Admin/Manufacturer
- **Dashboard** - Overview of factory stock, partner stock, sales, and receivables
- **Products** - Manage product catalog with MRP, units per packet, and commission splits
- **Partners** - Manage retail partners and view their performance
- **Inventory** - Track production and factory stock levels
- **Dispatch** - Process stock requests (approve/reject/dispatch)
- **Damages** - Review and approve damage reports
- **Reports** - Sales, partner, and product performance reports

### For Partners (Retailers)
- **Dashboard** - View stock levels, sales, earnings, and amounts owed
- **My Stock** - Track inventory received and current stock
- **Record Sale** - Record packet sales with automatic commission calculation
- **My Requests** - Request new stock and confirm receipt
- **Report Damage** - Report damaged goods for replacement

## 🎨 Design System

### Color Palette
- **Charcoal** `#29281E` - Primary dark background
- **Olive** `#857861` - Secondary/accent color
- **Cream** `#E7D4BB` - Card backgrounds, light text
- **Burgundy** `#48252F` - Danger/alert color
- **Black** `#101211` - Text on light surfaces

### Typography
- **Display**: Playfair Display (headings)
- **Body**: DM Sans (body text)
- **Mono**: JetBrains Mono (numbers, code)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd inventory-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
inventory-app/
├── src/
│   ├── components/        # Reusable UI components
│   │   └── UI.jsx         # Badge, Modal, StatCard, etc.
│   ├── context/           # React Context for state
│   │   └── AppContext.jsx # Global state management
│   ├── data/              # Mock data and models
│   │   └── mockData.js    # Initial data & constants
│   ├── layouts/           # Page layouts
│   │   └── MainLayout.jsx # Main layout with navbar
│   ├── pages/             # All page components
│   │   ├── LoginPage.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── ProductsPage.jsx
│   │   ├── PartnersPage.jsx
│   │   ├── InventoryPage.jsx
│   │   ├── DispatchPage.jsx
│   │   ├── DamagesPage.jsx
│   │   ├── ReportsPage.jsx
│   │   ├── PartnerDashboard.jsx
│   │   ├── MyStockPage.jsx
│   │   ├── RecordSalePage.jsx
│   │   ├── MyRequestsPage.jsx
│   │   └── ReportDamagePage.jsx
│   ├── utils/             # Utility functions
│   │   └── calculations.js # All business logic
│   ├── App.jsx            # Main app with routing
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## 🔐 User Roles

1. **Admin** - Full control over everything
   - Can modify product pricing, units per packet
   - Can add/edit partners
   - All manufacturer permissions

2. **Manufacturer** - Operational control
   - Record production
   - Dispatch stock
   - Approve/reject requests
   - View all reports

3. **Partner** - Retail partner
   - View their own stock
   - Record sales (packet-wise)
   - Request new stock
   - Report damages

## 📊 Business Logic

### Inventory Flow
```
Production → Factory Stock → Dispatch → Partner Stock → Sale
```

### Dispatch Lifecycle
```
Pending → Approved → Dispatched → Received
       ↘ Rejected (end)
```

### Financial Calculation
- Sales are recorded in **packets**
- Revenue = packets × units_per_packet × MRP
- Manufacturer share = revenue × manufacturer_share_pct
- Partner commission = revenue × partner_share_pct
- Amount owed = sum(manufacturer_shares) - sum(payments)

## 🛠 Tech Stack

- **React 18** - UI framework
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **date-fns** - Date formatting
- **Vite** - Build tool

## 📝 License

MIT
