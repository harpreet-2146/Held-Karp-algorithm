// ============================================
// DAMAGE REPORTS PAGE
// ============================================

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Check, 
  X, 
  Clock,
  Package
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal, Badge, EmptyState, Tabs } from '../components/UI';
import { formatDate } from '../utils/calculations';

const DamagesPage = () => {
  const { 
    products, 
    partners, 
    damageReports,
    approveDamageReport,
    rejectDamageReport
  } = useApp();
  
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedReport, setSelectedReport] = useState(null);
  
  const tabs = [
    { id: 'pending', label: `Pending (${damageReports.filter(d => d.status === 'pending').length})` },
    { id: 'resolved', label: 'Resolved' },
    { id: 'all', label: 'All Reports' },
  ];
  
  // Filter reports by status
  const getFilteredReports = () => {
    switch (activeTab) {
      case 'pending':
        return damageReports.filter(d => d.status === 'pending');
      case 'resolved':
        return damageReports.filter(d => ['approved', 'rejected', 'replaced'].includes(d.status));
      default:
        return damageReports;
    }
  };
  
  const filteredReports = getFilteredReports()
    .sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
  
  const handleApprove = (reportId) => {
    approveDamageReport(reportId);
  };
  
  const handleReject = (reportId) => {
    rejectDamageReport(reportId);
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Damage Reports</h1>
          <p className="page-subtitle">
            Review and manage damage reports from partners
          </p>
        </div>
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
              description={activeTab === 'pending' 
                ? "No pending damage reports to review." 
                : "No damage reports found in this category."}
            />
          </div>
        ) : (
          filteredReports.map(report => {
            const partner = partners.find(p => p.id === report.partnerId);
            const product = products.find(p => p.id === report.productId);
            
            return (
              <div key={report.id} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                          {partner?.name}
                        </h3>
                        <Badge status={report.status}>{report.status}</Badge>
                      </div>
                      <p className="text-olive mb-2">
                        <span className="font-medium text-burgundy">{report.packetsDamaged} packets</span> of {product?.name} damaged
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
                  
                  {/* Actions */}
                  {report.status === 'pending' && (
                    <div className="flex items-center gap-2 lg:flex-shrink-0">
                      <button
                        onClick={() => handleApprove(report.id)}
                        className="btn btn-primary btn-sm"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(report.id)}
                        className="btn btn-danger btn-sm"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DamagesPage;
