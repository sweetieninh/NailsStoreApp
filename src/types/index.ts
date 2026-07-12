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
