// ============================================
// PARTNER DASHBOARD PAGE
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Send,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatCard, Badge } from '../components/UI';
import { 
  formatCurrency, 
  formatNumber,
  formatDate,
  getPartnerStats,
  calculatePartnerStock,
  calculateSaleRevenue
} from '../utils/calculations';

const PartnerDashboard = () => {
  const { 
    currentPartnerId,
    products, 
    partners,
    dispatchRequests, 
    sales, 
    damageReports, 
    payments 
  } = useApp();
  
  const currentPartner = partners.find(p => p.id === currentPartnerId);
  
  // Get partner stats
  const stats = getPartnerStats(
    currentPartnerId,
    products,
    dispatchRequests,
    sales,
    damageReports,
    payments
  );
  
  // Get partner's pending requests
  const pendingRequests = dispatchRequests.filter(
    d => d.partnerId === currentPartnerId && d.status === 'pending'
  );
  
  // Get partner's dispatched (in transit) items
  const inTransit = dispatchRequests.filter(
    d => d.partnerId === currentPartnerId && d.status === 'dispatched'
  );
  
  // Get recent sales
  const recentSales = sales
    .filter(s => s.partnerId === currentPartnerId)
    .sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))
    .slice(0, 5);
  
  // Stock by product
  const stockByProduct = products.filter(p => p.isActive).map(product => ({
    ...product,
    stock: calculatePartnerStock(currentPartnerId, product.id, dispatchRequests, sales, damageReports)
  })).filter(p => p.stock > 0 || sales.some(s => s.partnerId === currentPartnerId && s.productId === p.id));
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {currentPartner?.name}</h1>
          <p className="page-subtitle">
            Manage your inventory and track sales performance
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/my-requests" className="btn btn-secondary">
            <Send className="w-5 h-5" />
            <span>Request Stock</span>
          </Link>
          <Link to="/record-sale" className="btn btn-primary">
            <ShoppingCart className="w-5 h-5" />
            <span>Record Sale</span>
          </Link>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/my-stock">
          <StatCard
            icon={Package}
            value={formatNumber(stats.totalStock)}
            label="My Stock (packets)"
          />
        </Link>
        
        <StatCard
          icon={ShoppingCart}
          value={formatNumber(stats.totalPacketsSold)}
          label="Total Sold (packets)"
        />
        
        <StatCard
          icon={TrendingUp}
          value={formatCurrency(stats.totalEarnings)}
          label="My Earnings (30%)"
        />
        
        <StatCard
          icon={DollarSign}
          value={formatCurrency(stats.amountOwed)}
          label="Amount to Pay"
        />
      </div>
      
      {/* Alerts Section */}
      {(inTransit.length > 0 || pendingRequests.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inTransit.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-card">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-cream">
                  {inTransit.length} Dispatch{inTransit.length > 1 ? 'es' : ''} In Transit
                </p>
                <p className="text-sm text-olive">Stock on the way to you</p>
              </div>
            </div>
          )}
          
          {pendingRequests.length > 0 && (
            <Link 
              to="/my-requests"
              className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-card hover:bg-amber-500/15 transition-colors"
            >
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-cream">
                  {pendingRequests.length} Pending Request{pendingRequests.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-olive">Awaiting approval</p>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-400" />
            </Link>
          )}
        </div>
      )}
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Stock */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-black">
              My Stock
            </h2>
            <Link 
              to="/my-stock" 
              className="text-sm font-medium text-olive hover:text-black flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {stockByProduct.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="w-10 h-10 text-olive/30 mx-auto mb-3" />
              <p className="text-olive">No stock available</p>
              <Link to="/my-requests" className="text-sm text-olive hover:text-black mt-2 inline-block">
                Request stock →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stockByProduct.slice(0, 4).map(product => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-olive/5 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-black">{product.name}</p>
                    <p className="text-sm text-olive">
                      {formatCurrency(product.mrp)} per unit
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${product.stock < 5 ? 'text-burgundy' : 'text-black'}`}>
                      {product.stock} packets
                    </p>
                    {product.stock < 5 && (
                      <Badge status="warning">Low Stock</Badge>
                    )}
                  </div>
                </div>
              ))}
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
              to="/record-sale" 
              className="text-sm font-medium text-olive hover:text-black flex items-center gap-1"
            >
              Record Sale <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {recentSales.length === 0 ? (
            <div className="py-8 text-center">
              <ShoppingCart className="w-10 h-10 text-olive/30 mx-auto mb-3" />
              <p className="text-olive">No sales recorded yet</p>
              <Link to="/record-sale" className="text-sm text-olive hover:text-black mt-2 inline-block">
                Record your first sale →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSales.map(sale => {
                const product = products.find(p => p.id === sale.productId);
                const revenue = calculateSaleRevenue(sale, product);
                const myShare = (revenue * product.partnerSharePct) / 100;
                
                return (
                  <div 
                    key={sale.id}
                    className="flex items-center justify-between p-4 bg-olive/5 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-black">{product?.name}</p>
                      <p className="text-sm text-olive">
                        {sale.packetsSold} packets • {formatDate(sale.saleDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-black">
                        {formatCurrency(revenue)}
                      </p>
                      <p className="text-sm text-emerald-600">
                        +{formatCurrency(myShare)} earned
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Financial Summary */}
      <div className="card">
        <h2 className="text-xl font-display font-bold text-black mb-6">
          Financial Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-olive/5 rounded-lg">
            <p className="text-3xl font-display font-bold text-black">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <p className="text-sm text-olive mt-1">Total Sales</p>
          </div>
          <div className="text-center p-4 bg-emerald-500/10 rounded-lg">
            <p className="text-3xl font-display font-bold text-emerald-600">
              {formatCurrency(stats.totalEarnings)}
            </p>
            <p className="text-sm text-olive mt-1">My Commission ({products[0]?.partnerSharePct || 30}%)</p>
          </div>
          <div className="text-center p-4 bg-blue-500/10 rounded-lg">
            <p className="text-3xl font-display font-bold text-blue-600">
              {formatCurrency(stats.totalPaid)}
            </p>
            <p className="text-sm text-olive mt-1">Total Paid</p>
          </div>
          <div className={`text-center p-4 rounded-lg ${stats.amountOwed > 0 ? 'bg-burgundy/10' : 'bg-emerald-500/10'}`}>
            <p className={`text-3xl font-display font-bold ${stats.amountOwed > 0 ? 'text-burgundy' : 'text-emerald-600'}`}>
              {formatCurrency(stats.amountOwed)}
            </p>
            <p className="text-sm text-olive mt-1">Outstanding</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
