// ============================================
// INVENTORY / PRODUCTION PAGE
// ============================================

import React, { useState } from 'react';
import { 
  Plus, 
  Package, 
  Factory,
  Calendar,
  Search,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal, Badge, EmptyState, Tabs } from '../components/UI';
import { 
  formatCurrency, 
  formatDate, 
  formatNumber,
  calculateFactoryStock,
  getToday
} from '../utils/calculations';

const InventoryPage = () => {
  const { 
    products, 
    production, 
    dispatchRequests,
    recordProduction 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState('current');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    packetsProduced: '',
    productionDate: getToday(),
    notes: '',
  });
  
  const tabs = [
    { id: 'current', label: 'Current Stock' },
    { id: 'history', label: 'Production History' },
  ];
  
  // Calculate inventory for each product
  const inventoryData = products.filter(p => p.isActive).map(product => {
    const factoryStock = calculateFactoryStock(product.id, production, dispatchRequests);
    const totalProduced = production
      .filter(p => p.productId === product.id)
      .reduce((sum, p) => sum + p.packetsProduced, 0);
    const totalDispatched = dispatchRequests
      .filter(d => d.productId === product.id && ['dispatched', 'received'].includes(d.status))
      .reduce((sum, d) => sum + (d.packetsApproved || 0), 0);
    
    return {
      ...product,
      factoryStock,
      totalProduced,
      totalDispatched,
      stockValue: factoryStock * product.unitsPerPacket * product.mrp,
    };
  });
  
  // Production history sorted by date
  const productionHistory = [...production]
    .sort((a, b) => new Date(b.productionDate) - new Date(a.productionDate));
  
  // Handle form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    recordProduction({
      productId: parseInt(formData.productId),
      packetsProduced: parseInt(formData.packetsProduced),
      productionDate: formData.productionDate,
      notes: formData.notes,
    });
    
    setIsModalOpen(false);
    setFormData({
      productId: '',
      packetsProduced: '',
      productionDate: getToday(),
      notes: '',
    });
  };
  
  // Total stats
  const totalFactoryStock = inventoryData.reduce((sum, p) => sum + p.factoryStock, 0);
  const totalStockValue = inventoryData.reduce((sum, p) => sum + p.stockValue, 0);
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Factory Inventory</h1>
          <p className="page-subtitle">
            Track production and manage your factory stock levels
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus className="w-5 h-5" />
          <span>Record Production</span>
        </button>
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
                {formatNumber(totalFactoryStock)}
              </p>
              <p className="text-olive">Total Packets in Factory</p>
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
              <p className="text-olive">Total Stock Value</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Factory className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-black">
                {production.length}
              </p>
              <p className="text-olive">Production Batches</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      {/* Current Stock Tab */}
      {activeTab === 'current' && (
        <div className="card">
          <h2 className="text-xl font-display font-bold text-black mb-6">
            Current Stock by Product
          </h2>
          
          {inventoryData.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products"
              description="Add products to start tracking inventory"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Total Produced</th>
                    <th>Total Dispatched</th>
                    <th>Factory Stock</th>
                    <th>Stock Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-olive">
                            {item.unitsPerPacket} units/packet × {formatCurrency(item.mrp)}
                          </p>
                        </div>
                      </td>
                      <td className="font-mono">
                        {formatNumber(item.totalProduced)} packets
                      </td>
                      <td className="font-mono">
                        {formatNumber(item.totalDispatched)} packets
                      </td>
                      <td>
                        <span className={`font-bold font-mono ${item.factoryStock < 10 ? 'text-red-600' : 'text-black'}`}>
                          {formatNumber(item.factoryStock)} packets
                        </span>
                      </td>
                      <td className="font-mono">
                        {formatCurrency(item.stockValue)}
                      </td>
                      <td>
                        {item.factoryStock === 0 ? (
                          <Badge status="rejected">Out of Stock</Badge>
                        ) : item.factoryStock < 10 ? (
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
      )}
      
      {/* Production History Tab */}
      {activeTab === 'history' && (
        <div className="card">
          <h2 className="text-xl font-display font-bold text-black mb-6">
            Production History
          </h2>
          
          {productionHistory.length === 0 ? (
            <EmptyState
              icon={Factory}
              title="No production records"
              description="Record your first production batch to get started"
              action={
                <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                  <Plus className="w-5 h-5" />
                  <span>Record Production</span>
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              {productionHistory.map(record => {
                const product = products.find(p => p.id === record.productId);
                
                return (
                  <div 
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-olive/5 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-olive/10 rounded-lg flex items-center justify-center">
                        <Factory className="w-5 h-5 text-olive" />
                      </div>
                      <div>
                        <p className="font-semibold text-black">
                          {product?.name || 'Unknown Product'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-olive">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(record.productionDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-black">
                        +{record.packetsProduced} packets
                      </p>
                      {record.notes && (
                        <p className="text-sm text-olive">{record.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {/* Record Production Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Production"
        size="md"
      >
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
              {products.filter(p => p.isActive).map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label-light">Packets Produced *</label>
            <input
              type="number"
              value={formData.packetsProduced}
              onChange={(e) => setFormData(prev => ({ ...prev, packetsProduced: e.target.value }))}
              className="input-light"
              placeholder="e.g., 100"
              min="1"
              required
            />
          </div>
          
          <div>
            <label className="label-light">Production Date *</label>
            <input
              type="date"
              value={formData.productionDate}
              onChange={(e) => setFormData(prev => ({ ...prev, productionDate: e.target.value }))}
              className="input-light"
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
              placeholder="Optional notes about this batch"
            />
          </div>
          
          {formData.productId && formData.packetsProduced && (
            <div className="p-4 bg-emerald-500/10 rounded-lg">
              {(() => {
                const product = products.find(p => p.id === parseInt(formData.productId));
                const packets = parseInt(formData.packetsProduced);
                if (!product) return null;
                
                return (
                  <p className="text-sm text-emerald-700">
                    <strong>Total Units:</strong> {formatNumber(packets * product.unitsPerPacket)}
                    <br />
                    <strong>Stock Value:</strong> {formatCurrency(packets * product.unitsPerPacket * product.mrp)}
                  </p>
                );
              })()}
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Record Production
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryPage;
