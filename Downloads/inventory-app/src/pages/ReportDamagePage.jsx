// ============================================
// REPORT DAMAGE PAGE (PARTNER)
// ============================================

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Plus,
  Clock,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal, Badge, EmptyState, Tabs } from '../components/UI';
import { 
  formatDate,
  calculatePartnerStock
} from '../utils/calculations';

const ReportDamagePage = () => {
  const { 
    currentPartnerId,
    products, 
    dispatchRequests,
    sales,
    damageReports,
    reportDamage
  } = useApp();
  
  const [activeTab, setActiveTab] = useState('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    packetsDamaged: '',
    reason: '',
  });
  
  // Filter damage reports for this partner
  const myReports = damageReports.filter(d => d.partnerId === currentPartnerId);
  
  const tabs = [
    { id: 'pending', label: `Pending (${myReports.filter(d => d.status === 'pending').length})` },
    { id: 'resolved', label: 'Resolved' },
    { id: 'all', label: 'All' },
  ];
  
  const getFilteredReports = () => {
    switch (activeTab) {
      case 'pending':
        return myReports.filter(d => d.status === 'pending');
      case 'resolved':
        return myReports.filter(d => ['approved', 'rejected', 'replaced'].includes(d.status));
      default:
        return myReports;
    }
  };
  
  const filteredReports = getFilteredReports()
    .sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
  
  // Get products with stock
  const productsWithStock = products.filter(p => p.isActive).map(product => ({
    ...product,
    stock: calculatePartnerStock(currentPartnerId, product.id, dispatchRequests, sales, damageReports)
  })).filter(p => p.stock > 0);
  
  // Handle new report
  const handleSubmit = (e) => {
    e.preventDefault();
    
    reportDamage({
      partnerId: currentPartnerId,
      productId: parseInt(formData.productId),
      packetsDamaged: parseInt(formData.packetsDamaged),
      reason: formData.reason,
    });
    
    setIsModalOpen(false);
    setFormData({
      productId: '',
      packetsDamaged: '',
      reason: '',
    });
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Damage Reports</h1>
          <p className="page-subtitle">
            Report damaged goods and track replacement status
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-danger">
          <Plus className="w-5 h-5" />
          <span>Report Damage</span>
        </button>
      </div>
      
      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={AlertTriangle}
              title={`No ${activeTab === 'all' ? '' : activeTab} damage reports`}
              description="No damage reports found. Report damaged goods to request replacement."
            />
          </div>
        ) : (
          filteredReports.map(report => {
            const product = products.find(p => p.id === report.productId);
            
            return (
              <div key={report.id} className="card">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Report Info */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      report.status === 'pending' ? 'bg-amber-500/10' :
                      report.status === 'approved' || report.status === 'replaced' ? 'bg-emerald-500/10' :
                      'bg-red-500/10'
                    }`}>
                      {report.status === 'pending' && <Clock className="w-6 h-6 text-amber-500" />}
                      {(report.status === 'approved' || report.status === 'replaced') && <Check className="w-6 h-6 text-emerald-500" />}
                      {report.status === 'rejected' && <X className="w-6 h-6 text-red-500" />}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-black">
                          {product?.name}
                        </h3>
                        <Badge status={report.status}>{report.status}</Badge>
                      </div>
                      <p className="text-burgundy font-medium mb-2">
                        {report.packetsDamaged} packets damaged
                      </p>
                      <div className="p-3 bg-olive/5 rounded-lg mb-2">
                        <p className="text-sm text-black">
                          <span className="text-olive">Reason: </span>
                          {report.reason}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-olive">
                        <span>Reported: {formatDate(report.reportedAt)}</span>
                        {report.resolvedAt && <span>Resolved: {formatDate(report.resolvedAt)}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Report Damage Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Report Damaged Goods"
        size="md"
      >
        {productsWithStock.length === 0 ? (
          <div className="py-8 text-center">
            <AlertTriangle className="w-12 h-12 text-olive/30 mx-auto mb-3" />
            <p className="text-black font-medium">No stock to report</p>
            <p className="text-sm text-olive">You need stock to report damages.</p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary mt-4"
            >
              Close
            </button>
          </div>
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
                {productsWithStock.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} — {product.stock} packets available
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="label-light">Packets Damaged *</label>
              <input
                type="number"
                value={formData.packetsDamaged}
                onChange={(e) => setFormData(prev => ({ ...prev, packetsDamaged: e.target.value }))}
                className="input-light"
                placeholder="Number of damaged packets"
                min="1"
                max={formData.productId ? productsWithStock.find(p => p.id === parseInt(formData.productId))?.stock : undefined}
                required
              />
            </div>
            
            <div>
              <label className="label-light">Reason for Damage *</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                className="input-light"
                rows={3}
                placeholder="Describe how the damage occurred..."
                required
              />
            </div>
            
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm text-amber-700">
                <strong>Note:</strong> Damaged goods will be reviewed by the manufacturer. 
                If approved, you'll receive replacement stock.
              </p>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-danger flex-1">
                Submit Report
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ReportDamagePage;
