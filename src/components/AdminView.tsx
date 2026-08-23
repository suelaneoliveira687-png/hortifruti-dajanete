import React, { useState, useMemo } from 'react';
import { 
  Store, 
  Power, 
  Volume2, 
  VolumeX, 
  LogOut, 
  Search, 
  Package, 
  SlidersHorizontal, 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  RotateCcw,
  Sparkles,
  Download,
  Check,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Order, OrderStatus, Product, StoreConfig } from '../types';
import { AdminOrderCard } from './AdminOrderCard';
import { ReceiptModal } from './ReceiptModal';
import { formatCurrency } from '../utils/formatters';
import { soundService } from '../services/soundService';

interface AdminViewProps {
  orders: Order[];
  products: Product[];
  config: StoreConfig;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onUpdateStoreConfig: (newConfig: Partial<StoreConfig>) => void;
  onToggleProductStock: (productId: string) => void;
  onResetData: () => void;
  onLogout: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  orders,
  products,
  config,
  onUpdateStatus,
  onDeleteOrder,
  onUpdateStoreConfig,
  onToggleProductStock,
  onResetData,
  onLogout
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'stock' | 'settings'>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSoundOn, setIsSoundOn] = useState(soundService.isSoundEnabled());
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);

  // Settings form local states
  const [editStoreName, setEditStoreName] = useState(config.storeName);
  const [editPhone, setEditPhone] = useState(config.phoneWhatsApp);
  const [editFormattedPhone, setEditFormattedPhone] = useState(config.formattedPhone);
  const [editAddress, setEditAddress] = useState(config.addressDisplay);
  const [editDeliveryFee, setEditDeliveryFee] = useState(config.deliveryFee.toString());
  const [editMinOrder, setEditMinOrder] = useState(config.minOrderValue.toString());
  const [editDeliveryTime, setEditDeliveryTime] = useState(config.estimatedDeliveryTime);
  const [editPixKey, setEditPixKey] = useState(config.pixKey);
  const [editPixType, setEditPixType] = useState(config.pixKeyType);
  const [editPassword, setEditPassword] = useState(config.adminPassword);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const toggleSound = () => {
    const next = !isSoundOn;
    setIsSoundOn(next);
    soundService.setSoundEnabled(next);
    if (next) soundService.playSuccessTone();
  };

  const handleToggleStoreOpen = () => {
    const next = !config.isOpen;
    onUpdateStoreConfig({ isOpen: next });
    soundService.playSuccessTone();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreConfig({
      storeName: editStoreName,
      phoneWhatsApp: editPhone,
      formattedPhone: editFormattedPhone,
      addressDisplay: editAddress,
      deliveryFee: parseFloat(editDeliveryFee) || 0,
      minOrderValue: parseFloat(editMinOrder) || 0,
      estimatedDeliveryTime: editDeliveryTime,
      pixKey: editPixKey,
      pixKeyType: editPixType,
      adminPassword: editPassword
    });
    setSettingsSaved(true);
    soundService.playSuccessTone();
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  // Metrics
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const preparingOrders = orders.filter(o => o.status === 'preparing').length;
    const deliveringOrders = orders.filter(o => o.status === 'delivering').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((acc, o) => acc + o.total, 0);
    const avgTicket = totalOrders > 0 ? totalRevenue / (totalOrders - orders.filter(o => o.status === 'cancelled').length || 1) : 0;

    return {
      totalOrders,
      pendingOrders,
      preparingOrders,
      deliveringOrders,
      completedOrders,
      totalRevenue,
      avgTicket
    };
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.phone.includes(searchQuery) ||
        (order.customer.street && order.customer.street.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <div className="pb-20 space-y-6">
      
      {/* Admin Top Dashboard Bar */}
      <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-xs space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Brand & Store Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-stone-900 leading-tight">
                  Painel de Controle da Janete
                </h2>
                <p className="text-xs text-stone-500">
                  Gerenciamento em tempo real de pedidos & entregas
                </p>
              </div>
            </div>

            {/* Store Open / Closed Button */}
            <button
              type="button"
              onClick={handleToggleStoreOpen}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
                config.isOpen
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                  : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
              }`}
            >
              <Power className={`w-4 h-4 ${config.isOpen ? 'text-emerald-700' : 'text-amber-700'}`} />
              <span>{config.isOpen ? '🟢 Loja Aberta (Recebendo Pedidos)' : '🔴 Loja Fechada'}</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                isSoundOn 
                  ? 'bg-stone-100 border-stone-300 text-emerald-800' 
                  : 'bg-stone-100 border-stone-200 text-stone-400'
              }`}
              title={isSoundOn ? 'Aviso sonoro ativado' : 'Aviso sonoro silenciado'}
            >
              {isSoundOn ? <Volume2 className="w-4 h-4 text-emerald-700" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center gap-1 transition-all"
              title="Sair do painel"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>

          </div>

        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 border-t border-stone-100 pt-3 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSubTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeSubTab === 'orders'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pedidos em Tempo Real</span>
            {metrics.pendingOrders > 0 && (
              <span className="bg-amber-400 text-stone-950 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold animate-pulse">
                {metrics.pendingOrders}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('stock')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeSubTab === 'stock'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Estoque & Produtos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeSubTab === 'settings'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Configurações da Loja</span>
          </button>
        </div>

      </div>

      {/* SUB-TAB 1: REALTIME ORDERS */}
      {activeSubTab === 'orders' && (
        <div className="space-y-6">
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                <span>Total Faturado</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="font-heading font-extrabold text-lg sm:text-2xl text-emerald-800">
                {formatCurrency(metrics.totalRevenue)}
              </p>
              <p className="text-[10px] text-stone-400">Excluindo cancelados</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                <span>Total de Pedidos</span>
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="font-heading font-extrabold text-lg sm:text-2xl text-stone-900">
                {metrics.totalOrders}
              </p>
              <p className="text-[10px] text-stone-400">{metrics.completedOrders} concluídos</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                <span>Aguardando Preparo</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              </div>
              <p className="font-heading font-extrabold text-lg sm:text-2xl text-amber-600">
                {metrics.pendingOrders}
              </p>
              <p className="text-[10px] text-stone-400">Necessitam atenção</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                <span>Ticket Médio</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="font-heading font-extrabold text-lg sm:text-2xl text-stone-900">
                {formatCurrency(metrics.avgTicket)}
              </p>
              <p className="text-[10px] text-stone-400">Por pedido válido</p>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por cliente, nº do pedido ou rua..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-emerald-600"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'Todos', count: orders.length },
                  { id: 'pending', label: 'Pendentes', count: metrics.pendingOrders },
                  { id: 'preparing', label: 'Em Preparo', count: metrics.preparingOrders },
                  { id: 'delivering', label: 'Em Rota', count: metrics.deliveringOrders },
                  { id: 'completed', label: 'Concluídos', count: metrics.completedOrders },
                  { id: 'cancelled', label: 'Cancelados', count: orders.filter(o => o.status === 'cancelled').length }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      statusFilter === st.id
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span>{st.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      statusFilter === st.id ? 'bg-stone-700 text-stone-200' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {st.count}
                    </span>
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* Orders Cards Grid */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
              <div className="text-4xl">📦</div>
              <h3 className="font-heading font-bold text-stone-800 text-base">
                Nenhum pedido encontrado
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Não há pedidos com os filtros atuais. Quando um cliente fizer um pedido, ele aparecerá aqui instantaneamente com aviso sonoro!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredOrders.map((order) => (
                <AdminOrderCard
                  key={order.id}
                  order={order}
                  config={config}
                  onUpdateStatus={onUpdateStatus}
                  onDeleteOrder={onDeleteOrder}
                  onPrintOrder={(ord) => setSelectedOrderForPrint(ord)}
                />
              ))}
            </div>
          )}

        </div>
      )}

      {/* SUB-TAB 2: PRODUCT STOCK MANAGEMENT */}
      {activeSubTab === 'stock' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-stone-900">
                Controle de Disponibilidade & Estoque
              </h3>
              <p className="text-xs text-stone-500">
                Ative ou desative produtos quando acabarem na feira
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              {products.filter(p => p.inStock).length} de {products.length} disponíveis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.map((product) => (
              <div 
                key={product.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  product.inStock ? 'bg-white border-stone-200' : 'bg-stone-50 border-stone-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded-xl object-cover bg-stone-100 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-heading font-bold text-xs sm:text-sm text-stone-900 truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs text-emerald-700 font-extrabold">
                      {formatCurrency(product.price)} <span className="text-[10px] text-stone-400 font-normal">/{product.unit}</span>
                    </p>
                    <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                      {product.category}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleProductStock(product.id)}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    product.inStock
                      ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                  title={product.inStock ? 'Clique para marcar como Esgotado' : 'Clique para marcar como Em Estoque'}
                >
                  {product.inStock ? <ToggleRight className="w-5 h-5 text-emerald-700" /> : <ToggleLeft className="w-5 h-5 text-red-600" />}
                  <span className="text-[11px] hidden sm:inline">{product.inStock ? 'Ativo' : 'Esgotado'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: STORE SETTINGS */}
      {activeSubTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-stone-900">
              Dados do Hortifruti & Formas de Recebimento
            </h3>
            <p className="text-xs text-stone-500">
              Atualize as informações que os clientes visualizam no catálogo e nos pedidos via WhatsApp
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nome do Estabelecimento
                </label>
                <input
                  type="text"
                  required
                  value={editStoreName}
                  onChange={(e) => setEditStoreName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  WhatsApp para Receber Pedidos (somente números c/ DDD)
                </label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="5511987654321"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-mono focus:outline-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Telefone Formatado (Exibição)
                </label>
                <input
                  type="text"
                  value={editFormattedPhone}
                  onChange={(e) => setEditFormattedPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Endereço Físico do Hortifruti
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Rua das Laranjeiras, 340 - Centro"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Taxa Padrão de Entrega (R$)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={editDeliveryFee}
                  onChange={(e) => setEditDeliveryFee(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Valor Mínimo do Pedido (R$)
                </label>
                <input
                  type="number"
                  step="1"
                  value={editMinOrder}
                  onChange={(e) => setEditMinOrder(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Tempo Estimado de Entrega
                </label>
                <input
                  type="text"
                  value={editDeliveryTime}
                  onChange={(e) => setEditDeliveryTime(e.target.value)}
                  placeholder="35 - 50 min"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">
                  Chave PIX
                </label>
                <input
                  type="text"
                  value={editPixKey}
                  onChange={(e) => setEditPixKey(e.target.value)}
                  placeholder="11987654321 ou chave aleatória"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-mono focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Tipo da Chave
                </label>
                <select
                  value={editPixType}
                  onChange={(e) => setEditPixType(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-semibold focus:outline-emerald-500"
                >
                  <option value="Celular">Celular</option>
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                  <option value="Email">E-mail</option>
                  <option value="Aleatória">Aleatória</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Senha de Acesso ao Painel Admin
              </label>
              <input
                type="text"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                className="w-full max-w-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-mono focus:outline-emerald-500"
              />
            </div>

            {settingsSaved && (
              <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Configurações salvas com sucesso!</span>
              </div>
            )}

            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Restaurar todos os produtos e pedidos de demonstração originais?')) {
                    onResetData();
                  }
                }}
                className="text-stone-500 hover:text-red-700 font-semibold flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restaurar Dados Iniciais de Demonstração</span>
              </button>

              <button
                type="submit"
                className="py-2.5 px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-700/20"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </form>

        </div>
      )}

      {/* Modals */}
      <ReceiptModal
        order={selectedOrderForPrint}
        config={config}
        onClose={() => setSelectedOrderForPrint(null)}
      />

    </div>
  );
};
