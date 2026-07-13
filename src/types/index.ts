export interface CustomerLookupResponse {
  customerExists: boolean;
  lastCheckinAt?: string | null;
  customer?: {
    _id?: string;
    customerId?: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    birthday: string;
    allowSMS: boolean;
    allowEmail: boolean;
    statistics?: {
      lastVisit?: string;
      totalVisits?: number;
    };
  };
}

export interface CheckInResponse {
  message: string;
  customerExists: boolean;
  customer?: CustomerLookupResponse['customer'];
  checkin?: {
    checkinId: string;
    checkedInAt: string;
  };
}

export interface RegisterCustomerResponse {
  message: string;
  customer?: CustomerLookupResponse['customer'];
  checkin?: {
    checkinId: string;
    checkedInAt: string;
  };
}

export interface StaffAuthResponse {
  valid: boolean;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface TodayCheckedInCustomersResponse {
  customers: Array<{
    checkinId: string;
    checkedInAt: string;
    customerId: string;
    firstName: string;
    lastName: string;
    phone: string;
  }>;
}

export interface Technician {
  id: string;
  firstName: string;
  lastName: string;
}

export interface TechniciansResponse {
  technicians: Technician[];
}

export interface InventoryItem {
  id: string;
  category: string;
  itemName: string;
  unitCost: number;
}

export interface InventoryResponse {
  items: InventoryItem[];
}

export interface ServiceTypeItem {
  id: string;
  serviceType: string;
  price: number;
}

export interface ServiceTypesResponse {
  services: ServiceTypeItem[];
}

export interface CustomerCartServiceItem {
  serviceTypeId: string;
  serviceType: string;
  unitPrice: number;
  isCustomPrice?: boolean;
}

export interface CustomerCartInventoryItem {
  inventoryId: string;
  itemName: string;
  unitPrice: number;
  category?: string;
}

export interface CustomerCart {
  cartId: string;
  businessId: string;
  storeId: string;
  customerId: string;
  customerSnapshot?: {
    firstName?: string;
    lastName?: string;
  };
  technicianId?: string;
  services: CustomerCartServiceItem[];
  inventoryItems: CustomerCartInventoryItem[];
  pricing: {
    subtotal: number;
    total: number;
  };
  currency?: string;
  status: string;
}

export interface CustomerCartResponse {
  cart: CustomerCart | null;
}

export interface SaveCartResponse {
  message: string;
  cart: CustomerCart | null;
}

export interface CheckoutResponse {
  message: string;
  order: {
    orderId: string;
  };
}

export type StoreReportType = 'today' | 'week' | 'month' | 'custom';

export interface StoreReportResponse {
  reportType: StoreReportType;
  from: string;
  to: string;
  totalAmount: number;
  technicianBreakdown: Array<{
    technicianId: string;
    firstName: string;
    lastName: string;
    subtotal: number;
  }>;
}
