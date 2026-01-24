// ============================================
// REUSABLE UI COMPONENTS
// ============================================

import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// ---- BADGE COMPONENT ----
export const Badge = ({ status, children, className = '' }) => {
  const statusClasses = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    dispatched: 'badge-dispatched',
    received: 'badge-received',
    replaced: 'badge-approved',
    active: 'badge-approved',
    inactive: 'badge-info',
    success: 'badge-approved',
    warning: 'badge-pending',
    danger: 'badge-rejected',
    info: 'badge-info',
  };
  
  return (
    <span className={`badge ${statusClasses[status] || 'badge-info'} ${className}`}>
      {children}
    </span>
  );
};

// ---- STAT CARD COMPONENT ----
export const StatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  trend, 
  onClick,
  className = '' 
}) => {
  return (
    <div 
      className={`stat-card ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-value">{value}</p>
          <p className="stat-label">{label}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-olive/10 rounded-lg">
            <Icon className="w-6 h-6 text-olive" />
          </div>
        )}
      </div>
    </div>
  );
};

// ---- MODAL COMPONENT ----
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };
  
  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className={`modal-content ${sizeClasses[size]}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-display font-bold text-black">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-olive/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>
        {children}
      </div>
    </>
  );
};

// ---- EMPTY STATE COMPONENT ----
export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="empty-state">
      {Icon && <Icon className="empty-state-icon" />}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-text">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

// ---- NOTIFICATION TOAST ----
export const Toast = ({ message, type = 'info', onClose }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };
  
  const colors = {
    success: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
    error: 'bg-red-500/20 border-red-500/30 text-red-400',
    warning: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  };
  
  const Icon = icons[type] || Info;
  
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${colors[type]} animate-slide-down`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-auto hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ---- NOTIFICATIONS CONTAINER ----
export const NotificationsContainer = ({ notifications, onRemove }) => {
  if (!notifications || notifications.length === 0) return null;
  
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map(notification => (
        <Toast
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
};

// ---- LOADING SPINNER ----
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="w-full h-full border-2 border-olive/20 border-t-olive rounded-full animate-spin" />
    </div>
  );
};

// ---- LOADING STATE ----
export const LoadingState = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Spinner size="lg" />
      <p className="mt-4 text-olive">{message}</p>
    </div>
  );
};

// ---- CONFIRM DIALOG ----
export const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger' 
}) => {
  if (!isOpen) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-black/70 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn btn-secondary">
          {cancelText}
        </button>
        <button 
          onClick={onConfirm} 
          className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

// ---- DROPDOWN MENU ----
export const Dropdown = ({ trigger, children, align = 'right' }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className={`absolute top-full mt-2 ${align === 'right' ? 'right-0' : 'left-0'} bg-cream rounded-lg shadow-card-hover border border-olive/10 py-2 min-w-[200px] z-50 animate-slide-down`}>
          {React.Children.map(children, child => 
            React.cloneElement(child, { onClick: () => setIsOpen(false) })
          )}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ icon: Icon, children, onClick, danger = false }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-olive/10 transition-colors ${danger ? 'text-burgundy' : 'text-black'}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span className="text-sm font-medium">{children}</span>
    </button>
  );
};

// ---- TAB NAVIGATION ----
export const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex gap-1 bg-charcoal/50 p-1 rounded-lg">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-cream text-black'
              : 'text-cream/70 hover:text-cream hover:bg-white/5'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
