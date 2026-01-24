// ============================================
// MY REQUESTS PAGE (PARTNER)
// ============================================

import React, { useState } from 'react';
import { 
  Send, 
  Plus,
  Clock,
  Check,
  X,
  Truck,
  Package
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal, Badge, EmptyState, Tabs } from '../components/UI';
import { 
  formatDate,
  getToday
} from '../utils/calculations';

const MyRequestsPage = () => {
  const { 
    currentPartnerId,
    products, 
    dispatchRequests,
    createDispatchRequest,
    confirmReceipt
  } = useApp();
  
  const [activeTab, setActiveTab] = useState('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    packetsRequested: '',
    notes: '',
  });
  
  // Filter requests for this partner
  const myRequests = dispatchRequests.filter(d => d.partnerId === currentPartnerId);
  
  const tabs = [
    { id: 'pending', label: `Pending (${myRequests.filter(d => d.status === 'pending').length})` },
    { id: 'approved', label: `Approved (${myRequests.filter(d => d.status === 'approved').length})` },
    { id: 'dispatched', label: `In Transit (${myRequests.filter(d => d.status === 'dispatched').length})` },
    { id: 'all', label: 'All' },
  ];
  
  const getFilteredRequests = () => {
    switch (activeTab) {
      case 'pending':
        return myRequests.filter(d => d.status === 'pending');
      case 'approved':
        return myRequests.filter(d => d.status === 'approved');
      case 'dispatched':
        return myRequests.filter(d => d.status === 'dispatched');
      default:
        return myRequests;
    }
  };
  
  const filteredRequests = getFilteredRequests()
    .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
  
  // Handle new request
  const handleSubmit = (e) => {
    e.preventDefault();
    
    createDispatchRequest({
      partnerId: currentPartnerId,
      productId: parseInt(formData.productId),
      packetsRequested: parseInt(formData.packetsRequested),
      notes: formData.notes,
    });
    
    setIsModalOpen(false);
    setFormData({
      productId: '',
      packetsRequested: '',
      notes: '',
    });
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Requests</h1>
          <p className="page-subtitle">
            Request stock and track your dispatch requests
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus className="w-5 h-5" />
          <span>New Request</span>
        </button>
      </div>
      
      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Send}
              title={`No ${activeTab === 'all' ? '' : activeTab} requests`}
              description={activeTab === 'pending' 
                ? "You haven't made any stock requests yet." 
                : "No requests found in this category."}
              action={
                activeTab === 'pending' && (
                  <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                    <Plus className="w-5 h-5" />
                    <span>Request Stock</span>
                  </button>
                )
              }
            />
          </div>
        ) : (
          filteredRequests.map(request => {
            const product = products.find(p => p.id === request.productId);
            
            return (
              <div key={request.id} className="card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Request Info */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      request.status === 'pending' ? 'bg-amber-500/10' :
                      request.status === 'approved' ? 'bg-emerald-500/10' :
                      request.status === 'rejected' ? 'bg-red-500/10' :
                      request.status === 'dispatched' ? 'bg-blue-500/10' :
                      'bg-emerald-500/10'
                    }`}>
                      {request.status === 'pending' && <Clock className="w-6 h-6 text-amber-500" />}
                      {request.status === 'approved' && <Check className="w-6 h-6 text-emerald-500" />}
                      {request.status === 'rejected' && <X className="w-6 h-6 text-red-500" />}
                      {request.status === 'dispatched' && <Truck className="w-6 h-6 text-blue-500" />}
                      {request.status === 'received' && <Package className="w-6 h-6 text-emerald-500" />}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-black">
                          {product?.name}
                        </h3>
                        <Badge status={request.status}>{request.status}</Badge>
                      </div>
                      <p className="text-olive mb-2">
                        Requested: <span className="font-medium">{request.packetsRequested} packets</span>
                        {request.packetsApproved && request.packetsApproved !== request.packetsRequested && (
                          <span className="text-emerald-600 ml-2">
                            (Approved: {request.packetsApproved})
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-olive">
                        <span>Requested: {formatDate(request.requestedAt)}</span>
                        {request.approvedAt && <span>Approved: {formatDate(request.approvedAt)}</span>}
                        {request.dispatchedAt && <span>Dispatched: {formatDate(request.dispatchedAt)}</span>}
                        {request.receivedAt && <span>Received: {formatDate(request.receivedAt)}</span>}
                      </div>
                      {request.notes && (
                        <p className="text-sm text-olive mt-2 italic">"{request.notes}"</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  {request.status === 'dispatched' && (
                    <button
                      onClick={() => confirmReceipt(request.id)}
                      className="btn btn-primary btn-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm Receipt</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* New Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Request Stock"
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
            <label className="label-light">Packets Needed *</label>
            <input
              type="number"
              value={formData.packetsRequested}
              onChange={(e) => setFormData(prev => ({ ...prev, packetsRequested: e.target.value }))}
              className="input-light"
              placeholder="Number of packets"
              min="1"
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
              placeholder="Any special requirements"
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
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyRequestsPage;
