export interface Product {
  id: string;
  name: string;
  category: 'frutas' | 'verduras' | 'legumes' | 'raizes' | 'temperos' | 'mercearia' | 'kits' | string;
  price: number;
  unit: 'kg' | 'un' | 'bandeja' | 'maço' | 'kit';
  image: string;
  description: string;
  inStock: boolean;
  badge?: string;
  isPopular?: boolean;
  minQty?: number;
  stepQty?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  itemTotal: number;
  notes?: string;
  selectedOption?: string;
}

export type DeliveryType = 'delivery' | 'pickup';

export type PaymentMethod = 'pix' | 'card_delivery' | 'cash';

export interface CustomerInfo {
  name: string;
  phone: string;
  deliveryType: DeliveryType;
  street?: string;
  number?: string;
  neighborhood?: string;
  complement?: string;
  reference?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string; // ISO string
  timestamp: number;
  customer: CustomerInfo;
  paymentMethod: PaymentMethod;
  changeFor?: number; // In case of cash
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string;
}

export interface StoreConfig {
  storeName: string;
  isOpen: boolean;
  phoneWhatsApp: string; // e.g. "5511999999999"
  formattedPhone: string; // "(11) 99999-9999"
  addressDisplay: string;
  deliveryFee: number;
  minOrderValue: number;
  estimatedDeliveryTime: string; // "35 - 55 min"
  pixKey: string;
  pixKeyType: 'CPF' | 'CNPJ' | 'Email' | 'Celular' | 'Aleatória';
  adminPassword: string;
  deliveryRates?: DeliveryRate[];
}

export interface DeliveryRate {
  id?: string;
  bairro: string;
  valor: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}
