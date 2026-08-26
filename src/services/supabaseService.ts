import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { DeliveryRate, Order, OrderStatus, Product, StoreConfig } from '../types';
import { INITIAL_PRODUCTS, INITIAL_STORE_CONFIG, INITIAL_MOCK_ORDERS } from '../data/mockProducts';

const ORDERS_KEY = 'janete_orders_supabase_v1';
const PRODUCTS_KEY = 'janete_products_supabase_v1';
const CONFIG_KEY = 'janete_config_supabase_v1';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const statusToDatabase: Record<OrderStatus, string> = {
  pending: 'Pendente',
  preparing: 'Em Preparo',
  delivering: 'Saiu para Entrega',
  completed: 'Concluído',
  cancelled: 'Cancelado'
};

const statusFromDatabase = (status: string): OrderStatus => {
  const normalized = String(status || '').toLowerCase();
  if (['em preparo', 'preparo', 'preparing'].includes(normalized)) return 'preparing';
  if (['saiu para entrega', 'em entrega', 'delivering'].includes(normalized)) return 'delivering';
  if (['concluído', 'concluido', 'completed'].includes(normalized)) return 'completed';
  if (['cancelado', 'cancelled'].includes(normalized)) return 'cancelled';
  return 'pending';
};

const toOrder = (row: any): Order => ({
  id: String(row.external_id || row.id),
  orderNumber: row.order_number || row.orderNumber || `JAN-${row.id}`,
  createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  timestamp: new Date(row.created_at || row.createdAt || Date.now()).getTime(),
  customer: {
    name: row.cliente_nome || row.customer?.name || '',
    phone: row.cliente_telefone || row.telefone || row.customer?.phone || '',
    deliveryType: row.tipo_entrega === 'retirada' || row.customer?.deliveryType === 'pickup' ? 'pickup' : 'delivery',
    street: row.customer?.street || row.endereco?.split(',')[0] || '',
    number: row.customer?.number || '',
    neighborhood: row.bairro || row.customer?.neighborhood || '',
    complement: row.customer?.complement || '',
    reference: row.customer?.reference || ''
  },
  paymentMethod: row.forma_pagamento || row.paymentMethod || 'pix',
  changeFor: row.changeFor,
  items: row.itens || row.items || [],
  subtotal: Number(row.subtotal || row.total || 0) - Number(row.taxa_entrega || 0),
  deliveryFee: Number(row.taxa_entrega || row.deliveryFee || 0),
  total: Number(row.total || 0),
  status: statusFromDatabase(row.status),
  archived: Boolean(row.archived),
  notes: row.observacoes || row.notes
});

const toDatabaseOrder = (order: Order) => ({
  external_id: order.id,
  order_number: order.orderNumber,
  cliente_nome: order.customer.name,
  telefone: order.customer.phone,
  cliente_telefone: order.customer.phone,
  endereco: order.customer.deliveryType === 'delivery'
    ? `${order.customer.street || ''}, ${order.customer.number || ''}`.trim()
    : 'Retirada no Balcão da Loja',
  bairro: order.customer.neighborhood || null,
  taxa_entrega: order.deliveryFee,
  itens: order.items,
  subtotal: order.subtotal,
  total: order.total,
  status: statusToDatabase[order.status],
  tipo_entrega: order.customer.deliveryType === 'pickup' ? 'retirada' : 'entrega',
  forma_pagamento: order.paymentMethod,
  pagamento: order.paymentMethod,
  observacoes: order.notes || null,
  archived: Boolean(order.archived)
});

class SupabaseDataSyncService {
  private listeners = {
    orders: [] as Array<(orders: Order[]) => void>,
    config: [] as Array<(config: StoreConfig) => void>,
    products: [] as Array<(products: Product[]) => void>,
    connection: [] as Array<(connected: boolean) => void>,
    auth: [] as Array<(authenticated: boolean) => void>
  };
  private orders: Order[] = [];
  private config: StoreConfig = INITIAL_STORE_CONFIG;
  private products: Product[] = INITIAL_PRODUCTS;

  constructor() {
    if (typeof window !== 'undefined') {
      this.orders = this.readStorage(ORDERS_KEY, INITIAL_MOCK_ORDERS);
      this.products = this.readStorage(PRODUCTS_KEY, INITIAL_PRODUCTS);
      this.config = this.readStorage(CONFIG_KEY, INITIAL_STORE_CONFIG);
    }
    onAuthStateChanged(auth, (user) => {
      this.listeners.auth.forEach(callback => callback(Boolean(user)));
    });
    if (supabase) {
      this.subscribeRemoteOrders();
      this.subscribeRemoteConfig();
      this.listeners.connection.forEach(callback => callback(true));
    }
  }

  private readStorage<T>(key: string, fallback: T): T {
    try {
      return JSON.parse(localStorage.getItem(key) || '') as T;
    } catch {
      return fallback;
    }
  }

  private emitOrders() { this.listeners.orders.forEach(callback => callback(this.orders)); }
  private emitConfig() { this.listeners.config.forEach(callback => callback(this.config)); }
  private emitProducts() { this.listeners.products.forEach(callback => callback(this.products)); }

  getLocalConfig() { return this.config; }

  private async subscribeRemoteOrders() {
    if (!supabase) return;
    const { data } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false });
    if (data) {
      this.orders = data.map(toOrder);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(this.orders));
      this.emitOrders();
    }
    supabase.channel('pedidos-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => this.subscribeRemoteOrders()).subscribe();
  }

  private async subscribeRemoteConfig() {
    if (!supabase) return;
    const { data } = await supabase.from('taxas_entrega').select('id, bairro, valor').order('bairro');
    if (data) {
      this.config = { ...this.config, deliveryRates: data as DeliveryRate[] };
      this.emitConfig();
    }
  }

  subscribeOrders(callback: (orders: Order[]) => void) { this.listeners.orders.push(callback); callback(this.orders); return () => { this.listeners.orders = this.listeners.orders.filter(item => item !== callback); }; }
  subscribeConfig(callback: (config: StoreConfig) => void) { this.listeners.config.push(callback); callback(this.config); return () => { this.listeners.config = this.listeners.config.filter(item => item !== callback); }; }
  subscribeProducts(callback: (products: Product[]) => void) { this.listeners.products.push(callback); callback(this.products); return () => { this.listeners.products = this.listeners.products.filter(item => item !== callback); }; }
  subscribeConnection(callback: (connected: boolean) => void) { this.listeners.connection.push(callback); callback(Boolean(supabase)); return () => { this.listeners.connection = this.listeners.connection.filter(item => item !== callback); }; }
  subscribeAdminAuth(callback: (authenticated: boolean) => void) { this.listeners.auth.push(callback); callback(Boolean(auth.currentUser)); return () => { this.listeners.auth = this.listeners.auth.filter(item => item !== callback); }; }

  async signInAdmin(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async signOutAdmin() { await signOut(auth); }

  async createOrder(order: Order): Promise<void> {
    this.orders = [order, ...this.orders];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(this.orders));
    this.emitOrders();
    if (supabase) {
      const { error } = await supabase.from('pedidos').insert(toDatabaseOrder(order));
      if (error) throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    this.orders = this.orders.map(order => order.id === orderId ? { ...order, status } : order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(this.orders));
    this.emitOrders();
    if (supabase) {
      const query = supabase.from('pedidos').update({ status: statusToDatabase[status] });
      await (orderId.startsWith('ord-') ? query.eq('external_id', orderId) : query.eq('id', orderId));
    }
  }

  async deleteOrder(orderId: string) {
    this.orders = this.orders.map(order => order.id === orderId ? { ...order, archived: true } : order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(this.orders));
    this.emitOrders();
    if (supabase) {
      const query = supabase.from('pedidos').update({ archived: true });
      await (orderId.startsWith('ord-') ? query.eq('external_id', orderId) : query.eq('id', orderId));
    }
  }

  async updateStoreConfig(partial: Partial<StoreConfig>) {
    this.config = { ...this.config, ...partial };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
    this.emitConfig();
    if (supabase && partial.deliveryRates) {
      await supabase.from('taxas_entrega').upsert(partial.deliveryRates.map(rate => ({ bairro: rate.bairro, valor: rate.valor })), { onConflict: 'bairro' });
    }
  }

  async toggleProductStock(productId: string) { this.products = this.products.map(product => product.id === productId ? { ...product, inStock: !product.inStock } : product); localStorage.setItem(PRODUCTS_KEY, JSON.stringify(this.products)); this.emitProducts(); }
  async resetSampleData() { this.products = INITIAL_PRODUCTS; this.orders = INITIAL_MOCK_ORDERS; this.config = INITIAL_STORE_CONFIG; this.emitProducts(); this.emitOrders(); this.emitConfig(); }
}

export const dataSync = new SupabaseDataSyncService();