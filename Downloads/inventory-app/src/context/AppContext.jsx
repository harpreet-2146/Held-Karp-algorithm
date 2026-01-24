import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  initialProducts,
  initialPartners,
  initialProduction,
  initialDispatchRequests,
  initialSales,
  initialDamageReports,
  initialPayments,
  ROLES,
} from '../data/mockData';
import { generateId, getToday } from '../utils/calculations';

// Create context
const AppContext = createContext(null);

// Provider component
export const AppProvider = ({ children }) => {
  // Current user/role state
  const [currentRole, setCurrentRole] = useState(null); // null means not logged in
  const [currentPartnerId, setCurrentPartnerId] = useState(null); // For partner view
  
  // Data state
  const [products, setProducts] = useState(initialProducts);
  const [partners, setPartners] = useState(initialPartners);
  const [production, setProduction] = useState(initialProduction);
  const [dispatchRequests, setDispatchRequests] = useState(initialDispatchRequests);
  const [sales, setSales] = useState(initialSales);
  const [damageReports, setDamageReports] = useState(initialDamageReports);
  const [payments, setPayments] = useState(initialPayments);
  
  // UI state
  const [notifications, setNotifications] = useState([]);
  
  // ---- AUTH ACTIONS ----
  
  const login = useCallback((role, partnerId = null) => {
    setCurrentRole(role);
    if (role === ROLES.PARTNER && partnerId) {
      setCurrentPartnerId(partnerId);
    } else {
      setCurrentPartnerId(null);
    }
  }, []);
  
  const logout = useCallback(() => {
    setCurrentRole(null);
    setCurrentPartnerId(null);
  }, []);
  
  const switchRole = useCallback((role, partnerId = null) => {
    login(role, partnerId);
  }, [login]);
  
  // ---- NOTIFICATION HELPERS ----
  
  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);
  
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  // ---- PRODUCT ACTIONS ----
  
  const addProduct = useCallback((productData) => {
    const newProduct = {
      ...productData,
      id: generateId(products),
      createdAt: getToday(),
      isActive: true,
    };
    setProducts(prev => [...prev, newProduct]);
    addNotification(`Product "${newProduct.name}" added successfully`, 'success');
    return newProduct;
  }, [products, addNotification]);
  
  const updateProduct = useCallback((productId, updates) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, ...updates } : p
    ));
    addNotification('Product updated successfully', 'success');
  }, [addNotification]);
  
  const deleteProduct = useCallback((productId) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, isActive: false } : p
    ));
    addNotification('Product deactivated', 'info');
  }, [addNotification]);
  
  // ---- PARTNER ACTIONS ----
  
  const addPartner = useCallback((partnerData) => {
    const newPartner = {
      ...partnerData,
      id: generateId(partners),
      createdAt: getToday(),
      status: 'active',
    };
    setPartners(prev => [...prev, newPartner]);
    addNotification(`Partner "${newPartner.name}" added successfully`, 'success');
    return newPartner;
  }, [partners, addNotification]);
  
  const updatePartner = useCallback((partnerId, updates) => {
    setPartners(prev => prev.map(p => 
      p.id === partnerId ? { ...p, ...updates } : p
    ));
    addNotification('Partner updated successfully', 'success');
  }, [addNotification]);
  
  // ---- PRODUCTION ACTIONS ----
  
  const recordProduction = useCallback((productionData) => {
    const newProduction = {
      ...productionData,
      id: generateId(production),
      productionDate: productionData.productionDate || getToday(),
    };
    setProduction(prev => [...prev, newProduction]);
    addNotification(`Production recorded: ${newProduction.packetsProduced} packets`, 'success');
    return newProduction;
  }, [production, addNotification]);
  
  // ---- DISPATCH REQUEST ACTIONS ----
  
  const createDispatchRequest = useCallback((requestData) => {
    const newRequest = {
      ...requestData,
      id: generateId(dispatchRequests),
      status: 'pending',
      requestedAt: getToday(),
      approvedAt: null,
      dispatchedAt: null,
      receivedAt: null,
      packetsApproved: null,
    };
    setDispatchRequests(prev => [...prev, newRequest]);
    addNotification('Stock request submitted', 'success');
    return newRequest;
  }, [dispatchRequests, addNotification]);
  
  const approveDispatchRequest = useCallback((requestId, packetsApproved) => {
    setDispatchRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { ...r, status: 'approved', packetsApproved, approvedAt: getToday() }
        : r
    ));
    addNotification('Request approved', 'success');
  }, [addNotification]);
  
  const rejectDispatchRequest = useCallback((requestId, reason) => {
    setDispatchRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { ...r, status: 'rejected', notes: reason, approvedAt: getToday() }
        : r
    ));
    addNotification('Request rejected', 'info');
  }, [addNotification]);
  
  const markAsDispatched = useCallback((requestId) => {
    setDispatchRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { ...r, status: 'dispatched', dispatchedAt: getToday() }
        : r
    ));
    addNotification('Stock dispatched', 'success');
  }, [addNotification]);
  
  const confirmReceipt = useCallback((requestId) => {
    setDispatchRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { ...r, status: 'received', receivedAt: getToday() }
        : r
    ));
    addNotification('Receipt confirmed', 'success');
  }, [addNotification]);
  
  // ---- SALES ACTIONS ----
  
  const recordSale = useCallback((saleData) => {
    const newSale = {
      ...saleData,
      id: generateId(sales),
      saleDate: saleData.saleDate || getToday(),
    };
    setSales(prev => [...prev, newSale]);
    addNotification(`Sale recorded: ${newSale.packetsSold} packets`, 'success');
    return newSale;
  }, [sales, addNotification]);
  
  // ---- DAMAGE REPORT ACTIONS ----
  
  const reportDamage = useCallback((damageData) => {
    const newReport = {
      ...damageData,
      id: generateId(damageReports),
      status: 'pending',
      reportedAt: getToday(),
      resolvedAt: null,
      replacementDispatchId: null,
    };
    setDamageReports(prev => [...prev, newReport]);
    addNotification('Damage report submitted', 'success');
    return newReport;
  }, [damageReports, addNotification]);
  
  const approveDamageReport = useCallback((reportId) => {
    setDamageReports(prev => prev.map(r => 
      r.id === reportId 
        ? { ...r, status: 'approved', resolvedAt: getToday() }
        : r
    ));
    addNotification('Damage report approved', 'success');
  }, [addNotification]);
  
  const rejectDamageReport = useCallback((reportId) => {
    setDamageReports(prev => prev.map(r => 
      r.id === reportId 
        ? { ...r, status: 'rejected', resolvedAt: getToday() }
        : r
    ));
    addNotification('Damage report rejected', 'info');
  }, [addNotification]);
  
  // ---- PAYMENT ACTIONS ----
  
  const recordPayment = useCallback((paymentData) => {
    const newPayment = {
      ...paymentData,
      id: generateId(payments),
      paymentDate: paymentData.paymentDate || getToday(),
    };
    setPayments(prev => [...prev, newPayment]);
    addNotification(`Payment recorded: ₹${newPayment.amount}`, 'success');
    return newPayment;
  }, [payments, addNotification]);
  
  // Context value
  const value = {
    // Auth state
    currentRole,
    currentPartnerId,
    isLoggedIn: currentRole !== null,
    isAdmin: currentRole === ROLES.ADMIN,
    isManufacturer: currentRole === ROLES.MANUFACTURER,
    isPartner: currentRole === ROLES.PARTNER,
    
    // Auth actions
    login,
    logout,
    switchRole,
    
    // Data
    products,
    partners,
    production,
    dispatchRequests,
    sales,
    damageReports,
    payments,
    
    // Product actions
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Partner actions
    addPartner,
    updatePartner,
    
    // Production actions
    recordProduction,
    
    // Dispatch actions
    createDispatchRequest,
    approveDispatchRequest,
    rejectDispatchRequest,
    markAsDispatched,
    confirmReceipt,
    
    // Sales actions
    recordSale,
    
    // Damage actions
    reportDamage,
    approveDamageReport,
    rejectDamageReport,
    
    // Payment actions
    recordPayment,
    
    // Notifications
    notifications,
    addNotification,
    removeNotification,
    
    // Constants
    ROLES,
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook for using context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppContext;
