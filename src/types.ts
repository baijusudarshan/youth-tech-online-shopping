export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  discountPrice?: number;
  rating: number;
  reviewsCount: number;
  stock: number;
  images: string[];
  specs: Record<string, string>;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userEmail: string;
  userName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  image: string;
}

export interface ShippingAddress {
  id: string;
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  province: string;
  isDefault: boolean;
}

export interface UserProfile {
  email: string;
  userName: string;
  role: "customer" | "admin";
  addresses: ShippingAddress[];
  wishlist: string[]; // List of product IDs
  cart: CartItem[];
  joinedAt: string;
}

export interface Order {
  id: string;
  userEmail: string;
  shippingInfo: {
    name: string;
    phone: string;
    address: string;
    city: string;
    province: string;
  };
  billingInfo: {
    name: string;
    phone: string;
    address: string;
    city: string;
    province: string;
  };
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  finalTotal: number;
  paymentMethod: "Khalti" | "eSewa" | "Cash on Delivery";
  paymentStatus: "Pending" | "Paid" | "Failed";
  orderStatus: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  couponCode?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  value: number;
  minPurchase: number;
  expiryDate: string;
  active: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  active: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}
