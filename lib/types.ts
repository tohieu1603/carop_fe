export type Severity = "low" | "medium" | "high";
export type SellerType = "individual" | "dealer" | "company";
export type ListingStatus = "active" | "has_buyers" | "closing" | "sold" | "hidden";

export interface Seller {
  name: string;
  type: SellerType;
  rating: number;
  deals: number;
  verified?: boolean;
}

export interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  originalPrice: number;
  newPrice: number;
  location: string;
  floodDate: string;
  floodDepth: number;
  floodLocation: string;
  severity: Severity;
  mileage: number;
  transmission: string;
  fuel: string;
  vin: string;
  images: string[];
  seller: Seller;
  damage: { engine: string; interior: string; electrical: string; rust: string };
  repairs: string[];
  inspectionScore: number;
  warranty: string;
  listed: string;
  views: number;
  description: string;
}

export interface Offer {
  id: string;
  buyerId: string;
  amount: number;
  message?: string;
  date: string;
  status: "pending" | "accepted" | "rejected";
}

export interface Buyer {
  id: string;
  name: string;
  phone: string;
  joined: string;
  deals: number;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: number;
  image?: string;
  featured?: boolean;
}

export type Role = "buyer" | "seller" | "admin";
