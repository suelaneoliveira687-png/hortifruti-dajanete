import React from 'react';
import { ShoppingBasket, ShoppingBag, Store, Clock, Sparkles } from 'lucide-react';
import { StoreConfig } from '../types';
import { JaneteLogo } from './JaneteLogo';

interface NavbarProps {
  currentTab: 'client' | 'admin';
  setCurrentTab: (tab: 'client' | 'admin') => void;
  config: StoreConfig;
  cartCount: number;
  cartTotal: number;
  openCart: () => void;
  pendingOrdersCount: number;
  hasTrackedOrder?: boolean;
  onOpenTracker?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  config,
  cartCount,
  cartTotal,
  openCart,
  pendingOrdersCount,
  hasTrackedOrder,
  onOpenTracker
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE3D9] shadow-xs transition-all pt-[env(safe-area-inset-top)]">
      {/* Top Banner Notice */}
      <div className="bg-[#244A32] text-emerald-50 text-[11px] sm:text-xs py-1 sm:py-1.5 px-3 sm:px-4 border-b border-[#C5A059]/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1 font-bold bg-[#D92338] text-white px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] shadow-xs">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#F5C518]" /> Entrega Rápida
            </span>
            <span className="hidden sm:inline text-emerald-100/90 font-medium">
              Produtos frescos selecionados à mão toda manhã • Peça pelo WhatsApp
            </span>
            <span className="sm:hidden text-emerald-100 text-[10px] truncate max-w-[140px] font-medium">
              Colheita Fresca Diária
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-emerald-100 text-[10px] sm:text-[11px] font-semibold">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#F5C518]" /> {config.estimatedDeliveryTime}
            </span>
            <span className="hidden md:inline text-emerald-300/50">|</span>
            <span className="hidden md:inline text-amber-200">📞 {config.formattedPhone}</span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Store Info */}
          <div 
            onClick={() => setCurrentTab('client')}
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group min-w-0"
          >
            <div className="relative group-hover:scale-105 transition-transform flex-shrink-0">
              <JaneteLogo size={42} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-heading font-black text-sm sm:text-lg text-[#38302B] tracking-tight leading-none group-hover:text-[#D92338] transition-colors truncate">
                  {config.storeName}
                </h1>
                {config.isOpen ? (
                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[11px] font-extrabold bg-[#EBF7EE] text-[#285336] border border-[#285336]/20 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2FA896] animate-pulse" />
                    Aberto
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[11px] font-extrabold bg-[#FEF3C7] text-[#92400E] border border-amber-300 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518]" />
                    Fechado
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-stone-500 font-medium mt-0.5 truncate hidden xs:block">
                Frutas, Verduras & Legumes Selecionados com Amor
              </p>
            </div>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            
            {/* Botão Acompanhar Pedido Recente */}
            {hasTrackedOrder && currentTab === 'client' && (
              <button
                type="button"
                onClick={onOpenTracker}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-[#C5A059]/40 text-amber-900 text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#F5C518]" />
                <span className="hidden sm:inline">Acompanhar</span>
                <span>Pedido</span>
              </button>
            )}

            {/* Quando estiver na visualização Admin, botão para retornar ao Cardápio */}
            {currentTab === 'admin' && (
              <button
                type="button"
                onClick={() => setCurrentTab('client')}
                className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition-all touch-manipulation cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700" />
                <span>Ver Loja</span>
              </button>
            )}

            {/* Floating/Sticky Cart Button */}
            {currentTab === 'client' && (
              <button
                type="button"
                onClick={openCart}
                className="relative flex items-center gap-1.5 sm:gap-2 bg-[#D92338] hover:bg-[#B8192C] active:scale-95 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-extrabold text-xs sm:text-sm shadow-md shadow-[#D92338]/25 border border-[#B8192C] transition-all touch-manipulation cursor-pointer"
                title="Ver Carrinho de Compras"
              >
                <ShoppingBasket className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
                <span className="hidden md:inline">Carrinho</span>
                {cartCount > 0 && (
                  <>
                    <span className="bg-[#8F1221] text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md font-extrabold">
                      {cartCount}
                    </span>
                    <span className="hidden lg:inline font-black">
                      • R$ {cartTotal.toFixed(2).replace('.', ',')}
                    </span>
                  </>
                )}
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
