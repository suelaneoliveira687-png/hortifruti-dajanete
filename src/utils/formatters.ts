import React from 'react';
import { Order, StoreConfig } from '../types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatTimeAgo = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMin < 1) return 'Agora mesmo';
    if (diffMin < 60) return `Há ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Há ${diffHours}h`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Recente';
  }
};

export const formatTimeHour = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
};

export const formatDateTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '--/-- --:--';
  }
};

export const formatPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
};

export const buildWhatsAppMessage = (order: Order, config: StoreConfig): string => {
  const clientText = `👤 *CLIENTE*
Nome: ${order.customer.name}
Telefone: ${order.customer.phone}`;

  let deliverySection = '';
  if (order.customer.deliveryType === 'delivery') {
    deliverySection = `\n\n📍 *ENDEREÇO DE ENTREGA*
${order.customer.street}, ${order.customer.number}
Bairro: ${order.customer.neighborhood}${order.customer.complement ? `\nComplemento: ${order.customer.complement}` : ''}${order.customer.reference ? `\nReferência: ${order.customer.reference}` : ''}`;
  }

  const itemsText = order.items.map(item => {
    const unit = item.product.unit?.toLowerCase() || '';
    const isUnit = ['un', 'unid', 'unidade', 'unidades', ''].includes(unit);
    const qtyText = isUnit ? `${item.quantity}x` : `${item.quantity} ${item.product.unit}`;
    let text = `${qtyText} ${item.product.name} — ${formatCurrency(item.itemTotal)}`;
    if (item.notes) {
      text += `\n• ${item.notes}`;
    }
    return text;
  }).join('\n\n');

  const subtotalText = `Subtotal: ${formatCurrency(order.subtotal)}`;
  const deliveryFeeText = order.customer.deliveryType === 'delivery' ? `\nTaxa de entrega: ${formatCurrency(order.deliveryFee)}` : '';
  const totalText = `*TOTAL: ${formatCurrency(order.total)}*`;

  let paymentMethodName = '';
  if (order.paymentMethod === 'pix') {
    paymentMethodName = 'Pix';
  } else if (order.paymentMethod === 'card_delivery') {
    paymentMethodName = 'Cartão na Entrega';
  } else if (order.paymentMethod === 'cash') {
    paymentMethodName = 'Dinheiro';
    if (order.changeFor) paymentMethodName += ` (Troco para ${formatCurrency(order.changeFor)})`;
  } else {
    paymentMethodName = order.paymentMethod;
  }

  const paymentText = `💳 *PAGAMENTO*\n${paymentMethodName}`;

  const receivingForm = order.customer.deliveryType === 'delivery' ? 'Entrega' : 'Retirada';
  const receivingText = `🚚 *FORMA DE RECEBIMENTO*\n${receivingForm}`;

  const generalNotes = order.notes ? `\n\n📝 *OBSERVAÇÕES*\n${order.notes}` : '';

  const message = `🛵 *NOVO PEDIDO #${order.orderNumber}*

${clientText}${deliverySection}

🛒 *ITENS DO PEDIDO*

${itemsText}

────────────────────

💰 *RESUMO*

${subtotalText}${deliveryFeeText}

${totalText}

${paymentText}

${receivingText}${generalNotes}

────────────────────

📌 *PEDIDO #${order.orderNumber}*
Aguardando confirmação do estabelecimento.`;

  return message;
};

export const getWhatsAppLink = (order: Order, config: StoreConfig): string => {
  const message = buildWhatsAppMessage(order, config);
  const cleanPhone = config.phoneWhatsApp.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Normalizes and resolves product image URLs to ensure reliable loading in both dev and prod
 */
export const resolveProductImageUrl = (url: string | undefined): string => {
  if (!url) {
    return '/imagens/banana_da_terra_perfeita_1787338305708.jpg';
  }
  // If already full http/https, return as is
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  // If it references /src/assets/images/, convert to /imagens/
  if (url.includes('/src/assets/images/')) {
    const filename = url.split('/').pop() || '';
    return `/imagens/${filename}`;
  }
  // Ensure leading slash if relative
  if (!url.startsWith('/')) {
    return `/${url}`;
  }
  return url;
};

/**
 * Robust image fallback handler that tries multiple alternative local paths before default
 */
export const handleProductImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  originalUrl?: string
) => {
  const target = e.currentTarget;
  const currentSrc = target.src;
  const url = originalUrl || target.getAttribute('data-original-src') || currentSrc;
  const filename = url.split('/').pop()?.split('?')[0] || '';

  // Try local relative path if full path failed
  if (!target.dataset.triedRelative && filename) {
    target.dataset.triedRelative = 'true';
    target.src = `imagens/${filename}`;
    return;
  }
  // Try src/assets path
  if (!target.dataset.triedAssets && filename) {
    target.dataset.triedAssets = 'true';
    target.src = `/src/assets/images/${filename}`;
    return;
  }
  // Final fallback to clean fresh grocery photo if file completely missing
  target.src = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80';
};

