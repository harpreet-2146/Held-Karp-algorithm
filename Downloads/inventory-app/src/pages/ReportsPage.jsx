// ============================================
// REPORTS PAGE
// ============================================

import React, { useState } from 'react';
import { 
  FileText, 
  TrendingUp,
  DollarSign,
  Users,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Tabs } from '../components/UI';
import { 
  formatCurrency, 
  formatDate,
  formatNumber,
  calculateSaleRevenue,
  calculateManufacturerShare,
  calculatePartnerCommission,
  getPartnerStats
} from '../utils/calculations';

const ReportsPage = () => {
  const { 
    products, 
    partners, 
    sales, 
    payments,
    dispatchRequests,
    damageReports
  } = useApp();
  
  const [activeTab, setActiveTab] = useState('sales');
  const [dateFilter, setDateFilter] = useState('all');
  
  const tabs = [
    { id: 'sales', label: 'Sales Report' },
    { id: 'partner', label: 'Partner Report' },
    { id: 'product', label: 'Product Report' },
  ];
  
  // Filter sales by date
  const getFilteredSales = () => {
    const now = new Date();
    let filtered = [...sales];
    
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = sales.filter(s => s.saleDate === today);
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      filtered = sales.filter(s => s.saleDate >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      filtered = sales.filter(s => s.saleDate >= monthAgo);
    }
    
    return filtered.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));
  };
  
  const filteredSales = getFilteredSales();
  
  // Calculate totals
  const totalRevenue = filteredSales.reduce((sum, sale) => {
    const product = products.find(p => p.id === sale.productId);
    return sum + calculateSaleRevenue(sale, product);
  }, 0);
  
  const totalManufacturerShare = filteredSales.reduce((sum, sale) => {
    const product = products.find(p => p.id === sale.productId);
    return sum + calculateManufacturerShare(sale, product);
  }, 0);
  
  const totalPartnerCommission = filteredSales.reduce((sum, sale) => {
    const product = products.find(p => p.id === sale.productId);
    return sum + calculatePartnerCommission(sale, product);
  }, 0);
  
  // Partner report data
  const partnerReportData = partners.map(partner => {
    const stats = getPartnerStats(
      partner.id,
      products,
      dispatchRequests,
      sales,
      damageReports,
      payments
    );
    return { ...partner, ...stats };
  });
  
  // Product report data
  const productReportData = products.filter(p => p.isActive).map(product => {
    const productSales = sales.filter(s => s.productId === product.id);
    const totalPacketsSold = productSales.reduce((sum, s) => sum + s.packetsSold, 0);
    const totalRev = productSales.reduce((sum, sale) => sum + calculateSaleRevenue(sale, product), 0);
    const totalMfgShare = productSales.reduce((sum, sale) => sum + calculateManufacturerShare(sale, product), 0);
    return { ...product, totalPacketsSold, totalRevenue: totalRev, totalManufacturerShare: totalMfgShare };
  });
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">
            View detailed sales, partner, and product reports
          </p>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-black">{formatCurrency(totalRevenue)}</p>
              <p className="text-olive">Total Revenue</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-olive/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-olive" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-black">{formatCurrency(totalManufacturerShare)}</p>
              <p className="text-olive">Your Earnings</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-black">{formatCurrency(totalPartnerCommission)}</p>
              <p className="text-olive">Partner Commissions</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === 'sales' && (
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-olive" />
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input py-2 px-3 w-auto">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        )}
      </div>
      
      {/* Sales Report Tab */}
      {activeTab === 'sales' && (
        <div className="card">
          <h2 className="text-xl font-display font-bold text-black mb-6">Sales Transactions</h2>
          {filteredSales.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="w-10 h-10 text-olive/30 mx-auto mb-3" />
              <p className="text-olive">No sales found for this period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Partner</th>
                    <th>Product</th>
                    <th>Packets</th>
                    <th>Revenue</th>
                    <th>Your Share</th>
                    <th>Partner Share</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map(sale => {
                    const partner = partners.find(p => p.id === sale.partnerId);
                    const product = products.find(p => p.id === sale.productId);
                    const revenue = calculateSaleRevenue(sale, product);
                    const mfgShare = calculateManufacturerShare(sale, product);
                    const partnerShare = calculatePartnerCommission(sale, product);
                    return (
                      <tr key={sale.id}>
                        <td className="font-mono text-sm">{formatDate(sale.saleDate)}</td>
                        <td className="font-medium">{partner?.name}</td>
                        <td>{product?.name}</td>
                        <td className="font-mono">{sale.packetsSold}</td>
                        <td className="font-mono">{formatCurrency(revenue)}</td>
                        <td className="font-mono text-emerald-600">{formatCurrency(mfgShare)}</td>
                        <td className="font-mono text-blue-600">{formatCurrency(partnerShare)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-olive/5">
                    <td colSpan={4} className="font-bold">Total</td>
                    <td className="font-bold font-mono">{formatCurrency(totalRevenue)}</td>
                    <td className="font-bold font-mono text-emerald-600">{formatCurrency(totalManufacturerShare)}</td>
                    <td className="font-bold font-mono text-blue-600">{formatCurrency(totalPartnerCommission)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Partner Report Tab */}
      {activeTab === 'partner' && (
        <div className="card">
          <h2 className="text-xl font-display font-bold text-black mb-6">Partner Performance</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Partner</th>
                  <th>Stock (packets)</th>
                  <th>Sold (packets)</th>
                  <th>Total Revenue</th>
                  <th>Their Earnings</th>
                  <th>Amount Owed</th>
                  <th>Total Paid</th>
                </tr>
              </thead>
              <tbody>
                {partnerReportData.map(partner => (
                  <tr key={partner.id}>
                    <td className="font-medium">{partner.name}</td>
                    <td className="font-mono">{partner.totalStock}</td>
                    <td className="font-mono">{partner.totalPacketsSold}</td>
                    <td className="font-mono">{formatCurrency(partner.totalRevenue)}</td>
                    <td className="font-mono text-blue-600">{formatCurrency(partner.totalEarnings)}</td>
                    <td className={`font-mono font-bold ${partner.amountOwed > 0 ? 'text-burgundy' : 'text-emerald-600'}`}>
                      {formatCurrency(partner.amountOwed)}
                    </td>
                    <td className="font-mono text-emerald-600">{formatCurrency(partner.totalPaid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Product Report Tab */}
      {activeTab === 'product' && (
        <div className="card">
          <h2 className="text-xl font-display font-bold text-black mb-6">Product Performance</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>MRP</th>
                  <th>Units/Packet</th>
                  <th>Packets Sold</th>
                  <th>Units Sold</th>
                  <th>Total Revenue</th>
                  <th>Your Earnings</th>
                </tr>
              </thead>
              <tbody>
                {productReportData.map(product => (
                  <tr key={product.id}>
                    <td className="font-medium">{product.name}</td>
                    <td className="font-mono">{formatCurrency(product.mrp)}</td>
                    <td>{product.unitsPerPacket}</td>
                    <td className="font-mono">{formatNumber(product.totalPacketsSold)}</td>
                    <td className="font-mono">{formatNumber(product.totalPacketsSold * product.unitsPerPacket)}</td>
                    <td className="font-mono">{formatCurrency(product.totalRevenue)}</td>
                    <td className="font-mono text-emerald-600">{formatCurrency(product.totalManufacturerShare)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
