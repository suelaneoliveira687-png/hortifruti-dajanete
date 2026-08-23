import React from 'react';
import { Order, OrderStatus } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { 
  Clock, 
  Package, 
  Bike, 
  CheckCircle2, 
  X, 
  Copy, 
  Check, 
  MessageCircle, 
  ShoppingBag, 
  Store as StoreIcon,
  Activity
} from 'lucide-react';

interface OrderTrackerModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  order,
  isOpen,
  onClose,
  whatsappNumber
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !order) return null;

  const orderDisplayCode = order.orderNumber || order.id;

  const handleCopyId = () => {
    navigator.clipboard.writeText(orderDisplayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusInfo = (rawStatus: string) => {
    const status = String(rawStatus || '').toLowerCase();
    const isPickup = order.customer.deliveryType === 'pickup';

    if (status === 'concluído' || status === 'concluido' || status === 'completed') {
      return {
        progress: 100,
        color: 'emerald',
        badgeText: 'Concluído',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        icon: '🎉',
        title: 'Pedido Entregue com Sucesso!',
        description: 'Obrigado por comprar no Hortifruti da Janete! Desejamos uma excelente refeição com alimentos frescos e saudáveis.',
        pctText: '100% • Concluído'
      };
    }

    if (status === 'saiu para entrega' || status === 'delivering' || status === 'pronto para retirada') {
      return {
        progress: 75,
        color: 'purple',
        badgeText: isPickup ? 'Pronto para Retirada' : 'Saiu para Entrega',
        badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
        icon: isPickup ? '🏪' : '🛵',
        title: isPickup ? 'Pedido Pronto para Retirada!' : 'Pedido a Caminho do seu Endereço!',
        description: isPickup 
          ? 'Seu pedido já está separado e empacotado no balcão da loja. Pode passar para retirar!' 
          : 'Seu pedido já saiu para entrega! Em poucos minutos o entregador chegará com tudo fresquinho.',
        pctText: '75% • Em Rota'
      };
    }

    if (status === 'em preparo' || status === 'preparo' || status === 'preparing') {
      return {
        progress: 45,
        color: 'blue',
        badgeText: 'Em Preparo',
        badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
        icon: '🧺',
        title: 'Separando seus Produtos Fresquinhos!',
        description: 'A dona Janete já começou a selecionar as melhores verduras, frutas e legumes da colheita especialmente para você.',
        pctText: '50% • Na Horta'
      };
    }

    return {
      progress: 15,
      color: 'amber',
      badgeText: 'Pendente',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: '⏳',
      title: 'Pedido Recebido! Aguardando Confirmação',
      description: 'Seu pedido foi registrado no sistema e enviado para a Janete. Assim que ela iniciar a separação, você verá a atualização aqui.',
      pctText: '25% • Na fila'
    };
  };

  const statusInfo = getStatusInfo(order.status);
  const normalizedStatus = String(order.status || '').toLowerCase();
  const isPendenteDone = true;
  const isPreparoDone = ['em preparo', 'preparo', 'preparing', 'saiu para entrega', 'delivering', 'concluído', 'concluido', 'completed'].includes(normalizedStatus);
  const isEntregaDone = ['saiu para entrega', 'delivering', 'concluído', 'concluido', 'completed'].includes(normalizedStatus);
  const isConcluidoDone = ['concluído', 'concluido', 'completed'].includes(normalizedStatus);

  const cleanWhatsapp = whatsappNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Olá Dona Janete! Gostaria de informações sobre o meu pedido #${orderDisplayCode}.`)}`;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/70 z-50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center text-xl">
              📦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-white">
                  Acompanhamento do Pedido
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Ao Vivo
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <span>Pedido:</span>
                <strong className="font-mono text-amber-300 font-extrabold">#{orderDisplayCode}</strong>
                <button 
                  onClick={handleCopyId} 
                  title="Copiar código do pedido" 
                  className="text-slate-400 hover:text-white transition cursor-pointer p-0.5"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Status Hero Banner */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
            order.status === 'Concluído' 
              ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-green-50 border-emerald-200 text-emerald-950'
              : order.status === 'Saiu para Entrega'
              ? 'bg-gradient-to-br from-purple-500/10 via-purple-50 to-fuchsia-50 border-purple-200 text-purple-950'
              : order.status === 'Em Preparo'
              ? 'bg-gradient-to-br from-blue-500/10 via-blue-50 to-indigo-50 border-blue-200 text-blue-950'
              : 'bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50 border-amber-200 text-amber-950'
          }`}>
            <div className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center text-2xl flex-shrink-0 shadow-sm ${
              order.status === 'Concluído' ? 'bg-emerald-600' :
              order.status === 'Saiu para Entrega' ? 'bg-purple-600' :
              order.status === 'Em Preparo' ? 'bg-blue-600' : 'bg-amber-500'
            }`}>
              {statusInfo.icon}
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wide border ${statusInfo.badgeClass}`}>
                  {statusInfo.badgeText}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {formatDateTime(order.createdAt)}
                </span>
              </div>
              <h4 className="font-heading font-extrabold text-slate-900 text-sm sm:text-base">
                {statusInfo.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {statusInfo.description}
              </p>
            </div>
          </div>

          {/* Visual Timeline (4 Steps) */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 font-heading flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600" /> Linha do Tempo do Pedido
              </h5>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {statusInfo.pctText}
              </span>
            </div>

            <div className="relative pt-3 pb-2 px-2">
              {/* Background Line */}
              <div className="absolute top-[28px] left-6 right-6 h-1.5 bg-slate-200 rounded-full z-0"></div>
              {/* Active Progress Line */}
              <div 
                className="absolute top-[28px] left-6 h-1.5 bg-emerald-600 rounded-full z-0 transition-all duration-700 ease-out" 
                style={{ width: `${statusInfo.progress}%` }}
              ></div>

              {/* Grid with 4 Steps */}
              <div className="relative z-10 grid grid-cols-4 gap-1 text-center">
                {/* 1. Pendente */}
                <div className={`flex flex-col items-center gap-1.5 transition-all ${isPendenteDone ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full font-bold flex items-center justify-center text-xs shadow-md transition-all ${
                    order.status === 'Pendente' 
                      ? 'bg-amber-500 text-white ring-4 ring-amber-200 animate-pulse' 
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {order.status === 'Pendente' ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span className="font-extrabold text-[11px] text-slate-900 leading-tight">Pendente</span>
                  <span className="text-[9px] text-slate-400 hidden sm:block">Recebido</span>
                </div>

                {/* 2. Em Preparo */}
                <div className={`flex flex-col items-center gap-1.5 transition-all ${isPreparoDone ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full font-bold flex items-center justify-center text-xs transition-all ${
                    order.status === 'Em Preparo' 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200 animate-pulse shadow-md' 
                      : isPreparoDone 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    <Package className="w-4 h-4" />
                  </div>
                  <span className={`text-[11px] leading-tight ${isPreparoDone ? 'font-extrabold text-slate-900' : 'font-bold text-slate-500'}`}>
                    Em Preparo
                  </span>
                  <span className="text-[9px] text-slate-400 hidden sm:block">Separando</span>
                </div>

                {/* 3. Saiu para Entrega */}
                <div className={`flex flex-col items-center gap-1.5 transition-all ${isEntregaDone ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full font-bold flex items-center justify-center text-xs transition-all ${
                    order.status === 'Saiu para Entrega' 
                      ? 'bg-purple-600 text-white ring-4 ring-purple-200 animate-pulse shadow-md' 
                      : isEntregaDone 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {order.deliveryType === 'pickup' ? <StoreIcon className="w-4 h-4" /> : <Bike className="w-4 h-4" />}
                  </div>
                  <span className={`text-[11px] leading-tight ${isEntregaDone ? 'font-extrabold text-slate-900' : 'font-bold text-slate-500'}`}>
                    {order.deliveryType === 'pickup' ? 'Balcão' : 'Em Rota'}
                  </span>
                  <span className="text-[9px] text-slate-400 hidden sm:block">
                    {order.deliveryType === 'pickup' ? 'Pronto' : 'A caminho'}
                  </span>
                </div>

                {/* 4. Concluído */}
                <div className={`flex flex-col items-center gap-1.5 transition-all ${isConcluidoDone ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full font-bold flex items-center justify-center text-xs transition-all ${
                    isConcluidoDone ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className={`text-[11px] leading-tight ${isConcluidoDone ? 'font-extrabold text-slate-900' : 'font-bold text-slate-500'}`}>
                    Concluído
                  </span>
                  <span className="text-[9px] text-slate-400 hidden sm:block">Finalizado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> Detalhes do Pedido
              </span>
              <span className="font-heading font-black text-emerald-700 text-sm">
                {formatCurrency(order.total)}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-start justify-between text-slate-600">
                <span className="font-semibold text-slate-500">Cliente:</span>
                <span className="font-bold text-slate-800 text-right">{order.customer.name} ({order.customer.phone})</span>
              </div>
              <div className="flex items-start justify-between text-slate-600">
                <span className="font-semibold text-slate-500">Destino:</span>
                <span className="font-medium text-slate-800 text-right max-w-[240px] truncate">
                  {order.deliveryType === 'delivery' && order.customer.address 
                    ? `${order.customer.address.street}, ${order.customer.address.number} - ${order.customer.address.neighborhood}` 
                    : 'Retirada no Balcão da Loja'}
                </span>
              </div>
              <div className="flex items-start justify-between text-slate-600">
                <span className="font-semibold text-slate-500">Pagamento:</span>
                <span className="font-bold text-slate-800 text-right">{order.paymentMethod}</span>
              </div>
            </div>

            {/* Items list */}
            <div className="border border-slate-200 rounded-2xl p-3 bg-white space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Itens ({order.items.length}):
              </span>
              <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{item.product.name}</span>
                      <span className="text-slate-500 ml-1">({item.quantity} {item.product.unit})</span>
                      {item.notes && <p className="text-[10px] text-slate-400 italic">Obs: {item.notes}</p>}
                    </div>
                    <span className="font-extrabold text-emerald-700">{formatCurrency(item.itemTotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Falar com Janete no WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-4 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Minimizar
          </button>
        </div>
      </div>
    </div>
  );
};
