// ============================================
// PRODUCTS MANAGEMENT PAGE
// ============================================

import React, { useState } from 'react';
import { 
  Plus, 
  Package, 
  Edit2, 
  Trash2,
  Search,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal, Badge, EmptyState } from '../components/UI';
import { formatCurrency, formatDate } from '../utils/calculations';

const ProductsPage = () => {
  const { products, addProduct, updateProduct, deleteProduct, isAdmin } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    mrp: '',
    unitsPerPacket: '',
    manufacturerSharePct: '70',
    partnerSharePct: '30',
  });
  
  // Filter products
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const activeProducts = filteredProducts.filter(p => p.isActive);
  const inactiveProducts = filteredProducts.filter(p => !p.isActive);
  
  // Handle form
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      mrp: '',
      unitsPerPacket: '',
      manufacturerSharePct: '70',
      partnerSharePct: '30',
    });
    setIsModalOpen(true);
  };
  
  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      mrp: product.mrp.toString(),
      unitsPerPacket: product.unitsPerPacket.toString(),
      manufacturerSharePct: product.manufacturerSharePct.toString(),
      partnerSharePct: product.partnerSharePct.toString(),
    });
    setIsModalOpen(true);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      description: formData.description,
      mrp: parseFloat(formData.mrp),
      unitsPerPacket: parseInt(formData.unitsPerPacket),
      manufacturerSharePct: parseFloat(formData.manufacturerSharePct),
      partnerSharePct: parseFloat(formData.partnerSharePct),
    };
    
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    
    setIsModalOpen(false);
  };
  
  const handleShareChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    if (field === 'manufacturerSharePct') {
      setFormData(prev => ({
        ...prev,
        manufacturerSharePct: value,
        partnerSharePct: (100 - numValue).toString(),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        partnerSharePct: value,
        manufacturerSharePct: (100 - numValue).toString(),
      }));
    }
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">
            Manage your product catalog, pricing, and commission splits
          </p>
        </div>
        {isAdmin && (
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        )}
      </div>
      
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-olive" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-12"
        />
      </div>
      
      {/* Products Grid */}
      {activeProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description={searchQuery ? "Try a different search term" : "Add your first product to get started"}
          action={
            isAdmin && !searchQuery && (
              <button onClick={openAddModal} className="btn btn-primary">
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeProducts.map(product => (
            <div key={product.id} className="card card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-olive/10 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-olive" />
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-2 hover:bg-olive/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-olive" />
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-burgundy" />
                    </button>
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-display font-bold text-black mb-1">
                {product.name}
              </h3>
              <p className="text-sm text-olive mb-4">
                {product.description || 'No description'}
              </p>
              
              <div className="space-y-3 pt-4 border-t border-olive/10">
                <div className="flex justify-between">
                  <span className="text-olive">MRP per unit</span>
                  <span className="font-semibold text-black font-mono">
                    {formatCurrency(product.mrp)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-olive">Units per packet</span>
                  <span className="font-semibold text-black">
                    {product.unitsPerPacket} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-olive">Packet value</span>
                  <span className="font-semibold text-black font-mono">
                    {formatCurrency(product.mrp * product.unitsPerPacket)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-olive">Commission split</span>
                  <div className="flex gap-2">
                    <Badge status="info">{product.manufacturerSharePct}% You</Badge>
                    <Badge status="success">{product.partnerSharePct}% Partner</Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Inactive Products */}
      {inactiveProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-display font-semibold text-cream/50 mb-4">
            Inactive Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveProducts.map(product => (
              <div key={product.id} className="card opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-black">{product.name}</h3>
                    <p className="text-sm text-olive">
                      {formatCurrency(product.mrp)} per unit
                    </p>
                  </div>
                  <Badge status="inactive">Inactive</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-light">Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input-light"
              placeholder="e.g., Aloo Parantha"
              required
            />
          </div>
          
          <div>
            <label className="label-light">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input-light"
              placeholder="e.g., Classic potato stuffed parantha"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-light">MRP per Unit (₹) *</label>
              <input
                type="number"
                value={formData.mrp}
                onChange={(e) => setFormData(prev => ({ ...prev, mrp: e.target.value }))}
                className="input-light"
                placeholder="100"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="label-light">Units per Packet *</label>
              <input
                type="number"
                value={formData.unitsPerPacket}
                onChange={(e) => setFormData(prev => ({ ...prev, unitsPerPacket: e.target.value }))}
                className="input-light"
                placeholder="10"
                min="1"
                required
              />
            </div>
          </div>
          
          <div className="p-4 bg-olive/5 rounded-lg">
            <p className="text-sm font-medium text-black mb-3">Commission Split</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-light">Your Share (%)</label>
                <input
                  type="number"
                  value={formData.manufacturerSharePct}
                  onChange={(e) => handleShareChange('manufacturerSharePct', e.target.value)}
                  className="input-light"
                  min="0"
                  max="100"
                  required
                />
              </div>
              <div>
                <label className="label-light">Partner Share (%)</label>
                <input
                  type="number"
                  value={formData.partnerSharePct}
                  onChange={(e) => handleShareChange('partnerSharePct', e.target.value)}
                  className="input-light"
                  min="0"
                  max="100"
                  required
                />
              </div>
            </div>
          </div>
          
          {formData.mrp && formData.unitsPerPacket && (
            <div className="p-4 bg-emerald-500/10 rounded-lg">
              <p className="text-sm text-emerald-700">
                <strong>Packet Value:</strong> {formatCurrency(parseFloat(formData.mrp) * parseInt(formData.unitsPerPacket))}
                <br />
                <strong>Your Earning per Packet:</strong> {formatCurrency((parseFloat(formData.mrp) * parseInt(formData.unitsPerPacket) * parseFloat(formData.manufacturerSharePct)) / 100)}
              </p>
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
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
