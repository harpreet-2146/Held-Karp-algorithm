// ============================================
// PARTNERS MANAGEMENT PAGE
// ============================================

import React, { useState } from 'react';
import { 
  Plus, 
  Users, 
  Edit2, 
  Search,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Package,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal, Badge, EmptyState } from '../components/UI';
import { 
  formatCurrency, 
  formatDate, 
  getPartnerStats,
  calculatePartnerStock 
} from '../utils/calculations';

const PartnersPage = () => {
  const { 
    partners, 
    products, 
    dispatchRequests, 
    sales, 
    damageReports, 
    payments,
    addPartner, 
    updatePartner,
    isAdmin 
  } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
  });
  
  // Filter partners
  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle form
  const openAddModal = () => {
    setEditingPartner(null);
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
    });
    setIsModalOpen(true);
  };
  
  const openEditModal = (partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      contactPerson: partner.contactPerson || '',
      phone: partner.phone || '',
      email: partner.email || '',
      address: partner.address || '',
    });
    setIsModalOpen(true);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingPartner) {
      updatePartner(editingPartner.id, formData);
    } else {
      addPartner(formData);
    }
    
    setIsModalOpen(false);
  };
  
  // Get stats for a partner
  const getStats = (partnerId) => {
    return getPartnerStats(
      partnerId,
      products,
      dispatchRequests,
      sales,
      damageReports,
      payments
    );
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Partners</h1>
          <p className="page-subtitle">
            Manage your retail partners and track their performance
          </p>
        </div>
        {isAdmin && (
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus className="w-5 h-5" />
            <span>Add Partner</span>
          </button>
        )}
      </div>
      
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-olive" />
        <input
          type="text"
          placeholder="Search partners..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-12"
        />
      </div>
      
      {/* Partners Grid */}
      {filteredPartners.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No partners found"
          description={searchQuery ? "Try a different search term" : "Add your first partner to get started"}
          action={
            isAdmin && !searchQuery && (
              <button onClick={openAddModal} className="btn btn-primary">
                <Plus className="w-5 h-5" />
                <span>Add Partner</span>
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPartners.map(partner => {
            const stats = getStats(partner.id);
            
            return (
              <div key={partner.id} className="card card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-olive/10 rounded-xl flex items-center justify-center">
                      <Users className="w-7 h-7 text-olive" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-black">
                        {partner.name}
                      </h3>
                      <p className="text-sm text-olive">
                        {partner.contactPerson}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={partner.status}>{partner.status}</Badge>
                    {isAdmin && (
                      <button
                        onClick={() => openEditModal(partner)}
                        className="p-2 hover:bg-olive/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-olive" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mb-4 text-sm">
                  {partner.phone && (
                    <div className="flex items-center gap-2 text-olive">
                      <Phone className="w-4 h-4" />
                      <span>{partner.phone}</span>
                    </div>
                  )}
                  {partner.email && (
                    <div className="flex items-center gap-2 text-olive">
                      <Mail className="w-4 h-4" />
                      <span>{partner.email}</span>
                    </div>
                  )}
                </div>
                {partner.address && (
                  <div className="flex items-start gap-2 text-sm text-olive mb-4">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{partner.address}</span>
                  </div>
                )}
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-olive/10">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-olive mb-1">
                      <Package className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-black">
                      {stats.totalStock}
                    </p>
                    <p className="text-xs text-olive">Stock (packets)</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-olive mb-1">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-black">
                      {stats.totalPacketsSold}
                    </p>
                    <p className="text-xs text-olive">Sold (packets)</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-olive mb-1">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <p className={`text-2xl font-bold ${stats.amountOwed > 0 ? 'text-burgundy' : 'text-emerald-600'}`}>
                      {formatCurrency(stats.amountOwed)}
                    </p>
                    <p className="text-xs text-olive">Amount Due</p>
                  </div>
                </div>
                
                {/* View Details Button */}
                <button
                  onClick={() => setSelectedPartner(partner)}
                  className="w-full mt-4 py-2 text-center text-olive hover:text-black hover:bg-olive/5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-sm font-medium">View Stock Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPartner ? 'Edit Partner' : 'Add New Partner'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-light">Store/Business Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input-light"
              placeholder="e.g., ABC Store"
              required
            />
          </div>
          
          <div>
            <label className="label-light">Contact Person</label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
              className="input-light"
              placeholder="e.g., Rahul Sharma"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-light">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="input-light"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="label-light">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="input-light"
                placeholder="email@example.com"
              />
            </div>
          </div>
          
          <div>
            <label className="label-light">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="input-light"
              rows={2}
              placeholder="Store address"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {editingPartner ? 'Update Partner' : 'Add Partner'}
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Partner Stock Details Modal */}
      <Modal
        isOpen={selectedPartner !== null}
        onClose={() => setSelectedPartner(null)}
        title={selectedPartner?.name + ' - Stock Details'}
        size="lg"
      >
        {selectedPartner && (
          <div className="space-y-6">
            {products.filter(p => p.isActive).map(product => {
              const stock = calculatePartnerStock(
                selectedPartner.id,
                product.id,
                dispatchRequests,
                sales,
                damageReports
              );
              
              const productSales = sales
                .filter(s => s.partnerId === selectedPartner.id && s.productId === product.id)
                .reduce((sum, s) => sum + s.packetsSold, 0);
              
              return (
                <div key={product.id} className="p-4 bg-olive/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-black">{product.name}</h4>
                    <Badge status={stock > 0 ? 'success' : 'warning'}>
                      {stock} packets
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-olive">MRP</p>
                      <p className="font-medium text-black">{formatCurrency(product.mrp)}</p>
                    </div>
                    <div>
                      <p className="text-olive">Sold</p>
                      <p className="font-medium text-black">{productSales} packets</p>
                    </div>
                    <div>
                      <p className="text-olive">Stock Value</p>
                      <p className="font-medium text-black">
                        {formatCurrency(stock * product.unitsPerPacket * product.mrp)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PartnersPage;
