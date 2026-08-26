import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { ClientView } from './components/ClientView';
import { CartDrawer } from './components/CartDrawer';
import { AdminView } from './components/AdminView';
import { AdminLogin } from './components/AdminLogin';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { ReceiptModal } from './components/ReceiptModal';
import { Product, StoreConfig, Order, CartItem, OrderStatus } from './types';
import { dataSync } from './services/supabaseService';
import { soundService } from './services/soundService';
import { JaneteLogo } from './components/JaneteLogo';
import { Phone, MapPin, Sparkles, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

const CART_STORAGE_KEY = 'janete_cart_session_v4';
const LAST_ORDER_KEY = 'ultimo_pedido_id';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'client' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (hash === '#admin' || hash === '#painel' || params.get('admin') === 'true') {
        return 'admin';
      }
    }
    return 'client';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (hash === '#admin' || hash === '#painel' || params.get('admin') === 'true') {
        setCurrentTab('admin');
      } else if (hash === '#loja' || hash === '#cliente' || hash === '') {
        setCurrentTab('client');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [config, setConfig] = useState<StoreConfig>(dataSync.getLocalConfig());
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(LAST_ORDER_KEY);
    }
    return null;
  });
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [receiptModalOrder, setReceiptModalOrder] = useState<Order | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  useEffect(() => {
    return dataSync.subscribeAdminAuth(setIsAdminAuthenticated);
  }, []);

  // Track initial load to not play chime on first render
  const isFirstLoad = useRef(true);
  const previousOrdersCount = useRef(0);

  // Sync subscriptions
  useEffect(() => {
    const unsubProducts = dataSync.subscribeProducts((p) => setProducts(p));
    const unsubConfig = dataSync.subscribeConfig((c) => setConfig(c));
    const unsubConnection = dataSync.subscribeConnection((conn) => setIsSupabaseConnected(conn));
    
    const unsubOrders = dataSync.subscribeOrders((newOrders) => {
      // If new orders came in after initial mount, play chime alert!
      if (!isFirstLoad.current && newOrders.length > previousOrdersCount.current) {
        soundService.playNewOrderChime();
      }
      isFirstLoad.current = false;
      previousOrdersCount.current = newOrders.length;
      setOrders(newOrders);
    });

    return () => {
      unsubProducts();
      unsubConfig();
      unsubConnection();
      unsubOrders();
    };
  }, []);

  // Save cart to local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number, notes?: string) => {
    setCartItems(prev => {
      // Find if an item with the same product ID already exists
      const existingIdx = prev.findIndex(item => item.product.id === product.id && (item.notes || '') === (notes || ''));
      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = Number((updated[existingIdx].quantity + quantity).toFixed(2));
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          notes: notes || updated[existingIdx].notes,
          itemTotal: Number((newQty * product.price).toFixed(2))
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            quantity,
            notes,
            itemTotal: Number((quantity * product.price).toFixed(2))
          }
        ];
      }
    });
    soundService.playSuccessTone();
  };

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          return {
            ...item,
            quantity: newQty,
            itemTotal: Number((newQty * item.product.price).toFixed(2))
          };
        }
        return item;
      });
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleUpdateItemNotes = (productId: string, notes: string) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          return { ...item, notes };
        }
        return item;
      });
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Order submission
  const handleSubmitOrder = async (order: Order) => {
    await dataSync.createOrder(order);
    setTrackedOrderId(order.id);
    setIsTrackerOpen(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LAST_ORDER_KEY, order.id);
    }
  };

  const handleRemoveTrackedOrder = () => {
    setTrackedOrderId(null);
    setIsTrackerOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LAST_ORDER_KEY);
    }
  };

  // Find tracked order object (by id or orderNumber)
  const trackedOrder = orders.find(o => 
    o.id === trackedOrderId || 
    o.orderNumber === trackedOrderId ||
    (trackedOrderId && o.orderNumber.toLowerCase() === trackedOrderId.toLowerCase())
  ) || null;

  useEffect(() => {
    const normalizedStatus = String(trackedOrder?.status || '').toLowerCase();
    const isCompleted = ['completed', 'concluído', 'concluido'].includes(normalizedStatus);

    if (isCompleted) {
      setTrackedOrderId(null);
      setIsTrackerOpen(false);
      localStorage.removeItem(LAST_ORDER_KEY);
    }
  }, [trackedOrder?.status]);

  // Admin actions
  const handleLoginSuccess = async (email: string, password: string) => {
    await dataSync.signInAdmin(email, password);
    soundService.playSuccessTone();
  };

  const handleLogout = async () => {
    await dataSync.signOutAdmin();
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    await dataSync.updateOrderStatus(orderId, status);
    soundService.playSuccessTone();
  };

  const handleDeleteOrder = async (orderId: string) => {
    await dataSync.deleteOrder(orderId);
  };

  const handleUpdateStoreConfig = async (newConfig: Partial<StoreConfig>) => {
    await dataSync.updateStoreConfig(newConfig);
  };

  const handleToggleProductStock = async (productId: string) => {
    await dataSync.toggleProductStock(productId);
  };

  const handleResetData = async () => {
    await dataSync.resetSampleData();
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.itemTotal, 0);
  const cartCount = cartItems.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col justify-between selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        config={config}
        cartCount={cartCount}
        cartTotal={cartTotal}
        openCart={() => setIsCartOpen(true)}
        pendingOrdersCount={pendingOrdersCount}
        hasTrackedOrder={Boolean(trackedOrderId && trackedOrder)}
        onOpenTracker={() => setIsTrackerOpen(true)}
      />

      {/* Main Content Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex-1 w-full">
        {currentTab === 'client' ? (
          <ClientView
            products={products}
            config={config}
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            openCart={() => setIsCartOpen(true)}
          />
        ) : (
          isAdminAuthenticated ? (
            <AdminView
              orders={orders}
              products={products}
              config={config}
              onUpdateStatus={handleUpdateStatus}
              onDeleteOrder={handleDeleteOrder}
              onUpdateStoreConfig={handleUpdateStoreConfig}
              onToggleProductStock={handleToggleProductStock}
              onResetData={handleResetData}
              onLogout={handleLogout}
            />
          ) : (
            <AdminLogin
              onLoginSuccess={handleLoginSuccess}
            />
          )
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onUpdateItemNotes={handleUpdateItemNotes}
        onClearCart={handleClearCart}
        config={config}
        onSubmitOrder={handleSubmitOrder}
        onOpenTracker={(orderId) => {
          setTrackedOrderId(orderId);
          setIsTrackerOpen(true);
        }}
        onOpenReceipt={(order) => {
          setReceiptModalOrder(order);
        }}
      />

      {/* Order Tracker Modal */}
      <OrderTrackerModal
        order={trackedOrder}
        isOpen={isTrackerOpen && Boolean(trackedOrder)}
        onClose={() => setIsTrackerOpen(false)}
        onRemove={handleRemoveTrackedOrder}
        whatsappNumber={config.phoneWhatsApp || config.formattedPhone}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        order={receiptModalOrder}
        config={config}
        onClose={() => setReceiptModalOrder(null)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-16 py-10 text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            {/* Col 1 */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <JaneteLogo size={42} />
                <h3 className="font-heading font-extrabold text-base text-stone-900">
                  {config.storeName}
                </h3>
              </div>
              <p className="text-stone-500 text-xs leading-relaxed max-w-md">
                Trazendo o melhor da horta familiar direto para sua mesa. Frutas rigorosamente selecionadas, verduras frescas colhidas toda manhã e legumes da mais alta qualidade.
              </p>
              <div className="flex items-center gap-4 text-[#285336] font-semibold pt-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-[#285336]" /> Sem Fila
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-[#285336]" /> No WhatsApp
                </span>
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <h4 className="font-bold text-stone-900 uppercase tracking-wider text-xs">
                Atendimento & Horários
              </h4>
              <p className="flex items-center gap-1.5 text-stone-600">
                <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                Segunda a Sábado: 07h às 19h
              </p>
              <p className="flex items-center gap-1.5 text-stone-600">
                <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                Domingo: 07h às 13h
              </p>
              <p className="flex items-center gap-1.5 text-stone-600">
                <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                {config.formattedPhone}
              </p>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <h4 className="font-bold text-stone-900 uppercase tracking-wider text-xs">
                Endereço da Loja
              </h4>
              <p className="flex items-start gap-1.5 text-stone-600 leading-relaxed">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                {config.addressDisplay}
              </p>
              <p className="text-[11px] text-stone-400">
                Entregas rápidas em todos os bairros vizinhos.
              </p>
            </div>

          </div>

          <div className="border-t border-stone-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-400 text-[11px]">
            <p>© {new Date().getFullYear()} {config.storeName}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
