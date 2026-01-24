// ============================================
// DATA MODELS & INITIAL MOCK DATA
// ============================================

// Product: What the manufacturer makes
export const initialProducts = [
  {
    id: 1,
    name: 'Aloo Parantha',
    description: 'Classic potato stuffed parantha',
    mrp: 100, // Price per unit (single parantha)
    unitsPerPacket: 10, // How many paranthas in 1 packet
    manufacturerSharePct: 70, // Manufacturer gets 70%
    partnerSharePct: 30, // Partner keeps 30%
    createdAt: '2024-01-01',
    isActive: true,
  },
  {
    id: 2,
    name: 'Paneer Parantha',
    description: 'Premium cottage cheese parantha',
    mrp: 120,
    unitsPerPacket: 8,
    manufacturerSharePct: 70,
    partnerSharePct: 30,
    createdAt: '2024-01-01',
    isActive: true,
  },
  {
    id: 3,
    name: 'Gobi Parantha',
    description: 'Cauliflower stuffed parantha',
    mrp: 90,
    unitsPerPacket: 10,
    manufacturerSharePct: 70,
    partnerSharePct: 30,
    createdAt: '2024-01-05',
    isActive: true,
  },
  {
    id: 4,
    name: 'Mix Veg Sabji',
    description: 'Ready to eat mixed vegetable curry',
    mrp: 80,
    unitsPerPacket: 5,
    manufacturerSharePct: 65,
    partnerSharePct: 35,
    createdAt: '2024-01-10',
    isActive: true,
  },
];

// Partners: Retailers who sell on behalf of manufacturer
export const initialPartners = [
  {
    id: 1,
    name: 'ABC Store',
    contactPerson: 'Rahul Sharma',
    phone: '+91 98765 43210',
    email: 'rahul@abcstore.com',
    address: '123 Main Market, Delhi',
    status: 'active',
    createdAt: '2024-01-01',
  },
  {
    id: 2,
    name: 'DEF Mart',
    contactPerson: 'Priya Singh',
    phone: '+91 87654 32109',
    email: 'priya@defmart.com',
    address: '456 Commercial Complex, Gurgaon',
    status: 'active',
    createdAt: '2024-01-05',
  },
  {
    id: 3,
    name: 'GHI Foods',
    contactPerson: 'Amit Kumar',
    phone: '+91 76543 21098',
    email: 'amit@ghifoods.com',
    address: '789 Food Street, Noida',
    status: 'active',
    createdAt: '2024-01-10',
  },
];

// Production Records: When manufacturer produces stock
export const initialProduction = [
  {
    id: 1,
    productId: 1,
    packetsProduced: 100,
    productionDate: '2024-01-15',
    notes: 'First batch of the month',
  },
  {
    id: 2,
    productId: 2,
    packetsProduced: 50,
    productionDate: '2024-01-15',
    notes: 'Premium batch',
  },
  {
    id: 3,
    productId: 1,
    packetsProduced: 80,
    productionDate: '2024-01-20',
    notes: 'Second production run',
  },
  {
    id: 4,
    productId: 3,
    packetsProduced: 60,
    productionDate: '2024-01-22',
    notes: '',
  },
  {
    id: 5,
    productId: 4,
    packetsProduced: 40,
    productionDate: '2024-01-23',
    notes: 'New sabji line',
  },
];

// Dispatch Requests: Partner requests stock, goes through approval flow
// Status: pending → approved → dispatched → received | rejected
export const initialDispatchRequests = [
  {
    id: 1,
    partnerId: 1,
    productId: 1,
    packetsRequested: 30,
    packetsApproved: 30,
    status: 'received',
    requestedAt: '2024-01-16',
    approvedAt: '2024-01-16',
    dispatchedAt: '2024-01-17',
    receivedAt: '2024-01-17',
    notes: '',
  },
  {
    id: 2,
    partnerId: 2,
    productId: 1,
    packetsRequested: 25,
    packetsApproved: 25,
    status: 'received',
    requestedAt: '2024-01-16',
    approvedAt: '2024-01-16',
    dispatchedAt: '2024-01-17',
    receivedAt: '2024-01-18',
    notes: '',
  },
  {
    id: 3,
    partnerId: 1,
    productId: 2,
    packetsRequested: 15,
    packetsApproved: 15,
    status: 'received',
    requestedAt: '2024-01-18',
    approvedAt: '2024-01-18',
    dispatchedAt: '2024-01-19',
    receivedAt: '2024-01-19',
    notes: '',
  },
  {
    id: 4,
    partnerId: 3,
    productId: 1,
    packetsRequested: 20,
    packetsApproved: 20,
    status: 'dispatched',
    requestedAt: '2024-01-23',
    approvedAt: '2024-01-23',
    dispatchedAt: '2024-01-24',
    receivedAt: null,
    notes: 'In transit',
  },
  {
    id: 5,
    partnerId: 2,
    productId: 3,
    packetsRequested: 15,
    packetsApproved: null,
    status: 'pending',
    requestedAt: '2024-01-24',
    approvedAt: null,
    dispatchedAt: null,
    receivedAt: null,
    notes: 'Awaiting approval',
  },
  {
    id: 6,
    partnerId: 1,
    productId: 4,
    packetsRequested: 10,
    packetsApproved: null,
    status: 'pending',
    requestedAt: '2024-01-24',
    approvedAt: null,
    dispatchedAt: null,
    receivedAt: null,
    notes: '',
  },
];

// Sales: Partner records sales (in PACKETS, not units)
export const initialSales = [
  {
    id: 1,
    partnerId: 1,
    productId: 1,
    packetsSold: 10,
    saleDate: '2024-01-18',
    notes: '',
  },
  {
    id: 2,
    partnerId: 1,
    productId: 1,
    packetsSold: 8,
    saleDate: '2024-01-19',
    notes: '',
  },
  {
    id: 3,
    partnerId: 2,
    productId: 1,
    packetsSold: 12,
    saleDate: '2024-01-19',
    notes: 'Good day',
  },
  {
    id: 4,
    partnerId: 1,
    productId: 2,
    packetsSold: 5,
    saleDate: '2024-01-20',
    notes: '',
  },
  {
    id: 5,
    partnerId: 2,
    productId: 1,
    packetsSold: 8,
    saleDate: '2024-01-21',
    notes: '',
  },
  {
    id: 6,
    partnerId: 1,
    productId: 1,
    packetsSold: 6,
    saleDate: '2024-01-22',
    notes: '',
  },
];

// Damage Reports: Partner reports damaged goods
// Status: pending → approved → replaced | rejected
export const initialDamageReports = [
  {
    id: 1,
    partnerId: 1,
    productId: 1,
    packetsDamaged: 2,
    reason: 'Packaging torn during transit',
    status: 'approved',
    reportedAt: '2024-01-19',
    resolvedAt: '2024-01-20',
    replacementDispatchId: null,
  },
  {
    id: 2,
    partnerId: 2,
    productId: 1,
    packetsDamaged: 1,
    reason: 'Freezer malfunction',
    status: 'pending',
    reportedAt: '2024-01-23',
    resolvedAt: null,
    replacementDispatchId: null,
  },
];

// Payments: Partner pays manufacturer
export const initialPayments = [
  {
    id: 1,
    partnerId: 1,
    amount: 50000,
    paymentDate: '2024-01-20',
    paymentMethod: 'Bank Transfer',
    notes: 'First settlement',
  },
  {
    id: 2,
    partnerId: 2,
    amount: 30000,
    paymentDate: '2024-01-22',
    paymentMethod: 'UPI',
    notes: '',
  },
];

// User roles for the system
export const ROLES = {
  ADMIN: 'admin',
  MANUFACTURER: 'manufacturer',
  PARTNER: 'partner',
};

// Status constants
export const DISPATCH_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DISPATCHED: 'dispatched',
  RECEIVED: 'received',
};

export const DAMAGE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REPLACED: 'replaced',
};
