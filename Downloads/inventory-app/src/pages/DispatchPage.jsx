// ============================================
// DISPATCH REQUESTS PAGE
// ============================================

import React, { useState } from 'react';
import { 
  Send, 
  Check, 
  X, 
  Truck,
  Package,
  Clock,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal, Badge, EmptyState, Tabs } from '../components/UI';
import { 
  formatDate, 
  formatNumber,
  calculateFactoryStock,
  getToday
} from '../utils/calculations';

const DispatchPage = () => {
  const { 
    products, 
    partners, 
    production,
    dispatchRequests,
    approveDispatchRequest,
    rejectDispatchRequest,
    markAsDispatched,
    createDispatchRequest
  } = useApp();
  
  const [activeTab, setActiveTab] = useState('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalQuantity, setApprovalQuantity] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  
  // New dispatch form
  const [formData, setFormData] = useState({
    partnerId: '',
    productId: '',
    packetsRequested: '',
    notes: '',
  });
  
  const tabs = [
    { id: 'pending', label: `Pending (${dispatchRequests.filter(d => d.status === 'pending').length})` },
    { id: 'approved', label: 'Approved' },
    { id: 'dispatched', label: 'Dispatched' },
    { id: 'all', label: 'All Requests' },
  ];
  
  // Filter requests by status
  const getFilteredRequests = () => {
    switch (activeTab) {
      case 'pending':
        return dispatchRequests.filter(d => d.status === 'pending');
      case 'approved':
        return dispatchRequests.filter(d => d.status === 'approved');
      case 'dispatched':
        return dispatchRequests.filter(d => ['dispatched', 'received'].includes(d.status));
      default:
        return dispatchRequests;
    }
  };
  
  const filteredRequests = getFilteredRequests()
    .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
  
  // Handle approval
  const handleApprove = (request) => {
    setSelectedRequest(request);
    setApprovalQuantity(request.packetsRequested.toString());
    setRejectReason('');
  };
  
  const confirmApproval = () => {
    if (selectedRequest && approvalQuantity) {
      approveDispatchRequest(selectedRequest.id, parseInt(approvalQuantity));
      setSelectedRequest(null);
    }
  };
  
  const confirmRejection = () => {
    if (selectedRequest) {
      rejectDispatchRequest(selectedRequest.id, rejectReason);
      setSelectedRequest(null);
    }
  };
  
  // Handle new dispatch
  const handleNewDispatch = (e) => {
    e.preventDefault();
    
    createDispatchRequest({
      partnerId: parseInt(formData.partnerId),
      productId: parseInt(formData.productId),
      packetsRequested: parseInt(formData.packetsRequested),
      notes: formData.notes,
    });
    
    setIsModalOpen(false);
    setFormData({
      partnerId: '',
      productId: '',
      packetsRequested: '',
      notes: '',
    });
  };
  
  // Get available stock for a product
  const getAvailableStock = (productId) => {
    return calculateFactoryStock(productId, production, dispatchRequests);
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dispatch Requests</h1>
          <p className="page-subtitle">
            Manage stock requests from partners and dispatch inventory
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Send className="w-5 h-5" />
          <span>New Dispatch</span>
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
                ? "All caught up! No pending requests to review." 
                : "No requests found in this category."}
            />
          </div>
        ) : (
          filteredRequests.map(request => {
            const partner = partners.find(p => p.id === request.partnerId);
            const product = products.find(p => p.id === request.productId);
            const availableStock = getAvailableStock(request.productId);
            
            return (
              <div key={request.id} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                          {partner?.name}
                        </h3>
                        <Badge status={request.status}>{request.status}</Badge>
                      </div>
                      <p className="text-olive mb-2">
                        <span className="font-medium">{request.packetsRequested} packets</span> of {product?.name}
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
                  <div className="flex items-center gap-2 lg:flex-shrink-0">
                    {request.status === 'pending' && (
                      <>
                        <div className="text-sm text-olive mr-4">
                          Available: <span className={availableStock >= request.packetsRequested ? 'text-emerald-600' : 'text-red-600'}>
                            {availableStock} packets
                          </span>
                        </div>
                        <button
                          onClick={() => handleApprove(request)}
                          className="btn btn-primary btn-sm"
                          disabled={availableStock < 1}
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setRejectReason('');
                          }}
                          className="btn btn-danger btn-sm"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    
                    {request.status === 'approved' && (
                      <button
                        onClick={() => markAsDispatched(request.id)}
                        className="btn btn-primary btn-sm"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Mark Dispatched</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Approval/Rejection Modal */}
      <Modal
        isOpen={selectedRequest !== null && selectedRequest.status === 'pending'}
        onClose={() => setSelectedRequest(null)}
        title={approvalQuantity ? 'Approve Request' : 'Reject Request'}
        size="sm"
      >
        {selectedRequest && (
          <div className="space-y-5">
            <div className="p-4 bg-olive/5 rounded-lg">
              <p className="text-sm text-olive">Request from</p>
              <p className="font-semibold text-black">
                {partners.find(p => p.id === selectedRequest.partnerId)?.name}
              </p>
              <p className="text-olive mt-2">
                {selectedRequest.packetsRequested} packets of {products.find(p => p.id === selectedRequest.productId)?.name}
              </p>
            </div>
            
            {approvalQuantity !== '' ? (
              <>
                <div>
                  <label className="label-light">Packets to Approve *</label>
                  <input
                    type="number"
                    value={approvalQuantity}
                    onChange={(e) => setApprovalQuantity(e.target.value)}
                    className="input-light"
                    min="1"
                    max={getAvailableStock(selectedRequest.productId)}
                  />
                  <p className="text-sm text-olive mt-1">
                    Available: {getAvailableStock(selectedRequest.productId)} packets
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmApproval}
                    className="btn btn-primary flex-1"
                  >
                    Approve
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="label-light">Reason for Rejection</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="input-light"
                    rows={3}
                    placeholder="Optional: Explain why this request is being rejected"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRejection}
                    className="btn btn-danger flex-1"
                  >
                    Reject Request
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
      
      {/* New Dispatch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Dispatch"
        size="md"
      >
        <form onSubmit={handleNewDispatch} className="space-y-5">
          <div>
            <label className="label-light">Partner *</label>
            <select
              value={formData.partnerId}
              onChange={(e) => setFormData(prev => ({ ...prev, partnerId: e.target.value }))}
              className="input-light"
              required
            >
              <option value="">Select partner</option>
              {partners.filter(p => p.status === 'active').map(partner => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </select>
          </div>
          
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
                  {product.name} (Available: {getAvailableStock(product.id)} packets)
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label-light">Packets *</label>
            <input
              type="number"
              value={formData.packetsRequested}
              onChange={(e) => setFormData(prev => ({ ...prev, packetsRequested: e.target.value }))}
              className="input-light"
              placeholder="Number of packets"
              min="1"
              max={formData.productId ? getAvailableStock(parseInt(formData.productId)) : undefined}
              required
            />
            {formData.productId && (
              <p className="text-sm text-olive mt-1">
                Available: {getAvailableStock(parseInt(formData.productId))} packets
              </p>
            )}
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
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Create Dispatch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DispatchPage;
