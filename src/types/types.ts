// types/types.ts

// 좌표 정보를 위한 인터페이스
export interface Coordinates {
  lat: number;
  lng: number;
}

// BusinessHour 인터페이스 추가
export interface BusinessHour {
  day: string;
  openTime: string;
  closeTime: string;
}

// SnsLink 인터페이스 추가
export interface SnsLink {
  type: string;
  url: string;
}

// CustomFields 인터페이스 추가
export interface CustomFields {
  origins: string[];
  processes: string[];
  brewMethods: string[];
  roastLevels: string[];
  notes: {
    floral: string[];
    fruity: string[];
    nutty: string[];
  };
}

// Coffee 인터페이스 수정
export interface Coffee {
  id: string;
  name: string;
  price: number;
  description?: string;
  roastLevel: string[];
  origins: string[];
  processes: string[];
  notes: string[];
  noteColors: string[];
  brewMethods: string[];
  customFields: CustomFields;
  cafeId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Cafe 인터페이스 수정
export interface Cafe {
  id: string;
  name: string;
  address: string;
  phone: string;
  description?: string;
  businessHours: BusinessHour[];
  businessHourNote?: string;
  snsLinks: SnsLink[];
  rating?: number;
  distance?: string;
  openUntil?: string;
  cupNotes?: string[];
  imageUrl?: string;
  coordinates?: Coordinates;
  adminId?: string;
  managerId?: string;
  coffees: Coffee[];
  createdAt: Date;
  updatedAt: Date;
}

// 지도 props 인터페이스
export interface MapProps {
  cafes: Cafe[];
}

// 검색 파라미터 인터페이스
export interface SearchParams {
  keyword?: string;
  notes: string[];
  category: string;
  subCategory: string;
  origins: string[];
  processes: string[];
  roastLevel: string | string[];
  brewMethod: string[];
}