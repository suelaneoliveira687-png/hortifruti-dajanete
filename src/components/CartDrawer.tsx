import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Bike, 
  Store as StoreIcon, 
  Send, 
  AlertCircle, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Copy, 
  Check, 
  Info,
  MessageSquare,
  Activity,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, DeliveryType, PaymentMethod, StoreConfig, Order } from '../types';
import { formatCurrency, formatPhone, getWhatsAppLink, resolveProductImageUrl, handleProductImageError } from '../utils/formatters';
import { soundService } from '../services/soundService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onUpdateItemNotes: (productId: string, notes: string) => void;
  onClearCart: () => void;
  config: StoreConfig;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateItemNotes,
  onClearCart,
  config
}) => {
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [needsChange, setNeedsChange] = useState<boolean>(false);
  const [changeFor, setChangeFor] = useState<string>('');
  
  // Customer inputs
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [reference, setReference] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  
  const [activeItemNoteId, setActiveItemNoteId] = useState<string | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  


  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.itemTotal, 0);
  const neighborhoodRate = config.deliveryRates?.find(rate => rate.bairro.toLowerCase() === neighborhood.trim().toLowerCase());
  const deliveryFee = deliveryType === 'delivery' ? neighborhoodRate?.valor ?? config.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  const isMinOrderMet = subtotal >= (config.minOrderValue || 0);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(config.pixKey);
    setCopiedPix(true);
    soundService.playSuccessTone();
    setTimeout(() => setCopiedPix(false), 2000);
  };



  const handleFinishOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (cartItems.length === 0) {
      setFormError('Seu carrinho está vazio.');
      return;
    }

    if (!name.trim()) {
      setFormError('Por favor, informe seu nome completo.');
      return;
    }

    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setFormError('Por favor, informe um WhatsApp válido com DDD.');
      return;
    }

    if (deliveryType === 'delivery') {
      if (!street.trim() || !number.trim() || !neighborhood.trim()) {
        setFormError('Por favor, preencha o endereço de entrega (Rua, Número e Bairro).');
        return;
      }
    }

    if (paymentMethod === 'cash' && needsChange) {
      const changeNum = parseFloat(changeFor.replace(',', '.'));
      if (isNaN(changeNum) || changeNum <= total) {
        setFormError(`O valor para troco deve ser maior que o total (${formatCurrency(total)}).`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const orderId = `ord-${Date.now()}`;
      const orderNumber = `JAN-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder: Order = {
        id: orderId,
        orderNumber,
        createdAt: new Date().toISOString(),
        timestamp: Date.now(),
        customer: {
          name: name.trim(),
          phone: formatPhone(phone),
          deliveryType,
          street: street.trim(),
          number: number.trim(),
          neighborhood: neighborhood.trim(),
          complement: complement.trim(),
          reference: reference.trim()
        },
        paymentMethod,
        changeFor: paymentMethod === 'cash' && needsChange ? parseFloat(changeFor.replace(',', '.')) : undefined,
        items: [...cartItems],
        subtotal,
        deliveryFee,
        total,
        status: 'pending',
        notes: generalNotes.trim() || undefined
      };

      // Apenas montar a URL e abrir o WhatsApp
      const whatsappUrl = getWhatsAppLink(newOrder, config);
      window.open(whatsappUrl, '_blank');

      // Clear cart
      onClearCart();
      onClose();
    } catch (err) {
      console.error(err);
      setFormError('Ocorreu um erro ao processar o pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-stone-50 text-stone-800 shadow-2xl flex flex-col justify-between h-full">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-white border-b border-stone-200 flex items-center justify-between pt-[max(1rem,env(safe-area-inset-top))] flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                🛒
              </div>
              <div>
                <h2 className="font-heading font-bold text-base sm:text-lg text-stone-900 leading-tight">
                  Seu Carrinho
                </h2>
                <p className="text-xs text-stone-500">
                  {cartItems.length} {cartItems.length === 1 ? 'item selecionado' : 'itens selecionados'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all touch-manipulation cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Scrollable */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-5 pb-8 overscroll-contain">
            
            {/* Items List */}
            {cartItems.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-3">
                  🥬
                </div>
                <h3 className="font-heading font-bold text-stone-800 text-base">
                  Seu carrinho está vazio
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  Adicione frutas, verduras e legumes frescos do nosso cardápio para continuar.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Produtos Selecionados
                  </span>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-[11px] text-red-500 hover:text-red-700 font-medium flex items-center gap-1 touch-manipulation cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Limpar tudo
                  </button>
                </div>

                <div className="space-y-2.5">
                  {cartItems.map((item, index) => {
                    const step = item.product.stepQty || (item.product.unit === 'kg' ? 0.5 : 1);
                    const min = item.product.minQty || step;
                    const isMaxixeQuiabo = 
                      item.product.id === 'l-11' || 
                      (item.product.name.toLowerCase().includes('maxixe') && item.product.name.toLowerCase().includes('quiabo'));

                    return (
                      <div 
                        key={`${item.product.id}_${index}`}
                        className="bg-white p-3 rounded-xl border border-stone-200/80 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <img
                            src={resolveProductImageUrl(item.product.image)}
                            data-original-src={item.product.image}
                            alt={item.product.name}
                            onError={(e) => handleProductImageError(e, item.product.image)}
                            className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-heading font-bold text-stone-900 text-xs sm:text-sm truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-[11px] text-stone-500">
                              {formatCurrency(item.product.price)}/{item.product.unit}
                            </p>
                          </div>
                          
                          <div className="text-right flex-shrink-0">
                            <span className="font-bold text-xs sm:text-sm text-emerald-800 font-heading">
                              {formatCurrency(item.itemTotal)}
                            </span>
                          </div>
                        </div>

                        {/* Combo Quick Options Switcher for Maxixe e Quiabo */}
                        {isMaxixeQuiabo && (
                          <div className="bg-[#FAF8F5] border border-[#C5A059]/30 rounded-lg p-2 space-y-1 text-xs">
                            <div className="flex items-center justify-between text-[10px] font-bold text-[#285336]">
                              <span>Porção selecionada:</span>
                              <span className="text-stone-500 font-medium">15 unidades</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1 pt-0.5">
                              <button
                                type="button"
                                onClick={() => onUpdateItemNotes(item.product.id, 'Meio a Meio (Misto: ~8 Maxixes e ~7 Quiabos)')}
                                className={`py-1 px-1 rounded-md text-[10px] font-bold border transition text-center ${
                                  !item.notes || item.notes.includes('Meio a Meio') || item.notes.includes('Misto')
                                    ? 'bg-[#285336] text-white border-[#285336]'
                                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                                }`}
                              >
                                Meio a Meio
                              </button>
                              <button
                                type="button"
                                onClick={() => onUpdateItemNotes(item.product.id, 'Apenas Maxixe (15 unidades)')}
                                className={`py-1 px-1 rounded-md text-[10px] font-bold border transition text-center ${
                                  item.notes && item.notes.includes('Apenas Maxixe')
                                    ? 'bg-[#285336] text-white border-[#285336]'
                                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                                }`}
                              >
                                Só Maxixe
                              </button>
                              <button
                                type="button"
                                onClick={() => onUpdateItemNotes(item.product.id, 'Apenas Quiabo (15 unidades)')}
                                className={`py-1 px-1 rounded-md text-[10px] font-bold border transition text-center ${
                                  item.notes && item.notes.includes('Apenas Quiabo')
                                    ? 'bg-[#285336] text-white border-[#285336]'
                                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                                }`}
                              >
                                Só Quiabo
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Item Note Input */}
                        {activeItemNoteId === item.product.id ? (
                          <div className="pt-1 flex gap-1.5">
                            <input
                              type="text"
                              value={item.notes || ''}
                              onChange={(e) => onUpdateItemNotes(item.product.id, e.target.value)}
                              placeholder="Ex: 'bananas bem maduras', proporção personalizada..."
                              className="flex-1 text-base sm:text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => setActiveItemNoteId(null)}
                              className="text-xs bg-stone-100 text-stone-700 px-3 py-1.5 rounded-lg font-medium hover:bg-stone-200 touch-manipulation cursor-pointer"
                            >
                              Ok
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-stone-100">
                            <button
                              type="button"
                              onClick={() => setActiveItemNoteId(item.product.id)}
                              className="text-stone-500 hover:text-emerald-700 flex items-center gap-1 touch-manipulation cursor-pointer min-w-0 flex-1"
                            >
                              <MessageSquare className="w-3 h-3 flex-shrink-0" />
                              {item.notes ? (
                                <span className="text-emerald-800 font-semibold italic truncate">
                                  {item.notes}
                                </span>
                              ) : (
                                <span>+ Observação / Proporção</span>
                              )}
                            </button>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (item.quantity <= min) {
                                    onRemoveItem(item.product.id);
                                  } else {
                                    onUpdateQuantity(item.product.id, Number((item.quantity - step).toFixed(2)));
                                  }
                                }}
                                className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center touch-manipulation active:scale-95 cursor-pointer"
                              >
                                {item.quantity <= min ? <Trash2 className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5" />}
                              </button>

                              <span className="font-bold text-xs px-1 text-center min-w-10">
                                {item.quantity} {item.product.unit}
                              </span>

                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.product.id, Number((item.quantity + step).toFixed(2)))}
                                className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center touch-manipulation active:scale-95 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {cartItems.length > 0 && (
              <>
                {/* Delivery Type Option */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Tipo de Atendimento
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('delivery')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all touch-manipulation cursor-pointer ${
                        deliveryType === 'delivery'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs ring-1 ring-emerald-500'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Bike className="w-5 h-5 text-emerald-600" />
                      <span>Entrega em Domicílio</span>
                      <span className="text-[11px] font-normal text-emerald-700">
                        Taxa: {formatCurrency(deliveryFee)}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('pickup')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all touch-manipulation cursor-pointer ${
                        deliveryType === 'pickup'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs ring-1 ring-emerald-500'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <StoreIcon className="w-5 h-5 text-emerald-600" />
                      <span>Retirada no Balcão</span>
                      <span className="text-[11px] font-normal text-emerald-700">
                        Grátis • Sem taxa
                      </span>
                    </button>
                  </div>

                  {deliveryType === 'pickup' && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>
                        Você poderá retirar seu pedido pronto no balcão em <strong>{config.addressDisplay}</strong>.
                      </span>
                    </div>
                  )}
                </div>

                {/* Customer Details Form */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Seus Dados para o Pedido
                  </span>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Seu Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Maria das Graças"
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-base sm:text-xs text-stone-900 focus:outline-emerald-500 touch-manipulation"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        WhatsApp com DDD *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-base sm:text-xs text-stone-900 focus:outline-emerald-500 touch-manipulation"
                      />
                    </div>

                    {deliveryType === 'delivery' && (
                      <div className="space-y-2 pt-2 border-t border-stone-200/60">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className="block font-semibold text-stone-700 mb-1">
                              Rua / Avenida *
                            </label>
                            <input
                              type="text"
                              required
                              value={street}
                              onChange={(e) => setStreet(e.target.value)}
                              placeholder="Ex: Rua das Flores"
                              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-base sm:text-xs text-stone-900 focus:outline-emerald-500 touch-manipulation"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">
                              Número *
                            </label>
                            <input
                              type="text"
                              required
                              value={number}
                              onChange={(e) => setNumber(e.target.value)}
                              placeholder="123"
                              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-base sm:text-xs text-stone-900 focus:outline-emerald-500 touch-manipulation"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">
                              Bairro *
                            </label>
                            <input
                              type="text"
                              required
                              value={neighborhood}
                              onChange={(e) => setNeighborhood(e.target.value)}
                              placeholder="Ex: Centro"
                              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-base sm:text-xs text-stone-900 focus:outline-emerald-500 touch-manipulation"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">
                              Complemento
                            </label>
                            <input
                              type="text"
                              value={complement}
                              onChange={(e) => setComplement(e.target.value)}
                              placeholder="Apto 42, Bloco B"
                              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-base sm:text-xs text-stone-900 focus:outline-emerald-500 touch-manipulation"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">
                            Ponto de Referência
                          </label>
                          <input
                            type="text"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="Ex: Em frente à padaria, portão branco"
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-base sm:text-xs text-stone-900 focus:outline-emerald-500 touch-manipulation"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Observações do Pedido (Opcional)
                      </label>
                      <textarea
                        rows={2}
                        value={generalNotes}
                        onChange={(e) => setGeneralNotes(e.target.value)}
                        placeholder="Alguma instrução especial para a entrega ou separação dos itens?"
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-base sm:text-xs text-stone-900 focus:outline-emerald-500 resize-none touch-manipulation"
                      />
                    </div>

                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Forma de Pagamento
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all touch-manipulation cursor-pointer ${
                        paymentMethod === 'pix'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs ring-1 ring-emerald-500'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-emerald-600" />
                      <span>PIX</span>
                      <span className="text-[10px] text-emerald-700 font-normal">Chave</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card_delivery')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all touch-manipulation cursor-pointer ${
                        paymentMethod === 'card_delivery'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs ring-1 ring-emerald-500'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                      <span>Cartão</span>
                      <span className="text-[10px] text-stone-500 font-normal">Na Entrega</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all touch-manipulation cursor-pointer ${
                        paymentMethod === 'cash'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs ring-1 ring-emerald-500'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Banknote className="w-5 h-5 text-emerald-600" />
                      <span>Dinheiro</span>
                      <span className="text-[10px] text-stone-500 font-normal">C/ Troco</span>
                    </button>
                  </div>

                  {/* PIX Copy box */}
                  {paymentMethod === 'pix' && (
                    <div className="p-3 bg-emerald-900/5 border border-emerald-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-emerald-900">
                          Chave PIX ({config.pixKeyType}):
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded-md touch-manipulation cursor-pointer"
                        >
                          {copiedPix ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedPix ? 'Copiado!' : 'Copiar Chave'}
                        </button>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-emerald-100 font-mono text-xs text-stone-800 text-center font-bold select-all">
                        {config.pixKey}
                      </div>
                      <p className="text-[10px] text-emerald-800/80 leading-relaxed">
                        💡 Você pode fazer o pagamento agora ou após a confirmação no WhatsApp com a Janete.
                      </p>
                    </div>
                  )}

                  {/* Cash Change box */}
                  {paymentMethod === 'cash' && (
                    <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl space-y-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer touch-manipulation">
                        <input
                          type="checkbox"
                          checked={needsChange}
                          onChange={(e) => setNeedsChange(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span>Precisa de troco?</span>
                      </label>

                      {needsChange && (
                        <div>
                          <label className="block text-[11px] text-stone-600 mb-1">
                            Troco para quanto? (R$)
                          </label>
                          <input
                            type="text"
                            value={changeFor}
                            onChange={(e) => setChangeFor(e.target.value)}
                            placeholder="Ex: 50,00 ou 100,00"
                            className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-base sm:text-xs text-stone-900 font-bold focus:outline-emerald-500 touch-manipulation"
                          />
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </>
            )}

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

          </div>

          {/* Footer Summary & Checkout Button */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-stone-200 shadow-lg space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))] flex-shrink-0">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Taxa de Entrega</span>
                  <span>{deliveryType === 'delivery' ? formatCurrency(deliveryFee) : 'Grátis'}</span>
                </div>
                <div className="flex justify-between text-[#38302B] font-extrabold text-base pt-1 border-t border-stone-100 font-heading">
                  <span>Total</span>
                  <span className="text-[#285336]">{formatCurrency(total)}</span>
                </div>
              </div>

              {!isMinOrderMet && (
                <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg text-center font-bold border border-amber-200">
                  ⚠️ Pedido mínimo: {formatCurrency(config.minOrderValue)} (Faltam {formatCurrency(config.minOrderValue - subtotal)})
                </div>
              )}

              <button
                type="button"
                disabled={isSubmitting || !isMinOrderMet}
                onClick={handleFinishOrder}
                className="w-full py-3.5 px-4 bg-[#D92338] hover:bg-[#B8192C] active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold rounded-xl sm:rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#D92338]/30 transition-all touch-manipulation cursor-pointer border border-[#B8192C]"
              >
                {isSubmitting ? (
                  <span>Processando e Enviando...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-amber-200" />
                    <span>Enviar Pedido ({formatCurrency(total)})</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#285336]" />
                Após enviar, confira a mensagem no WhatsApp
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
