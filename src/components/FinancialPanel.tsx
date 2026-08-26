import React, { useState, useMemo } from 'react';
import {
  BarChart3, CalendarDays, TrendingUp, DollarSign, ShoppingBag,
  Trash2, AlertTriangle, CreditCard, MapPin, Package, ChevronDown,
  ChevronUp, Filter, X
} from 'lucide-react';
import { Order } from '../types';
import { formatCurrency } from '../utils/formatters';

interface FinancialPanelProps {
  orders: Order[];
  onClearArchived: () => void;
  onClearAll: () => void;
}

type PeriodType = 'today' | 'week' | 'month' | 'custom';

const PAYMENT_LABELS: Record<string, string> = {
  pix: 'PIX',
  card_delivery: 'Cartão',
  cash: 'Dinheiro'
};

const PAYMENT_COLORS: Record<string, string> = {
  pix: 'bg-emerald-500',
  card_delivery: 'bg-blue-500',
  cash: 'bg-amber-500'
};

export const FinancialPanel: React.FC<FinancialPanelProps> = ({ orders, onClearArchived, onClearAll }) => {
  const [period, setPeriod] = useState<PeriodType>('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<'archived' | 'all' | null>(null);

  // --- Filter orders by selected period ---
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(order => {
      const d = new Date(order.createdAt);
      if (period === 'today') {
        return d.toDateString() === now.toDateString();
      } else if (period === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 6);
        weekAgo.setHours(0, 0, 0, 0);
        return d >= weekAgo;
      } else if (period === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      } else if (period === 'custom' && customFrom && customTo) {
        const from = new Date(customFrom + 'T00:00:00');
        const to = new Date(customTo + 'T23:59:59');
        return d >= from && d <= to;
      }
      return true;
    });
  }, [orders, period, customFrom, customTo]);

  const validOrders = useMemo(() => filteredOrders.filter(o => o.status !== 'cancelled'), [filteredOrders]);
  const cancelledOrders = useMemo(() => filteredOrders.filter(o => o.status === 'cancelled'), [filteredOrders]);

  const totalRevenue = useMemo(() => validOrders.reduce((s, o) => s + o.total, 0), [validOrders]);
  const totalDeliveryFees = useMemo(() => validOrders.reduce((s, o) => s + (o.deliveryFee || 0), 0), [validOrders]);
  const avgTicket = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;
  const totalCancelled = useMemo(() => cancelledOrders.reduce((s, o) => s + o.total, 0), [cancelledOrders]);

  // --- 7-day chart data ---
  const chartData = useMemo(() => {
    const days: { label: string; dateKey: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toDateString();
      const label = i === 0 ? 'Hoje' : d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
      const revenue = orders
        .filter(o => o.status !== 'cancelled' && new Date(o.createdAt).toDateString() === dateKey)
        .reduce((s, o) => s + o.total, 0);
      days.push({ label, dateKey, revenue });
    }
    return days;
  }, [orders]);

  const maxChartRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  // --- Payment breakdown ---
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    validOrders.forEach(o => {
      const pm = o.paymentMethod || 'pix';
      if (!map[pm]) map[pm] = { count: 0, total: 0 };
      map[pm].count++;
      map[pm].total += o.total;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [validOrders]);

  // --- Top neighborhoods ---
  const topNeighborhoods = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    validOrders.forEach(o => {
      const bairro = o.customer.neighborhood || 'Não informado';
      if (!map[bairro]) map[bairro] = { count: 0, total: 0 };
      map[bairro].count++;
      map[bairro].total += o.total;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total).slice(0, 5);
  }, [validOrders]);

  // --- Top products ---
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; qty: number; total: number }> = {};
    validOrders.forEach(o => {
      (o.items || []).forEach(item => {
        const id = item.product.id;
        if (!map[id]) map[id] = { name: item.product.name, qty: 0, total: 0 };
        map[id].qty += item.quantity;
        map[id].total += item.itemTotal;
      });
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total).slice(0, 5);
  }, [validOrders]);

  // --- Daily history ---
  const dailyHistory = useMemo(() => {
    const map: Record<string, Order[]> = {};
    orders.filter(o => o.status !== 'cancelled').forEach(o => {
      const key = new Date(o.createdAt).toLocaleDateString('pt-BR');
      if (!map[key]) map[key] = [];
      map[key].push(o);
    });
    return (Object.entries(map) as [string, Order[]][]).sort((a, b) =>
      new Date(b[1][0].createdAt).getTime() - new Date(a[1][0].createdAt).getTime()
    );
  }, [orders]);

  const archivedCount = orders.filter(o => o.archived).length;

  const periodLabels: Record<PeriodType, string> = {
    today: 'Hoje',
    week: 'Últimos 7 dias',
    month: 'Este mês',
    custom: 'Personalizado'
  };

  return (
    <div className="space-y-5 pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-heading font-extrabold text-lg text-stone-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-700" />
            Gestão Financeira Completa
          </h3>
          <p className="text-xs text-stone-500">Análise de faturamento, pedidos e métricas operacionais.</p>
        </div>

        {/* Clear History Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowClearConfirm('archived')}
            disabled={archivedCount === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Apagar Histórico Arquivado ({archivedCount})
          </button>
          <button
            type="button"
            onClick={() => setShowClearConfirm('all')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Apagar Tudo
          </button>
        </div>
      </div>

      {/* Clear confirm modal */}
      {showClearConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-red-900">
                {showClearConfirm === 'archived'
                  ? `Confirmar exclusão de ${archivedCount} pedidos arquivados?`
                  : 'Confirmar exclusão de TODOS os pedidos?'}
              </p>
              <p className="text-xs text-red-600 mt-0.5">Esta ação não pode ser desfeita.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowClearConfirm(null)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-stone-200 text-stone-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                if (showClearConfirm === 'archived') onClearArchived();
                else onClearAll();
                setShowClearConfirm(null);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700"
            >
              Confirmar Exclusão
            </button>
          </div>
        </div>
      )}

      {/* Period Filter */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-stone-700">
          <Filter className="w-4 h-4" /> Filtrar por período
        </div>
        <div className="flex flex-wrap gap-2">
          {(['today', 'week', 'month', 'custom'] as PeriodType[]).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === p ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
        {period === 'custom' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500 font-semibold">De:</label>
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                className="border border-stone-200 rounded-xl px-2 py-1.5 text-xs bg-stone-50" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500 font-semibold">Até:</label>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                className="border border-stone-200 rounded-xl px-2 py-1.5 text-xs bg-stone-50" />
            </div>
            {(customFrom || customTo) && (
              <button type="button" onClick={() => { setCustomFrom(''); setCustomTo(''); }}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-emerald-800 text-white rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-emerald-200 text-xs font-semibold">
            <span>Faturamento</span><DollarSign className="w-4 h-4" />
          </div>
          <p className="font-heading font-black text-2xl">{formatCurrency(totalRevenue)}</p>
          <p className="text-[10px] text-emerald-300">{validOrders.length} pedidos válidos</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Ticket Médio</span><TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-heading font-black text-2xl text-stone-900">{formatCurrency(avgTicket)}</p>
          <p className="text-[10px] text-stone-400">Por pedido válido</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Taxas de Entrega</span><ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-heading font-black text-2xl text-stone-900">{formatCurrency(totalDeliveryFees)}</p>
          <p className="text-[10px] text-stone-400">Total arrecadado em frete</p>
        </div>
        <div className="bg-white border border-red-100 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Cancelados</span><X className="w-4 h-4 text-red-400" />
          </div>
          <p className="font-heading font-black text-2xl text-red-600">{formatCurrency(totalCancelled)}</p>
          <p className="text-[10px] text-stone-400">{cancelledOrders.length} pedidos cancelados</p>
        </div>
      </div>

      {/* Bar Chart — last 7 days */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3">
        <h4 className="font-heading font-bold text-sm text-stone-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-700" /> Faturamento — Últimos 7 dias
        </h4>
        <div className="flex items-end gap-2 h-28">
          {chartData.map(day => {
            const heightPct = maxChartRevenue > 0 ? (day.revenue / maxChartRevenue) * 100 : 0;
            const isToday = day.label === 'Hoje';
            return (
              <div key={day.dateKey} className="flex flex-col items-center flex-1 gap-1 h-full justify-end group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] rounded-lg px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {formatCurrency(day.revenue)}
                </div>
                <div
                  className={`w-full rounded-t-lg transition-all ${isToday ? 'bg-emerald-600' : 'bg-emerald-200'}`}
                  style={{ height: `${Math.max(heightPct, day.revenue > 0 ? 4 : 0)}%` }}
                />
                <span className={`text-[9px] font-semibold ${isToday ? 'text-emerald-700' : 'text-stone-400'} text-center`}>
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
        {chartData.every(d => d.revenue === 0) && (
          <p className="text-center text-xs text-stone-400">Nenhum faturamento nos últimos 7 dias.</p>
        )}
      </div>

      {/* Payment + Neighborhoods + Products — 3 columns on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Payment Breakdown */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3">
          <h4 className="font-heading font-bold text-sm text-stone-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-700" /> Formas de Pagamento
          </h4>
          {paymentBreakdown.length === 0
            ? <p className="text-xs text-stone-400 text-center py-4">Sem dados no período.</p>
            : paymentBreakdown.map(([pm, data]) => {
              const pct = totalRevenue > 0 ? Math.round((data.total / totalRevenue) * 100) : 0;
              return (
                <div key={pm} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${PAYMENT_COLORS[pm] || 'bg-stone-400'}`} />
                      {PAYMENT_LABELS[pm] || pm}
                    </span>
                    <span className="text-stone-500">{data.count} pedidos · {formatCurrency(data.total)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className={`h-full ${PAYMENT_COLORS[pm] || 'bg-stone-400'} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
        </div>

        {/* Top Neighborhoods */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3">
          <h4 className="font-heading font-bold text-sm text-stone-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700" /> Top Bairros
          </h4>
          {topNeighborhoods.length === 0
            ? <p className="text-xs text-stone-400 text-center py-4">Sem dados no período.</p>
            : topNeighborhoods.map(([bairro, data], idx) => (
              <div key={bairro} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-stone-700 font-semibold">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-[10px]">{idx + 1}</span>
                  {bairro}
                </span>
                <span className="text-stone-500 text-right">
                  <span className="font-bold text-emerald-800">{formatCurrency(data.total)}</span>
                  <span className="block text-stone-400">{data.count} pedidos</span>
                </span>
              </div>
            ))}
        </div>

        {/* Top Products */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3">
          <h4 className="font-heading font-bold text-sm text-stone-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-700" /> Produtos mais Pedidos
          </h4>
          {topProducts.length === 0
            ? <p className="text-xs text-stone-400 text-center py-4">Sem dados no período.</p>
            : topProducts.map(([, data], idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-stone-700 font-semibold min-w-0">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-black text-[10px] flex-shrink-0">{idx + 1}</span>
                  <span className="truncate">{data.name}</span>
                </span>
                <span className="text-stone-500 text-right flex-shrink-0 ml-2">
                  <span className="font-bold text-emerald-800">{formatCurrency(data.total)}</span>
                  <span className="block text-stone-400">{data.qty.toFixed(1)} un/kg</span>
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Daily History */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-emerald-700" />
          <strong className="text-sm text-stone-900">Histórico Completo por Dia</strong>
          <span className="ml-auto text-xs text-stone-400">{dailyHistory.length} dia(s) com faturamento</span>
        </div>

        {dailyHistory.length === 0
          ? <p className="text-center text-xs text-stone-400 p-8">Nenhum pedido registrado.</p>
          : dailyHistory.map(([date, dayOrders]) => {
            const dayRevenue = dayOrders.reduce((s, o) => s + o.total, 0);
            const dayFees = dayOrders.reduce((s, o) => s + (o.deliveryFee || 0), 0);
            const daySubtotal = dayOrders.reduce((s, o) => s + (o.subtotal || 0), 0);
            const isExpanded = expandedDay === date;
            return (
              <div key={date} className="border-b border-stone-100 last:border-0">
                {/* Day row */}
                <button
                  type="button"
                  onClick={() => setExpandedDay(isExpanded ? null : date)}
                  className="w-full flex items-center justify-between p-3 hover:bg-stone-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                    <span className="font-bold text-stone-700 text-sm">{date}</span>
                    <span className="text-xs text-stone-400">{dayOrders.length} pedidos</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-stone-400 hidden sm:block">Subtotal: <strong className="text-stone-600">{formatCurrency(daySubtotal)}</strong></span>
                    <span className="text-stone-400 hidden sm:block">Frete: <strong className="text-stone-600">{formatCurrency(dayFees)}</strong></span>
                    <strong className="text-emerald-800 text-sm">{formatCurrency(dayRevenue)}</strong>
                  </div>
                </button>

                {/* Expanded orders list */}
                {isExpanded && (
                  <div className="border-t border-stone-100 bg-stone-50">
                    <div className="grid grid-cols-4 text-[10px] font-bold text-stone-400 uppercase tracking-wider px-4 py-2">
                      <span>Pedido</span><span>Cliente</span><span>Pagamento</span><span className="text-right">Total</span>
                    </div>
                    {dayOrders.map(order => (
                      <div key={order.id} className="grid grid-cols-4 items-center px-4 py-2 border-t border-stone-100 text-xs">
                        <span className="font-bold text-stone-700">#{order.orderNumber}</span>
                        <span className="text-stone-600 truncate">{order.customer.name}</span>
                        <span className="text-stone-500">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</span>
                        <span className="text-right font-bold text-emerald-800">{formatCurrency(order.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>

    </div>
  );
};
