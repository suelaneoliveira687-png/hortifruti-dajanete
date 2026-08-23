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
  const deliveryText = order.customer.deliveryType === 'delivery' 
    ? `🛵 *Entrega em Domicílio*\n📍 Endereço: ${order.customer.street}, nº ${order.customer.number}${order.customer.neighborhood ? ` - ${order.customer.neighborhood}` : ''}${order.customer.complement ? ` (${order.customer.complement})` : ''}${order.customer.reference ? `\n📌 Ponto de Ref.: ${order.customer.reference}` : ''}`
    : `🏪 *Retirada no Balcão*\n📍 Endereço da Loja: ${config.addressDisplay}`;

  let paymentText = '';
  if (order.paymentMethod === 'pix') {
    paymentText = `🔑 *PIX* (Chave: ${config.pixKey})`;
  } else if (order.paymentMethod === 'card_delivery') {
    paymentText = `💳 *Cartão na Entrega* (Maquininha)`;
  } else if (order.paymentMethod === 'cash') {
    paymentText = `💵 *Dinheiro*${order.changeFor ? ` (Troco para ${formatCurrency(order.changeFor)})` : ' (Não precisa de troco)'}`;
  }

  const itemsList = order.items
    .map((item, i) => ` ${i + 1}. *${item.product.name}* x ${item.quantity} ${item.product.unit} = ${formatCurrency(item.itemTotal)}${item.notes ? `\n    _(Obs: ${item.notes})_` : ''}`)
    .join('\n');

  const notesText = order.notes ? `\n📝 *Observações Gerais:* ${order.notes}\n` : '';

  const message = 
`🥬 *NOVO PEDIDO - ${config.storeName.toUpperCase()}* 🥬
━━━━━━━━━━━━━━━━━━━━
🆔 *Pedido:* #${order.orderNumber}
👤 *Cliente:* ${order.customer.name}
📱 *Telefone:* ${order.customer.phone}

🛒 *ITENS DO PEDIDO:*
${itemsList}
${notesText}
━━━━━━━━━━━━━━━━━━━━
📦 *Subtotal:* ${formatCurrency(order.subtotal)}
🛵 *Taxa de Entrega:* ${order.customer.deliveryType === 'delivery' ? formatCurrency(order.deliveryFee) : 'Grátis (Retirada)'}
💰 *TOTAL:* *${formatCurrency(order.total)}*

💳 *Forma de Pagamento:* ${paymentText}
${deliveryText}
━━━━━━━━━━━━━━━━━━━━
Obrigado pela preferência! Aguardo a confirmação do pedido. 🙏`;

  return message;
};

export const getWhatsAppLink = (order: Order, config: StoreConfig): string => {
  const message = buildWhatsAppMessage(order, config);
  const cleanPhone = config.phoneWhatsApp.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
