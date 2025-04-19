export interface Coffee {
  id: string;
  name: string;
  price?: number | null;
  description?: string | null;
  roastLevel?: string[] | null;
  origins?: string[] | null;
  processes?: string[] | null;
  brewMethods?: string[] | null;
  notes?: string[] | null;
  noteColors?: string[] | null;
}

export interface Cafe {
  id: string;
  name: string;
  address: string;
  phone?: string | null;
  description?: string | null;
  businessHours?: any;
  businessHourNote?: string | null;
  snsLinks?: any;
  imageUrl?: string | null;
  adminId?: string | null;
  managerId?: string | null;
  coffees?: Coffee[];
  createdAt?: Date;
  updatedAt?: Date;
} 