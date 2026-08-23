import React from 'react';
import { X, Printer, Check } from 'lucide-react';
import { Order, StoreConfig } from '../types';
import { JaneteLogo } from './JaneteLogo';
import { formatCurrency, formatTimeHour } from '../utils/formatters';

interface ReceiptModalProps {
  order: Order | null;
  config: StoreConfig;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  config,
  onClose
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
      />

      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-heading font-bold text-base text-stone-900">
            Comprovante do Pedido #{order.orderNumber}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Receipt */}
        <div id="thermal-receipt" className="bg-stone-50 p-4 rounded-xl border border-stone-200 font-mono text-xs text-stone-800 space-y-3 shadow-inner">
          <div className="text-center space-y-1 border-b border-dashed border-stone-300 pb-2">
            <div className="flex justify-center pb-1">
              <JaneteLogo size={52} />
            </div>
            <h4 className="font-bold text-sm text-stone-900 uppercase">
              {config.storeName}
            </h4>
            <p className="text-[10px] text-stone-500">
              {config.addressDisplay}
            </p>
            <p className="text-[10px] text-stone-500">
              WhatsApp: {config.formattedPhone}
            </p>
            <p className="text-[11px] font-bold text-emerald-800 pt-1">
              PEDIDO #{order.orderNumber}
            </p>
            <p className="text-[10px] text-stone-400">
              Data/Hora: {new Date(order.createdAt).toLocaleDateString('pt-BR')} {formatTimeHour(order.createdAt)}
            </p>
          </div>

          <div className="border-b border-dashed border-stone-300 pb-2 space-y-1">
            <p><strong>CLIENTE:</strong> {order.customer.name}</p>
            <p><strong>CONTATO:</strong> {order.customer.phone}</p>
            <p><strong>TIPO:</strong> {order.customer.deliveryType === 'delivery' ? '🛵 ENTREGA' : '🏪 RETIRADA NO BALCÃO'}</p>
            {order.customer.deliveryType === 'delivery' && (
              <p>
                <strong>ENDEREÇO:</strong> {order.customer.street}, {order.customer.number}
                {order.customer.neighborhood ? ` - ${order.customer.neighborhood}` : ''}
                {order.customer.complement ? ` (${order.customer.complement})` : ''}
              </p>
            )}
            {order.customer.reference && (
              <p><strong>REF.:</strong> {order.customer.reference}</p>
            )}
          </div>

          <div className="border-b border-dashed border-stone-300 pb-2 space-y-1.5">
            <p className="font-bold text-stone-900">ITENS:</p>
            {order.items.map((item, i) => (
              <div key={i} className="text-[11px]">
                <div className="flex justify-between font-semibold">
                  <span>{item.quantity}{item.product.unit} {item.product.name}</span>
                  <span>{formatCurrency(item.itemTotal)}</span>
                </div>
                {item.notes && (
                  <p className="text-[10px] text-stone-500 italic pl-2">
                    ⤷ {item.notes}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-1 text-right pt-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.customer.deliveryType === 'delivery' && (
              <div className="flex justify-between">
                <span>Taxa Entrega:</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-stone-900 pt-1 border-t border-stone-300">
              <span>TOTAL:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-stone-600 pt-1">
              <span>Forma de Pagto:</span>
              <span>
                {order.paymentMethod === 'pix' && 'PIX'}
                {order.paymentMethod === 'card_delivery' && 'Cartão na Entrega'}
                {order.paymentMethod === 'cash' && `Dinheiro ${order.changeFor ? `(Troco p/ ${formatCurrency(order.changeFor)})` : ''}`}
              </span>
            </div>
          </div>

          {order.notes && (
            <div className="border-t border-dashed border-stone-300 pt-2 text-[10px] text-stone-600">
              <p><strong>OBSERVAÇÃO:</strong> {order.notes}</p>
            </div>
          )}

          <div className="text-center pt-2 text-[10px] text-stone-400">
            *** Obrigado pela preferência! ***
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
};
