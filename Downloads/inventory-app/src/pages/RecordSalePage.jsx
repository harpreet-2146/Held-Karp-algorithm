// ============================================
// RECORD SALE PAGE (PARTNER)
// ============================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Package,
  DollarSign,
  Check,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, EmptyState } from '../components/UI';
import { 
  formatCurrency, 
  formatNumber,
  formatDate,
  calculatePartnerStock,
  calculateSaleRevenue,
  getToday
} from '../utils/calculations';

const RecordSalePage = () => {
  const { 
    currentPartnerId,
    products, 
    dispatchRequests, 
    sales, 
    damageReports,
    recordSale 
  } = useApp();
  
  const [formData, setFormData] = useState({
    productId: '',
    packetsSold: '',
    saleDate: getToday(),
    notes: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  
  // Get stock for each product
  const stockData = products.filter(p => p.isActive).map(product => ({
    ...product,
    stock: calculatePartnerStock(currentPartnerId, product.id, dispatchRequests, sales, damageReports)
  })).filter(p => p.stock > 0);
  
  // Get recent sales
  const recentSales = sales
    .filter(s => s.partnerId === currentPartnerId)
    .sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))
    .slice(0, 5);
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const product = products.find(p => p.id === parseInt(formData.productId));
    const packets = parseInt(formData.packetsSold);
    
    const sale = recordSale({
      partnerId: currentPartnerId,
      productId: parseInt(formData.productId),
      packetsSold: packets,
      saleDate: formData.saleDate,
      notes: formData.notes,
    });
    
    setLastSale({
      ...sale,
      product,
      revenue: packets * product.unitsPerPacket * product.mrp,
      myShare: (packets * product.unitsPerPacket * product.mrp * product.partnerSharePct) / 100,
    });
    
    setShowSuccess(true);
    setFormData({
      productId: '',
      packetsSold: '',
      saleDate: getToday(),
      notes: '',
    });
    
    setTimeout(() => setShowSuccess(false), 5000);
  };
  
  // Calculate preview
  const getPreview = () => {
    if (!formData.productId || !formData.packetsSold) return null;
    
    const product = products.find(p => p.id === parseInt(formData.productId));
    const packets = parseInt(formData.packetsSold);
    
    if (!product || isNaN(packets)) return null;
    
    const revenue = packets * product.unitsPerPacket * product.mrp;
    const myShare = (revenue * product.partnerSharePct) / 100;
    const manufacturerShare = (revenue * product.manufacturerSharePct) / 100;
    
    return { revenue, myShare, manufacturerShare, units: packets * product.unitsPerPacket };
  };
  
  const preview = getPreview();
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Record Sale</h1>
          <p className="page-subtitle">
            Record packets sold to customers
          </p>
        </div>
      </div>
      
      {/* Success Message */}
      {showSuccess && lastSale && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-card animate-slide-down">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-cream">Sale Recorded Successfully!</p>
              <p className="text-sm text-olive">
                {lastSale.packetsSold} packets of {lastSale.product?.name} • 
                Revenue: {formatCurrency(lastSale.revenue)} • 
                Your Earning: <span className="text-emerald-400">{formatCurrency(lastSale.myShare)}</span>
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sale Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-display font-bold text-black mb-6">
              New Sale
            </h2>
            
            {stockData.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No stock available"
                description="You need stock to record sales. Request stock from the manufacturer."
                action={
                  <Link to="/my-requests" className="btn btn-primary">
                    Request Stock
                  </Link>
                }
              />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label-light">Product *</label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                    className="input-light"
                    required
                  >
                    <option value="">Select product</option>
                    {stockData.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} — {product.stock} packets available
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="label-light">Packets Sold *</label>
                  <input
                    type="number"
                    value={formData.packetsSold}
                    onChange={(e) => setFormData(prev => ({ ...prev, packetsSold: e.target.value }))}
                    className="input-light"
                    placeholder="Number of packets"
                    min="1"
                    max={formData.productId ? stockData.find(p => p.id === parseInt(formData.productId))?.stock : undefined}
                    required
                  />
                  {formData.productId && (
                    <p className="text-sm text-olive mt-1">
                      Available: {stockData.find(p => p.id === parseInt(formData.productId))?.stock || 0} packets
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="label-light">Sale Date *</label>
                  <input
                    type="date"
                    value={formData.saleDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, saleDate: e.target.value }))}
                    className="input-light"
                    max={getToday()}
                    required
                  />
                </div>
                
                <div>
                  <label className="label-light">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input-light"
                    rows={2}
                    placeholder="Optional notes"
                  />
                </div>
                
                {/* Preview */}
                {preview && (
                  <div className="p-4 bg-olive/5 rounded-lg space-y-3">
                    <p className="text-sm font-medium text-black">Sale Summary</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-olive">Units Sold</p>
                        <p className="font-semibold text-black">{formatNumber(preview.units)} units</p>
                      </div>
                      <div>
                        <p className="text-olive">Total Revenue</p>
                        <p className="font-semibold text-black">{formatCurrency(preview.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-olive">Your Commission</p>
                        <p className="font-semibold text-emerald-600">{formatCurrency(preview.myShare)}</p>
                      </div>
                      <div>
                        <p className="text-olive">Manufacturer Share</p>
                        <p className="font-semibold text-black">{formatCurrency(preview.manufacturerShare)}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <button type="submit" className="btn btn-primary w-full">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Record Sale</span>
                </button>
              </form>
            )}
          </div>
        </div>
        
        {/* Recent Sales Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-display font-bold text-black mb-6">
              Recent Sales
            </h2>
            
            {recentSales.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingCart className="w-10 h-10 text-olive/30 mx-auto mb-3" />
                <p className="text-olive text-sm">No sales yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSales.map(sale => {
                  const product = products.find(p => p.id === sale.productId);
                  const revenue = calculateSaleRevenue(sale, product);
                  
                  return (
                    <div key={sale.id} className="p-3 bg-olive/5 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-black text-sm">{product?.name}</p>
                        <p className="font-semibold text-black text-sm">{formatCurrency(revenue)}</p>
                      </div>
                      <div className="flex justify-between text-xs text-olive">
                        <span>{sale.packetsSold} packets</span>
                        <span>{formatDate(sale.saleDate)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordSalePage;
