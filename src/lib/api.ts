import { prisma } from './prisma';

export interface CafeInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  description: string | null;
  businessHours: any; // [{ day: string, openTime: string, closeTime: string }]
  businessHourNote: string | null;
  snsLinks: any; // [{ type: string, url: string }]
  coffees?: {
    id: string;
    name: string;
    roastLevel: string[];
    origins: string[];
    processes: string[];
    notes: string[];
    noteColors: string[];
    brewMethods: string[];
    price: number;
    description: string | null;
    customFields: any;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export async function getCafe(id: string): Promise<CafeInfo | null> {
  try {
    const cafe = await prisma.cafe.findUnique({
      where: { id },
      include: {
        coffees: {
          select: {
            id: true,
            name: true,
            roastLevel: true,
            origins: true,
            processes: true,
            notes: true,
            noteColors: true,
            brewMethods: true,
            price: true,
            description: true,
            customFields: true,
          },
        },
      },
    });
    return cafe;
  } catch (error) {
    console.error('Error fetching cafe:', error);
    return null;
  }
}

export async function updateCafe(id: string, data: Partial<CafeInfo>) {
  try {
    const updatedCafe = await prisma.cafe.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        description: data.description,
        businessHours: data.businessHours,
        businessHourNote: data.businessHourNote,
        snsLinks: data.snsLinks,
      },
    });
    return updatedCafe;
  } catch (error) {
    console.error('Error updating cafe:', error);
    throw error;
  }
} 