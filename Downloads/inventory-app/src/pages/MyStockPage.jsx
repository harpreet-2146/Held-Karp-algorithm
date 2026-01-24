// ============================================
// PARTNER MY STOCK PAGE
// ============================================

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Send,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, EmptyState } from '../components/UI';
import { 
  formatCurrency, 
  formatNumber,
  formatDate,
  calculatePartnerStock
} from '../utils/calculations';

const MyStockPage = () => {
  const { 
    currentPartnerId,
    products, 
    dispatchRequests, 
    sales, 
    damageReports 
  } = useApp();
  
  // Get stock for each product
  const stockData = products.filter(p => p.isActive).map(product => {
    const stock = calculatePartnerStock(currentPartnerId, product.id, dispatchRequests, sales, damageReports);
    
    const totalReceived = dispatchRequests
      .filter(d => d.partnerId === currentPartnerId && d.productId === product.id && d.status === 'received')
      .reduce((sum, d) => sum + (d.packetsApproved || 0), 0);
    
    const totalSold = sales
      .filter(s => s.partnerId === currentPartnerId && s.productId === product.id)
      .reduce((sum, s) => sum + s.packetsSold, 0);
    
    const totalDamaged = damageReports
      .filter(d => d.partnerId === currentPartnerId && d.productId === product.id && d.status === 'approved')
      .reduce((sum, d) => sum + d.packetsDamaged, 0);
    
    return {
      ...product,
      stock,
      totalReceived,
      totalSold,
      totalDamaged,
      stockValue: stock * product.unitsPerPacket * product.mrp,
    };
  });
  
  // Dispatch history for this partner
  const dispatchHistory = dispatchRequests
    .filter(d => d.partnerId === currentPartnerId && ['dispatched', 'received'].includes(d.status))
    .sort((a, b) => new Date(b.receivedAt || b.dispatchedAt) - new Date(a.receivedAt || a.dispatchedAt))
    .slice(0, 10);
  
  const totalStock = stockData.reduce((sum, p) => sum + p.stock, 0);
  const totalStockValue = stockData.reduce((sum, p) => sum + p.stockValue, 0);
  const lowStockProducts = stockData.filter(p => p.stock > 0 && p.stock < 5);
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Stock</h1>
          <p className="page-subtitle">
            View your current inventory and stock history
          </p>
        </div>
        <Link to="/my-requests" className="btn btn-primary">
          <Send className="w-5 h-5" />
          <span>Request Stock</span>
        </Link>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-olive/10 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-olive" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-black">
                {formatNumber(totalStock)}
              </p>
              <p className="text-olive">Total Packets</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-black">
                {formatCurrency(totalStockValue)}
              </p>
              <p className="text-olive">Stock Value</p>
            </div>
          </div>
        </div>
        
        {lowStockProducts.length > 0 && (
          <div className="card bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-3xl font-display font-bold text-black">
                  {lowStockProducts.length}
                </p>
                <p className="text-olive">Low Stock Items</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Stock by Product */}
      <div className="card">
        <h2 className="text-xl font-display font-bold text-black mb-6">
          Stock by Product
        </h2>
        
        {stockData.every(p => p.stock === 0 && p.totalReceived === 0) ? (
          <EmptyState
            icon={Package}
            title="No stock yet"
            description="Request stock from the manufacturer to get started"
            action={
              <Link to="/my-requests" className="btn btn-primary">
                <Send className="w-5 h-5" />
                <span>Request Stock</span>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>MRP</th>
                  <th>Received</th>
                  <th>Sold</th>
                  <th>Damaged</th>
                  <th>In Stock</th>
                  <th>Stock Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stockData.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-olive">{item.unitsPerPacket} units/packet</p>
                      </div>
                    </td>
                    <td className="font-mono">{formatCurrency(item.mrp)}</td>
                    <td className="font-mono">{item.totalReceived}</td>
                    <td className="font-mono">{item.totalSold}</td>
                    <td className="font-mono text-burgundy">{item.totalDamaged}</td>
                    <td>
                      <span className={`font-bold font-mono ${item.stock < 5 ? 'text-burgundy' : 'text-black'}`}>
                        {item.stock} packets
                      </span>
                    </td>
                    <td className="font-mono">{formatCurrency(item.stockValue)}</td>
                    <td>
                      {item.stock === 0 ? (
                        <Badge status="rejected">Out of Stock</Badge>
                      ) : item.stock < 5 ? (
                        <Badge status="pending">Low Stock</Badge>
                      ) : (
                        <Badge status="approved">In Stock</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Dispatch History */}
      <div className="card">
        <h2 className="text-xl font-display font-bold text-black mb-6">
          Recent Dispatches
        </h2>
        
        {dispatchHistory.length === 0 ? (
          <div className="py-8 text-center">
            <Send className="w-10 h-10 text-olive/30 mx-auto mb-3" />
            <p className="text-olive">No dispatches received yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dispatchHistory.map(dispatch => {
              const product = products.find(p => p.id === dispatch.productId);
              
              return (
                <div 
                  key={dispatch.id}
                  className="flex items-center justify-between p-4 bg-olive/5 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      dispatch.status === 'received' ? 'bg-emerald-500/10' : 'bg-blue-500/10'
                    }`}>
                      <Package className={`w-5 h-5 ${
                        dispatch.status === 'received' ? 'text-emerald-500' : 'text-blue-500'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold text-black">{product?.name}</p>
                      <p className="text-sm text-olive">
                        {dispatch.status === 'received' 
                          ? `Received: ${formatDate(dispatch.receivedAt)}`
                          : `Dispatched: ${formatDate(dispatch.dispatchedAt)}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-black">
                      +{dispatch.packetsApproved} packets
                    </p>
                    <Badge status={dispatch.status}>{dispatch.status}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyStockPage;
