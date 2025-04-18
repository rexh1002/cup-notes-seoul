export interface Cafe {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  description?: string;
  coffees?: Coffee[];
  lastUpdated?: string; // ISO 8601 형식의 날짜 문자열
  // ... existing fields ...
} 