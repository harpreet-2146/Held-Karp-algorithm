// ============================================
// UTILITY FUNCTIONS
// ============================================

import { format, parseISO, isToday, isThisWeek, isThisMonth } from 'date-fns';

// ---- DATE FORMATTING ----

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    return format(parseISO(dateString), 'dd MMM yyyy');
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  try {
    return format(parseISO(dateString), 'dd MMM yyyy, hh:mm a');
  } catch {
    return dateString;
  }
};

export const formatDateShort = (dateString) => {
  if (!dateString) return '—';
  try {
    return format(parseISO(dateString), 'dd/MM/yy');
  } catch {
    return dateString;
  }
};

export const getToday = () => format(new Date(), 'yyyy-MM-dd');

// ---- CURRENCY FORMATTING ----

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};

// ---- INVENTORY CALCULATIONS ----

/**
 * Calculate factory stock for a product
 * Factory Stock = Total Produced - Total Dispatched (that were received)
 */
export const calculateFactoryStock = (productId, production, dispatchRequests) => {
  const totalProduced = production
    .filter(p => p.productId === productId)
    .reduce((sum, p) => sum + p.packetsProduced, 0);
  
  const totalDispatched = dispatchRequests
    .filter(d => d.productId === productId && ['dispatched', 'received'].includes(d.status))
    .reduce((sum, d) => sum + (d.packetsApproved || 0), 0);
  
  return totalProduced - totalDispatched;
};

/**
 * Calculate partner stock for a product
 * Partner Stock = Total Received - Total Sold - Total Damaged (approved)
 */
export const calculatePartnerStock = (partnerId, productId, dispatchRequests, sales, damageReports) => {
  const totalReceived = dispatchRequests
    .filter(d => d.partnerId === partnerId && d.productId === productId && d.status === 'received')
    .reduce((sum, d) => sum + (d.packetsApproved || 0), 0);
  
  const totalSold = sales
    .filter(s => s.partnerId === partnerId && s.productId === productId)
    .reduce((sum, s) => sum + s.packetsSold, 0);
  
  const totalDamaged = damageReports
    .filter(d => d.partnerId === partnerId && d.productId === productId && d.status === 'approved')
    .reduce((sum, d) => sum + d.packetsDamaged, 0);
  
  return totalReceived - totalSold - totalDamaged;
};

/**
 * Calculate total stock at all partners for a product
 */
export const calculateTotalPartnerStock = (productId, partners, dispatchRequests, sales, damageReports) => {
  return partners.reduce((total, partner) => {
    return total + calculatePartnerStock(partner.id, productId, dispatchRequests, sales, damageReports);
  }, 0);
};

// ---- FINANCIAL CALCULATIONS ----

/**
 * Calculate revenue from a sale
 * Revenue = packets sold × units per packet × MRP
 */
export const calculateSaleRevenue = (sale, product) => {
  if (!sale || !product) return 0;
  return sale.packetsSold * product.unitsPerPacket * product.mrp;
};

/**
 * Calculate manufacturer's share from a sale
 */
export const calculateManufacturerShare = (sale, product) => {
  const revenue = calculateSaleRevenue(sale, product);
  return (revenue * product.manufacturerSharePct) / 100;
};

/**
 * Calculate partner's commission from a sale
 */
export const calculatePartnerCommission = (sale, product) => {
  const revenue = calculateSaleRevenue(sale, product);
  return (revenue * product.partnerSharePct) / 100;
};

/**
 * Calculate total amount owed by a partner
 * Amount Owed = Sum of manufacturer shares from all sales - Sum of payments
 */
export const calculatePartnerOwes = (partnerId, sales, payments, products) => {
  const totalManufacturerShare = sales
    .filter(s => s.partnerId === partnerId)
    .reduce((sum, sale) => {
      const product = products.find(p => p.id === sale.productId);
      return sum + calculateManufacturerShare(sale, product);
    }, 0);
  
  const totalPaid = payments
    .filter(p => p.partnerId === partnerId)
    .reduce((sum, p) => sum + p.amount, 0);
  
  return totalManufacturerShare - totalPaid;
};

/**
 * Calculate total partner earnings (commissions)
 */
export const calculatePartnerEarnings = (partnerId, sales, products) => {
  return sales
    .filter(s => s.partnerId === partnerId)
    .reduce((sum, sale) => {
      const product = products.find(p => p.id === sale.productId);
      return sum + calculatePartnerCommission(sale, product);
    }, 0);
};

// ---- SUMMARY CALCULATIONS ----

/**
 * Get overall stats for admin/manufacturer dashboard
 */
export const getOverallStats = (products, partners, production, dispatchRequests, sales, damageReports, payments) => {
  // Total factory stock (all products)
  const totalFactoryStock = products.reduce((sum, product) => {
    return sum + calculateFactoryStock(product.id, production, dispatchRequests);
  }, 0);
  
  // Total stock at partners
  const totalPartnerStock = products.reduce((sum, product) => {
    return sum + calculateTotalPartnerStock(product.id, partners, dispatchRequests, sales, damageReports);
  }, 0);
  
  // Total sales (in packets)
  const totalPacketsSold = sales.reduce((sum, s) => sum + s.packetsSold, 0);
  
  // Total revenue
  const totalRevenue = sales.reduce((sum, sale) => {
    const product = products.find(p => p.id === sale.productId);
    return sum + calculateSaleRevenue(sale, product);
  }, 0);
  
  // Total receivables
  const totalReceivables = partners.reduce((sum, partner) => {
    return sum + Math.max(0, calculatePartnerOwes(partner.id, sales, payments, products));
  }, 0);
  
  // Pending requests
  const pendingRequests = dispatchRequests.filter(d => d.status === 'pending').length;
  
  // Pending damage reports
  const pendingDamages = damageReports.filter(d => d.status === 'pending').length;
  
  return {
    totalFactoryStock,
    totalPartnerStock,
    totalStock: totalFactoryStock + totalPartnerStock,
    totalPacketsSold,
    totalRevenue,
    totalReceivables,
    pendingRequests,
    pendingDamages,
    activePartners: partners.filter(p => p.status === 'active').length,
    activeProducts: products.filter(p => p.isActive).length,
  };
};

/**
 * Get stats for a specific partner
 */
export const getPartnerStats = (partnerId, products, dispatchRequests, sales, damageReports, payments) => {
  // Total stock at this partner
  const totalStock = products.reduce((sum, product) => {
    return sum + calculatePartnerStock(partnerId, product.id, dispatchRequests, sales, damageReports);
  }, 0);
  
  // Total packets sold
  const totalPacketsSold = sales
    .filter(s => s.partnerId === partnerId)
    .reduce((sum, s) => sum + s.packetsSold, 0);
  
  // Total revenue
  const totalRevenue = sales
    .filter(s => s.partnerId === partnerId)
    .reduce((sum, sale) => {
      const product = products.find(p => p.id === sale.productId);
      return sum + calculateSaleRevenue(sale, product);
    }, 0);
  
  // Total earnings (commission)
  const totalEarnings = calculatePartnerEarnings(partnerId, sales, products);
  
  // Amount owed to manufacturer
  const amountOwed = calculatePartnerOwes(partnerId, sales, payments, products);
  
  // Total paid
  const totalPaid = payments
    .filter(p => p.partnerId === partnerId)
    .reduce((sum, p) => sum + p.amount, 0);
  
  return {
    totalStock,
    totalPacketsSold,
    totalRevenue,
    totalEarnings,
    amountOwed: Math.max(0, amountOwed),
    totalPaid,
  };
};

// ---- FILTERING HELPERS ----

export const filterByDateRange = (items, dateField, startDate, endDate) => {
  return items.filter(item => {
    const itemDate = parseISO(item[dateField]);
    const start = startDate ? parseISO(startDate) : null;
    const end = endDate ? parseISO(endDate) : null;
    
    if (start && end) {
      return itemDate >= start && itemDate <= end;
    } else if (start) {
      return itemDate >= start;
    } else if (end) {
      return itemDate <= end;
    }
    return true;
  });
};

export const filterTodaySales = (sales) => {
  return sales.filter(s => {
    try {
      return isToday(parseISO(s.saleDate));
    } catch {
      return false;
    }
  });
};

export const filterThisWeekSales = (sales) => {
  return sales.filter(s => {
    try {
      return isThisWeek(parseISO(s.saleDate));
    } catch {
      return false;
    }
  });
};

export const filterThisMonthSales = (sales) => {
  return sales.filter(s => {
    try {
      return isThisMonth(parseISO(s.saleDate));
    } catch {
      return false;
    }
  });
};

// ---- ID GENERATION ----

export const generateId = (existingItems) => {
  if (!existingItems || existingItems.length === 0) return 1;
  return Math.max(...existingItems.map(item => item.id)) + 1;
};

// ---- STATUS HELPERS ----

export const getStatusColor = (status) => {
  const colors = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    dispatched: 'badge-dispatched',
    received: 'badge-received',
    replaced: 'badge-approved',
    active: 'badge-approved',
    inactive: 'badge-info',
  };
  return colors[status] || 'badge-info';
};

export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    dispatched: 'Dispatched',
    received: 'Received',
    replaced: 'Replaced',
    active: 'Active',
    inactive: 'Inactive',
  };
  return labels[status] || status;
};
