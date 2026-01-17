
export type UnitOfMeasure = 'pcs' | 'kg' | 'meter' | 'box' | 'liters' | 'units' | 'NOS';
export type MovementType = 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'TRANSFER' | 'PO' | 'SO' | 'GRN' | 'CHALLAN' | 'CREDIT_NOTE' | 'DEBIT_NOTE';
export type UserRole = 'Owner' | 'Manager';

export type DocumentType = 
  | 'PURCHASE_BILL' 
  | 'SALES_BILL' 
  | 'GRN' 
  | 'PO' 
  | 'SO' 
  | 'DELIVERY_CHALLAN' 
  | 'ADJUSTMENT_BILL' 
  | 'CREDIT_DEBIT_NOTE';

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}

export interface Entity {
  id: string;
  name: string;
  type: 'SUPPLIER' | 'CUSTOMER';
  contact: string;
  email: string;
  gstin?: string;
  address?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  hsnCode: string;
  brand: string;
  category: string;
  uom: UnitOfMeasure;
  quantity: number;
  minStock: number;
  maxStock: number;
  purchasePrice: number; // Current/Last purchase price
  sellingPrice: number;
  warehouseId: string;
  description: string;
  imageUrl?: string;
  lastUpdated: string;
}

export interface DocumentRecord {
  id: string;
  docType: DocumentType;
  docNo: string;
  partnerName: string;
  partnerContact: string;
  gstin?: string; // Added for ITR/Account management
  billingAddress?: string; // Added for ITR/Account management
  paymentStatus: 'PAID' | 'CREDIT' | 'PENDING';
  discountPercentage: number;
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
  timestamp: string;
  vehicleNo?: string;
  notes?: string;
  items: {
    productId: string;
    name: string;
    hsn: string;
    quantity: number;
    price: number;
    uom: string;
  }[];
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number;
  reason: string;
  docRef?: string;
  warehouseId: string;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  details: string;
  user: string;
  timestamp: string;
}

export interface AIInsight {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  action?: string;
}

export type AppView = 'dashboard' | 'inventory' | 'partners' | 'reports' | 'audit' | 'billing' | 'billing-history' | 'business-sheet' | 'help' | 'ai-assistant';
