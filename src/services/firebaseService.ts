import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  Firestore,
  getDocs
} from 'firebase/firestore';
import { Order, OrderStatus, Product, StoreConfig, FirebaseCustomConfig } from '../types';
import { INITIAL_PRODUCTS, INITIAL_STORE_CONFIG, INITIAL_MOCK_ORDERS } from '../data/mockProducts';

const SCHEMA_VERSION = 'v24_all_46_local_images_synced';

const STORAGE_KEYS = {
  ORDERS: `janete_orders_${SCHEMA_VERSION}`,
  PRODUCTS: `janete_products_${SCHEMA_VERSION}`,
  CONFIG: `janete_config_${SCHEMA_VERSION}`,
  FIREBASE_CONFIG: 'janete_firebase_config_v1',
  SCHEMA_VERSION: 'janete_active_schema_version'
};

class DataSyncService {
  private firebaseApp: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private auth: Auth | null = null;
  private unsubscribeAuth: (() => void) | null = null;
  private isFirebaseConnected: boolean = false;
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: {
    orders: Array<(orders: Order[]) => void>;
    config: Array<(config: StoreConfig) => void>;
    products: Array<(products: Product[]) => void>;
    connection: Array<(connected: boolean) => void>;
    auth: Array<(authenticated: boolean) => void>;
  } = {
    orders: [],
    config: [],
    products: [],
    connection: [],
    auth: []
  };

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        // Purge old cached data from previous versions to ensure immediate update for the user
        const activeVersion = localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION);
        if (activeVersion !== SCHEMA_VERSION) {
          const legacyKeys = [
            'janete_products_v1', 'janete_products_v2', 'janete_products_v3', 'janete_products',
            'janete_orders_v1', 'janete_orders_v2', 'janete_orders',
            'janete_cart_session_v1', 'janete_cart_session_v2', 'janete_cart_session_v3',
            'janete_cart_v1'
          ];
          legacyKeys.forEach(k => localStorage.removeItem(k));
          localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, SCHEMA_VERSION);
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
          localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(INITIAL_STORE_CONFIG));
        }

        this.broadcastChannel = new BroadcastChannel('janete_sync_channel');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'ORDERS_UPDATED') {
            this.notifyOrderListeners(this.getLocalOrders());
          } else if (event.data?.type === 'CONFIG_UPDATED') {
            this.notifyConfigListeners(this.getLocalConfig());
          } else if (event.data?.type === 'PRODUCTS_UPDATED') {
            this.notifyProductListeners(this.getLocalProducts());
          }
        };
      } catch {
        // Fallback for environments without BroadcastChannel
      }

      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEYS.ORDERS) {
          this.notifyOrderListeners(this.getLocalOrders());
        } else if (e.key === STORAGE_KEYS.CONFIG) {
          this.notifyConfigListeners(this.getLocalConfig());
        } else if (e.key === STORAGE_KEYS.PRODUCTS) {
          this.notifyProductListeners(this.getLocalProducts());
        }
      });
    }

    this.initFirebaseIfConfigured();
  }

  // Check if custom Firebase configuration exists in LocalStorage or initialize
  public initFirebaseIfConfigured() {
    try {
      const storedFbConfig = this.getSavedFirebaseConfig();
      if (storedFbConfig && storedFbConfig.apiKey && storedFbConfig.projectId) {
        if (!getApps().length) {
          this.firebaseApp = initializeApp(storedFbConfig);
        } else {
          this.firebaseApp = getApps()[0];
        }
        this.db = getFirestore(this.firebaseApp);
        this.auth = getAuth(this.firebaseApp);
        this.unsubscribeAuth?.();
        this.unsubscribeAuth = onAuthStateChanged(this.auth, (user) => {
          this.listeners.auth.forEach(cb => cb(Boolean(user)));
        });
        this.isFirebaseConnected = true;
        this.notifyConnectionListeners(true);
        this.listenToFirebaseOrders();
        this.listenToFirebaseConfig();
        return;
      }
    } catch (e) {
      console.warn('Firebase initialization error, using reactive local storage:', e);
    }
    this.isFirebaseConnected = false;
    this.auth = null;
    this.unsubscribeAuth?.();
    this.unsubscribeAuth = null;
    this.listeners.auth.forEach(cb => cb(false));
    this.notifyConnectionListeners(false);
  }

  public getSavedFirebaseConfig(): FirebaseCustomConfig | null {
    if (typeof window === 'undefined') return null;

    const envConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
    };
    if (envConfig.apiKey && envConfig.authDomain && envConfig.projectId && envConfig.appId) {
      return envConfig;
    }

    const raw = localStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public saveFirebaseConfig(config: FirebaseCustomConfig | null) {
    if (typeof window === 'undefined') return;
    if (!config) {
      localStorage.removeItem(STORAGE_KEYS.FIREBASE_CONFIG);
      this.isFirebaseConnected = false;
      this.notifyConnectionListeners(false);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.FIREBASE_CONFIG, JSON.stringify(config));
    this.initFirebaseIfConfigured();
  }

  public isConnectedToFirebase(): boolean {
    return this.isFirebaseConnected;
  }

  // --- REALTIME LISTENERS ---

  private listenToFirebaseOrders() {
    if (!this.db) return;
    try {
      const q = query(collection(this.db, 'orders'), orderBy('timestamp', 'desc'));
      onSnapshot(q, (snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach((d) => {
          orders.push({ ...d.data(), id: d.id } as Order);
        });
        if (orders.length > 0) {
          this.setLocalOrders(orders, false);
          this.notifyOrderListeners(orders);
        }
      }, (err) => {
        console.warn('Firestore snapshot error:', err);
      });
    } catch (e) {
      console.warn('Failed to listen to Firebase orders:', e);
    }
  }

  private listenToFirebaseConfig() {
    if (!this.db) return;
    try {
      const configDoc = doc(this.db, 'settings', 'store_config');
      onSnapshot(configDoc, (snap) => {
        if (snap.exists()) {
          const cfg = snap.data() as StoreConfig;
          this.setLocalConfig(cfg, false);
          this.notifyConfigListeners(cfg);
        }
      });
    } catch (e) {
      console.warn('Failed to listen to Firebase config:', e);
    }
  }

  // --- SUBSCRIPTION METHODS ---

  public subscribeOrders(callback: (orders: Order[]) => void): () => void {
    this.listeners.orders.push(callback);
    // Initial emit
    callback(this.getLocalOrders());
    return () => {
      this.listeners.orders = this.listeners.orders.filter(cb => cb !== callback);
    };
  }

  public subscribeConfig(callback: (config: StoreConfig) => void): () => void {
    this.listeners.config.push(callback);
    callback(this.getLocalConfig());
    return () => {
      this.listeners.config = this.listeners.config.filter(cb => cb !== callback);
    };
  }

  public subscribeProducts(callback: (products: Product[]) => void): () => void {
    this.listeners.products.push(callback);
    callback(this.getLocalProducts());
    return () => {
      this.listeners.products = this.listeners.products.filter(cb => cb !== callback);
    };
  }

  public subscribeConnection(callback: (connected: boolean) => void): () => void {
    this.listeners.connection.push(callback);
    callback(this.isFirebaseConnected);
    return () => {
      this.listeners.connection = this.listeners.connection.filter(cb => cb !== callback);
    };
  }

  public subscribeAdminAuth(callback: (authenticated: boolean) => void): () => void {
    this.listeners.auth.push(callback);
    callback(Boolean(this.auth?.currentUser));
    return () => {
      this.listeners.auth = this.listeners.auth.filter(cb => cb !== callback);
    };
  }

  public async signInAdmin(email: string, password: string): Promise<void> {
    if (!this.auth) {
      throw new Error('Firebase não está configurado para autenticação.');
    }
    await signInWithEmailAndPassword(this.auth, email.trim(), password);
  }

  public async signOutAdmin(): Promise<void> {
    if (this.auth) {
      await signOut(this.auth);
    }
  }

  private notifyOrderListeners(orders: Order[]) {
    this.listeners.orders.forEach(cb => cb(orders));
  }

  private notifyConfigListeners(config: StoreConfig) {
    this.listeners.config.forEach(cb => cb(config));
  }

  private notifyProductListeners(products: Product[]) {
    this.listeners.products.forEach(cb => cb(products));
  }

  private notifyConnectionListeners(connected: boolean) {
    this.listeners.connection.forEach(cb => cb(connected));
  }

  // --- LOCAL PERSISTENCE HELPERS ---

  public getLocalOrders(): Order[] {
    if (typeof window === 'undefined') return INITIAL_MOCK_ORDERS;
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      this.setLocalOrders(INITIAL_MOCK_ORDERS, false);
      return INITIAL_MOCK_ORDERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MOCK_ORDERS;
    }
  }

  private setLocalOrders(orders: Order[], emitBroadcast = true) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    if (emitBroadcast) {
      this.broadcastChannel?.postMessage({ type: 'ORDERS_UPDATED' });
      this.notifyOrderListeners(orders);
    }
  }

  public getLocalConfig(): StoreConfig {
    if (typeof window === 'undefined') return INITIAL_STORE_CONFIG;
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      this.setLocalConfig(INITIAL_STORE_CONFIG, false);
      return INITIAL_STORE_CONFIG;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_STORE_CONFIG;
    }
  }

  public setLocalConfig(config: StoreConfig, emitBroadcast = true) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    if (emitBroadcast) {
      this.broadcastChannel?.postMessage({ type: 'CONFIG_UPDATED' });
      this.notifyConfigListeners(config);
    }
  }

  public getLocalProducts(): Product[] {
    if (typeof window === 'undefined') return INITIAL_PRODUCTS;
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      this.setLocalProducts(INITIAL_PRODUCTS, false);
      return INITIAL_PRODUCTS;
    }
    try {
      const parsed: Product[] = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length !== INITIAL_PRODUCTS.length) {
        this.setLocalProducts(INITIAL_PRODUCTS, false);
        return INITIAL_PRODUCTS;
      }
      return parsed;
    } catch {
      this.setLocalProducts(INITIAL_PRODUCTS, false);
      return INITIAL_PRODUCTS;
    }
  }

  public setLocalProducts(products: Product[], emitBroadcast = true) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    if (emitBroadcast) {
      this.broadcastChannel?.postMessage({ type: 'PRODUCTS_UPDATED' });
      this.notifyProductListeners(products);
    }
  }

  // --- ACTIONS ---

  public async createOrder(order: Order): Promise<void> {
    // 1. Update local storage immediately for zero-delay UI update
    const current = this.getLocalOrders();
    const updated = [order, ...current];
    this.setLocalOrders(updated, true);

    // 2. If Firebase Firestore is active, save to cloud
    if (this.db) {
      try {
        await setDoc(doc(this.db, 'orders', order.id), order);
      } catch (err) {
        console.warn('Error pushing order to Firebase:', err);
      }
    }
  }

  public async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const current = this.getLocalOrders();
    const updated = current.map(ord => ord.id === orderId ? { ...ord, status } : ord);
    this.setLocalOrders(updated, true);

    if (this.db) {
      try {
        await updateDoc(doc(this.db, 'orders', orderId), { status });
      } catch (err) {
        console.warn('Error updating status in Firebase:', err);
      }
    }
  }

  public async deleteOrder(orderId: string): Promise<void> {
    const current = this.getLocalOrders();
    const updated = current.filter(ord => ord.id !== orderId);
    this.setLocalOrders(updated, true);

    if (this.db) {
      try {
        await deleteDoc(doc(this.db, 'orders', orderId));
      } catch (err) {
        console.warn('Error deleting order in Firebase:', err);
      }
    }
  }

  public async updateStoreConfig(config: Partial<StoreConfig>): Promise<void> {
    const current = this.getLocalConfig();
    const updated = { ...current, ...config };
    this.setLocalConfig(updated, true);

    if (this.db) {
      try {
        await setDoc(doc(this.db, 'settings', 'store_config'), updated);
      } catch (err) {
        console.warn('Error saving config in Firebase:', err);
      }
    }
  }

  public async toggleProductStock(productId: string): Promise<void> {
    const products = this.getLocalProducts();
    const updated = products.map(p => p.id === productId ? { ...p, inStock: !p.inStock } : p);
    this.setLocalProducts(updated, true);
  }

  public async resetSampleData(): Promise<void> {
    this.setLocalProducts(INITIAL_PRODUCTS, true);
    this.setLocalOrders(INITIAL_MOCK_ORDERS, true);
    this.setLocalConfig(INITIAL_STORE_CONFIG, true);
  }
}

export const dataSync = new DataSyncService();
