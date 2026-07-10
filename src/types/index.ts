export interface CustomerLookupResponse {
  customerExists: boolean;
  customer?: {
    customerId: string;
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
