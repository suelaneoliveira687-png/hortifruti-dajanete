import React, { useState } from 'react';
import { 
  Clock, 
  Bike, 
  Store as StoreIcon, 
  MessageCircle, 
  CheckCircle2, 
  ChefHat, 
  Trash2, 
  Printer, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Order, OrderStatus, StoreConfig } from '../types';
import { formatCurrency, formatTimeAgo, formatTimeHour } from '../utils/formatters';

interface AdminOrderCardProps {
  order: Order;
  config: StoreConfig;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onPrintOrder: (order: Order) => void;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; border: string }> = {
  pending: {
    label: 'Pendente',
    color: 'text-amber-800',
    bg: 'bg-amber-100',
    border: 'border-amber-300'
  },
  preparing: {
    label: 'Em Preparo',
    color: 'text-blue-800',
    bg: 'bg-blue-100',
    border: 'border-blue-300'
  },
  delivering: {
    label: 'Saiu para Entrega',
    color: 'text-purple-800',
    bg: 'bg-purple-100',
    border: 'border-purple-300'
  },
  completed: {
    label: 'Concluído',
    color: 'text-emerald-800',
    bg: 'bg-emerald-100',
    border: 'border-emerald-300'
  },
  cancelled: {
    label: 'Cancelado',
    color: 'text-stone-600',
    bg: 'bg-stone-200',
    border: 'border-stone-300'
  }
};

export const AdminOrderCard: React.FC<AdminOrderCardProps> = ({
  order,
  config,
  onUpdateStatus,
  onDeleteOrder,
  onPrintOrder
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  const handleWhatsAppCustomer = () => {
    const cleanPhone = order.customer.phone.replace(/\D/g, '');
    let text = `Olá ${order.customer.name}! Aqui é a Janete do Hortifruti. `;
    if (order.status === 'pending') {
      text += `Recebemos seu pedido #${order.orderNumber} e já estamos separando seus produtos fresquinhos!`;
    } else if (order.status === 'preparing') {
      text += `Seu pedido #${order.orderNumber} está sendo preparado com muito carinho!`;
    } else if (order.status === 'delivering') {
      text += `Seu pedido #${order.orderNumber} acabou de sair para entrega e logo chegará no seu endereço! 🛵`;
    } else if (order.status === 'completed') {
      text += `Seu pedido #${order.orderNumber} foi concluído! Esperamos que goste de tudo. Muito obrigado pela preferência! 🥬`;
    } else {
      text += `Entrando em contato sobre seu pedido #${order.orderNumber}.`;
    }

    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md ${
      order.status === 'pending' ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-stone-200'
    }`}>
      
      {/* Top Card Header */}
      <div className="p-4 bg-stone-50/70 border-b border-stone-200/80 rounded-t-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="font-mono font-extrabold text-stone-900 text-sm bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
            #{order.orderNumber}
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {statusInfo.label}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            {formatTimeHour(order.createdAt)} • {formatTimeAgo(order.createdAt)}
          </span>

          <div className="flex items-center gap-1.5 pl-2 border-l border-stone-200">
            <button
              type="button"
              onClick={() => onPrintOrder(order)}
              className="p-1.5 rounded-lg text-stone-600 hover:text-emerald-700 hover:bg-stone-200/60 transition cursor-pointer"
              title="Imprimir Comprovante"
            >
              <Printer className="w-4 h-4" />
            </button>

            {isConfirmingDelete ? (
              <div className="flex items-center gap-1 bg-red-50 border border-red-200 px-2 py-0.5 rounded-xl animate-in fade-in zoom-in-95 duration-150">
                <span className="text-[11px] font-bold text-red-800">Excluir?</span>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteOrder(order.id);
                    setIsConfirmingDelete(false);
                  }}
                  className="px-2 py-0.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-[11px] font-extrabold rounded-lg cursor-pointer transition shadow-2xs"
                  title="Confirmar exclusão"
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-1.5 py-0.5 bg-stone-200 hover:bg-stone-300 active:scale-95 text-stone-700 text-[11px] font-bold rounded-lg cursor-pointer transition"
                  title="Cancelar"
                >
                  Não
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                title="Excluir Pedido"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customer Info Row */}
      <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-extrabold text-base text-stone-900">
              {order.customer.name}
            </h3>
            <span className="text-xs text-stone-500 font-mono">
              {order.customer.phone}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-stone-600">
            {order.customer.deliveryType === 'delivery' ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                <Bike className="w-3.5 h-3.5 text-emerald-600" /> Entrega
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                <StoreIcon className="w-3.5 h-3.5 text-amber-600" /> Retirada no Balcão
              </span>
            )}

            {order.customer.deliveryType === 'delivery' && (
              <span className="text-stone-600 text-xs">
                {order.customer.street}, nº {order.customer.number}
                {order.customer.neighborhood ? ` - ${order.customer.neighborhood}` : ''}
                {order.customer.complement ? ` (${order.customer.complement})` : ''}
              </span>
            )}
          </div>

          {order.customer.reference && (
            <p className="text-[11px] text-stone-500 mt-1 italic">
              📍 Ponto de ref.: {order.customer.reference}
            </p>
          )}

          {order.notes && (
            <p className="text-xs text-amber-900 bg-amber-50/80 p-2 rounded-lg mt-2 border border-amber-200/60">
              💬 <strong>Obs do cliente:</strong> {order.notes}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleWhatsAppCustomer}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs active:scale-95 transition-all self-start sm:self-center"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Falar no WhatsApp</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </button>
      </div>

      {/* Items Section */}
      <div className="p-4 bg-stone-50/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Itens ({order.items.length})
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1"
          >
            <span>{isExpanded ? 'Recolher' : 'Expandir detalhes'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-2 mb-3">
            {order.items.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between text-xs py-1.5 px-2.5 bg-white rounded-lg border border-stone-200/60"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <span className="font-semibold text-stone-900">{item.product.name}</span>
                    <span className="text-stone-500 ml-1.5">
                      ({item.quantity} {item.product.unit} x {formatCurrency(item.product.price)})
                    </span>
                    {item.notes && (
                      <span className="block text-[11px] text-amber-700 italic">
                        Obs: {item.notes}
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-bold text-stone-800 ml-2 font-mono">
                  {formatCurrency(item.itemTotal)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Totals & Payment Summary */}
        <div className="pt-2 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-500">Pagamento:</span>
            <span className="font-bold text-stone-800 bg-white px-2 py-0.5 rounded-md border border-stone-200">
              {order.paymentMethod === 'pix' && '🔑 PIX'}
              {order.paymentMethod === 'card_delivery' && '💳 Cartão na Entrega'}
              {order.paymentMethod === 'cash' && `💵 Dinheiro ${order.changeFor ? `(Troco p/ ${formatCurrency(order.changeFor)})` : ''}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {order.customer.deliveryType === 'delivery' && (
              <span className="text-stone-500">
                Taxa: <strong className="text-stone-700">{formatCurrency(order.deliveryFee)}</strong>
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-stone-500 font-semibold">Total:</span>
              <span className="font-heading font-extrabold text-base text-emerald-800">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons for Status Change */}
      <div className="p-3 bg-white rounded-b-2xl border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
          Mudar Status:
        </span>

        <div className="flex flex-wrap items-center gap-1.5">
          {order.status !== 'pending' && (
            <button
              type="button"
              onClick={() => onUpdateStatus(order.id, 'pending')}
              className="px-2.5 py-1 text-xs rounded-lg font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
            >
              Pendente
            </button>
          )}

          {order.status !== 'preparing' && (
            <button
              type="button"
              onClick={() => onUpdateStatus(order.id, 'preparing')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-semibold bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
            >
              <ChefHat className="w-3.5 h-3.5" /> Preparar
            </button>
          )}

          {order.status !== 'delivering' && (
            <button
              type="button"
              onClick={() => onUpdateStatus(order.id, 'delivering')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-semibold bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200"
            >
              <Bike className="w-3.5 h-3.5" /> Em Rota
            </button>
          )}

          {order.status !== 'completed' && (
            <button
              type="button"
              onClick={() => onUpdateStatus(order.id, 'completed')}
              className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Concluir
            </button>
          )}

          {order.status !== 'cancelled' && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Marcar este pedido como cancelado?')) {
                  onUpdateStatus(order.id, 'cancelled');
                }
              }}
              className="px-2 py-1 text-xs rounded-lg font-medium text-stone-400 hover:text-red-700 hover:bg-red-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
