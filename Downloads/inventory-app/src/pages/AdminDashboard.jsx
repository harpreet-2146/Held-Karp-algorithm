// ============================================
// ADMIN/MANUFACTURER DASHBOARD PAGE
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Users, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  Send,
  ArrowRight,
  Factory,
  ShoppingCart
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatCard, Badge } from '../components/UI';
import { 
  getOverallStats, 
  formatCurrency, 
  formatNumber,
  formatDate,
  calculateSaleRevenue
} from '../utils/calculations';

const AdminDashboard = () => {
  const { 
    products, 
    partners, 
    production, 
    dispatchRequests, 
    sales, 
    damageReports, 
    payments 
  } = useApp();
  
  // Calculate overall stats
  const stats = getOverallStats(
    products, 
    partners, 
    production, 
    dispatchRequests, 
    sales, 
    damageReports, 
    payments
  );
  
  // Get recent pending requests
  const pendingRequests = dispatchRequests
    .filter(d => d.status === 'pending')
    .slice(0, 5);
  
  // Get recent sales
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))
    .slice(0, 5);
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Overview of your inventory and business metrics
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/inventory" className="btn btn-secondary">
            <Factory className="w-5 h-5" />
            <span>Record Production</span>
          </Link>
          <Link to="/dispatch" className="btn btn-primary">
            <Send className="w-5 h-5" />
            <span>Dispatch Stock</span>
          </Link>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/inventory">
          <StatCard
            icon={Package}
            value={formatNumber(stats.totalFactoryStock)}
            label="Factory Stock (packets)"
          />
        </Link>
        
        <Link to="/partners">
          <StatCard
            icon={Users}
            value={formatNumber(stats.totalPartnerStock)}
            label="Stock at Partners (packets)"
          />
        </Link>
        
        <Link to="/reports">
          <StatCard
            icon={ShoppingCart}
            value={formatNumber(stats.totalPacketsSold)}
            label="Total Packets Sold"
          />
        </Link>
        
        <Link to="/reports">
          <StatCard
            icon={DollarSign}
            value={formatCurrency(stats.totalReceivables)}
            label="Amount Receivable"
          />
        </Link>
      </div>
      
      {/* Alerts Section */}
      {(stats.pendingRequests > 0 || stats.pendingDamages > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.pendingRequests > 0 && (
            <Link 
              to="/dispatch"
              className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-card hover:bg-amber-500/15 transition-colors"
            >
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-cream">
                  {stats.pendingRequests} Pending Request{stats.pendingRequests > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-olive">Stock requests awaiting approval</p>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-400" />
            </Link>
          )}
          
          {stats.pendingDamages > 0 && (
            <Link 
              to="/damages"
              className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-card hover:bg-red-500/15 transition-colors"
            >
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-cream">
                  {stats.pendingDamages} Damage Report{stats.pendingDamages > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-olive">Reports requiring review</p>
              </div>
              <ArrowRight className="w-5 h-5 text-red-400" />
            </Link>
          )}
        </div>
      )}
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Dispatch Requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-black">
              Pending Requests
            </h2>
            <Link 
              to="/dispatch" 
              className="text-sm font-medium text-olive hover:text-black flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {pendingRequests.length === 0 ? (
            <div className="py-8 text-center">
              <Send className="w-10 h-10 text-olive/30 mx-auto mb-3" />
              <p className="text-olive">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(request => {
                const partner = partners.find(p => p.id === request.partnerId);
                const product = products.find(p => p.id === request.productId);
                
                return (
                  <div 
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-olive/5 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-black">
                        {partner?.name}
                      </p>
                      <p className="text-sm text-olive">
                        {request.packetsRequested} packets of {product?.name}
                      </p>
                    </div>
                    <Badge status="pending">Pending</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Recent Sales */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-black">
              Recent Sales
            </h2>
            <Link 
              to="/reports" 
              className="text-sm font-medium text-olive hover:text-black flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {recentSales.length === 0 ? (
            <div className="py-8 text-center">
              <ShoppingCart className="w-10 h-10 text-olive/30 mx-auto mb-3" />
              <p className="text-olive">No sales recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSales.map(sale => {
                const partner = partners.find(p => p.id === sale.partnerId);
                const product = products.find(p => p.id === sale.productId);
                const revenue = calculateSaleRevenue(sale, product);
                
                return (
                  <div 
                    key={sale.id}
                    className="flex items-center justify-between p-4 bg-olive/5 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-black">
                        {partner?.name}
                      </p>
                      <p className="text-sm text-olive">
                        {sale.packetsSold} packets of {product?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-black">
                        {formatCurrency(revenue)}
                      </p>
                      <p className="text-sm text-olive">
                        {formatDate(sale.saleDate)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Inventory by Product */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-black">
            Inventory by Product
          </h2>
          <Link 
            to="/products" 
            className="text-sm font-medium text-olive hover:text-black flex items-center gap-1"
          >
            Manage Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>MRP</th>
                <th>Units/Packet</th>
                <th>Factory Stock</th>
                <th>At Partners</th>
                <th>Total Sold</th>
              </tr>
            </thead>
            <tbody>
              {products.filter(p => p.isActive).map(product => {
                const factoryStock = production
                  .filter(p => p.productId === product.id)
                  .reduce((sum, p) => sum + p.packetsProduced, 0) -
                  dispatchRequests
                    .filter(d => d.productId === product.id && ['dispatched', 'received'].includes(d.status))
                    .reduce((sum, d) => sum + (d.packetsApproved || 0), 0);
                
                const partnerStock = dispatchRequests
                  .filter(d => d.productId === product.id && d.status === 'received')
                  .reduce((sum, d) => sum + (d.packetsApproved || 0), 0) -
                  sales
                    .filter(s => s.productId === product.id)
                    .reduce((sum, s) => sum + s.packetsSold, 0) -
                  damageReports
                    .filter(d => d.productId === product.id && d.status === 'approved')
                    .reduce((sum, d) => sum + d.packetsDamaged, 0);
                
                const totalSold = sales
                  .filter(s => s.productId === product.id)
                  .reduce((sum, s) => sum + s.packetsSold, 0);
                
                return (
                  <tr key={product.id}>
                    <td>
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-olive">{product.description}</p>
                      </div>
                    </td>
                    <td className="font-mono">{formatCurrency(product.mrp)}</td>
                    <td>{product.unitsPerPacket} units</td>
                    <td>
                      <span className={`font-semibold ${factoryStock < 10 ? 'text-red-600' : 'text-black'}`}>
                        {formatNumber(factoryStock)} packets
                      </span>
                    </td>
                    <td>{formatNumber(partnerStock)} packets</td>
                    <td>{formatNumber(totalSold)} packets</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
