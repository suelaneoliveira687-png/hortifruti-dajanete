import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { DeliveryRate, Product, StoreConfig } from '../types';
import { INITIAL_PRODUCTS, INITIAL_STORE_CONFIG } from '../data/mockProducts';

const PRODUCTS_KEY = 'janete_products_supabase_v1';
const CONFIG_KEY = 'janete_config_supabase_v1';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

class SupabaseDataSyncService {
  private listeners = {
    config: [] as Array<(config: StoreConfig) => void>,
    products: [] as Array<(products: Product[]) => void>,
    connection: [] as Array<(connected: boolean) => void>,
    auth: [] as Array<(authenticated: boolean) => void>
  };
  private config: StoreConfig = INITIAL_STORE_CONFIG;
  private products: Product[] = INITIAL_PRODUCTS;

  constructor() {
    if (typeof window !== 'undefined') {
      this.products = this.readStorage(PRODUCTS_KEY, INITIAL_PRODUCTS);
      this.config = this.readStorage(CONFIG_KEY, INITIAL_STORE_CONFIG);
    }
    onAuthStateChanged(auth, (user) => {
      this.listeners.auth.forEach(callback => callback(Boolean(user)));
    });
    if (supabase) {
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

  private emitConfig() { this.listeners.config.forEach(callback => callback(this.config)); }
  private emitProducts() { this.listeners.products.forEach(callback => callback(this.products)); }

  getLocalConfig() { return this.config; }

  private async subscribeRemoteConfig() {
    if (!supabase) return;
    const { data } = await supabase.from('taxas_entrega').select('id, bairro, valor').order('bairro');
    if (data) {
      this.config = { ...this.config, deliveryRates: data as DeliveryRate[] };
      this.emitConfig();
    }
  }

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

  async updateStoreConfig(partial: Partial<StoreConfig>) {
    this.config = { ...this.config, ...partial };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
    this.emitConfig();
    if (supabase && partial.deliveryRates) {
      await supabase.from('taxas_entrega').upsert(partial.deliveryRates.map(rate => ({ bairro: rate.bairro, valor: rate.valor })), { onConflict: 'bairro' });
    }
  }

  async toggleProductStock(productId: string) { this.products = this.products.map(product => product.id === productId ? { ...product, inStock: !product.inStock } : product); localStorage.setItem(PRODUCTS_KEY, JSON.stringify(this.products)); this.emitProducts(); }
  
  async resetSampleData() { this.products = INITIAL_PRODUCTS; this.config = INITIAL_STORE_CONFIG; this.emitProducts(); this.emitConfig(); }
}

export const dataSync = new SupabaseDataSyncService();