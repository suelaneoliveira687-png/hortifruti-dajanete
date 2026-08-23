import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  HeartHandshake, 
  ShoppingBag, 
  X, 
  Clock, 
  Bike, 
  Store as StoreIcon, 
  Star, 
  MapPin, 
  Phone,
  ChevronLeft,
  ChevronRight,
  Flame,
  LayoutGrid,
  SlidersHorizontal
} from 'lucide-react';
import { Product, StoreConfig, CartItem } from '../types';
import { ProductCard } from './ProductCard';
import { HorizontalProductScroller } from './HorizontalProductScroller';
import { JaneteLogo } from './JaneteLogo';
import { formatCurrency } from '../utils/formatters';

interface ClientViewProps {
  products: Product[];
  config: StoreConfig;
  cartItems: CartItem[];
  onAddToCart: (product: Product, quantity: number, notes?: string) => void;
  openCart: () => void;
}

const CATEGORIES = [
  { id: 'todos', label: 'Todos os Produtos', icon: '🛒', shortLabel: 'Todos' },
  { id: 'frutas', label: 'Frutas Frescas', icon: '🍎', shortLabel: 'Frutas' },
  { id: 'verduras', label: 'Verduras & Folhas', icon: '🥬', shortLabel: 'Verduras' },
  { id: 'legumes', label: 'Legumes & Vegetais', icon: '🥕', shortLabel: 'Legumes' },
  { id: 'raizes', label: 'Raízes & Tubérculos', icon: '🥔', shortLabel: 'Raízes' },
  { id: 'temperos', label: 'Temperos & Ervas', icon: '🌿', shortLabel: 'Temperos' },
  { id: 'mercearia', label: 'Ovos & Mercearia', icon: '🥚', shortLabel: 'Mercearia' },
  { id: 'kits', label: 'Combos & Especiais', icon: '🎁', shortLabel: 'Combos' }
];

export const ClientView: React.FC<ClientViewProps> = ({
  products,
  config,
  cartItems,
  onAddToCart,
  openCart
}) => {
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const storiesScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll positions for arrows and gradient hints
  const checkScroll = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [products]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const amount = direction === 'left' ? -220 : 220;
      categoryScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (catId: string, buttonElement?: HTMLElement | null) => {
    setSelectedCategory(catId);
    if (buttonElement) {
      buttonElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  // Product counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: products.length };
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Featured and popular products for horizontal sliders
  const featuredPopularProducts = useMemo(() => {
    return products.filter(p => p.isPopular || p.badge || p.category === 'kits' || p.price <= 5);
  }, [products]);

  const freshFruitsHighlights = useMemo(() => {
    return products.filter(p => p.category === 'frutas');
  }, [products]);

  const freshCombosHighlights = useMemo(() => {
    return products.filter(p => p.category === 'kits' || p.id === 'l-11');
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'todos' || product.category === selectedCategory;
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartValue = cartItems.reduce((acc, item) => acc + item.itemTotal, 0);

  // Quick lookup for cart quantities
  const cartQtyMap = useMemo(() => {
    const map: Record<string, number> = {};
    cartItems.forEach(item => {
      map[item.product.id] = item.quantity;
    });
    return map;
  }, [cartItems]);

  return (
    <div className="pb-28 sm:pb-16 space-y-5 sm:space-y-6">
      
      {/* Store Closed Warning */}
      {!config.isOpen && (
        <div className="bg-amber-500 text-slate-950 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛑</span>
            <div>
              <h4 className="font-heading font-extrabold text-sm sm:text-base">
                A loja está fechada no momento para novos envios imediatos
              </h4>
              <p className="text-xs text-slate-900/80">
                Você ainda pode navegar pelo cardápio, montar seu carrinho e enviar o pedido para a Janete agendar a entrega!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Welcome Banner - Hortifrúti da Janete */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#1B3826] via-[#244A32] to-[#1E3F29] text-white shadow-xl shadow-black/15 border border-[#C5A059]/40">
        
        {/* Real Documentary-Style Produce crates background photo */}
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-luminosity pointer-events-none scale-105 transition-transform duration-700" 
          style={{ backgroundImage: "url('/src/assets/images/hero_hortifruti_janete_1787333312803.jpg')" }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-r from-[#142A1D]/95 via-[#1B3826]/85 to-transparent pointer-events-none" />

        <div className="relative z-10 p-3.5 sm:p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-6">
          <div className="flex items-center sm:items-start md:items-center gap-3 sm:gap-5 min-w-0">
            {/* Prominent Single Logo Emblem in Hero - APENAS EM DESKTOP (NO MOBILE FICA SOMENTE NO CABEÇALHO/HEADER) */}
            <div className="hidden sm:flex sm:w-20 sm:h-20 md:w-24 md:h-24 p-1 bg-white rounded-full shadow-2xl border-2 border-[#C5A059] flex-shrink-0 items-center justify-center overflow-hidden">
              <JaneteLogo size="100%" className="w-full h-full" />
            </div>

            <div className="space-y-1.5 sm:space-y-3 flex-1 min-w-0">
              {/* Status Pills with Brand Colors */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-black bg-[#0E1F15]/90 text-[#3FAFA0] border border-[#3FAFA0]/40 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#3FAFA0] animate-pulse"></span> Aberto Agora
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-black bg-[#D92338]/90 text-white border border-white/20 backdrop-blur-md shadow-xs">
                  Selo de Qualidade 🍓
                </span>
              </div>

              <h1 className="font-heading font-black text-base sm:text-2xl md:text-3xl lg:text-4xl text-white tracking-tight leading-tight drop-shadow-xs">
                O Frescor da Feira na Sua Porta!
              </h1>

              <p className="text-emerald-100/95 text-xs sm:text-sm leading-relaxed max-w-lg font-medium line-clamp-2 sm:line-clamp-none">
                A Janete escolhe cada fruta, verdura e legume fresquinho a dedo, com o carinho que sua família merece.
              </p>

              {/* 3 Destaques Visuais Acolhedores */}
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold bg-white/15 text-white border border-[#C5A059]/30 backdrop-blur-md shadow-xs">
                  <span>🛵</span> Entrega no Bairro
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold bg-white/15 text-white border border-[#C5A059]/30 backdrop-blur-md shadow-xs">
                  <span>🍓</span> Escolhidos a Dedo
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold bg-white/15 text-white border border-[#C5A059]/30 backdrop-blur-md shadow-xs">
                  <span>🍋</span> WhatsApp
                </span>
              </div>

              {/* Delivery and Store Metrics */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 pt-0.5 text-[10px] sm:text-xs font-semibold text-white/90">
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl border border-white/10">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#F5C518] flex-shrink-0" />
                  <span>{config.estimatedDeliveryTime || '30-45 min'}</span>
                </div>
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl border border-white/10">
                  <Bike className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#3FAFA0] flex-shrink-0" />
                  <span>Entrega R$ {config.deliveryFee.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl border border-white/10">
                  <StoreIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C5A059] flex-shrink-0" />
                  <span>Retirada Grátis</span>
                </div>
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl border border-white/10">
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#F5C518] fill-[#F5C518] flex-shrink-0" />
                  <span className="text-[#F5C518] font-extrabold">4.9</span>
                  <span className="text-[9px] sm:text-[11px] text-white/80">(180+)</span>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Info Box */}
          <div className="hidden lg:flex flex-col bg-black/30 backdrop-blur-md border border-[#C5A059]/40 p-4 rounded-2xl text-xs space-y-2.5 max-w-xs flex-shrink-0">
            <div className="flex items-center gap-2 text-amber-200 font-bold">
              <MapPin className="w-4 h-4 text-[#F5C518]" />
              <span>Localização da Loja:</span>
            </div>
            <p className="text-white font-medium leading-tight">
              {config.addressDisplay || 'Feirinha da Jatiúca'}
            </p>
            <div className="flex items-center gap-2 text-[#3FAFA0] font-bold pt-1 border-t border-white/10">
              <Phone className="w-4 h-4 text-[#F5C518]" />
              <span>WhatsApp: {config.formattedPhone}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky Search and Category Filters */}
      <div className="space-y-2.5 sm:space-y-3 sticky top-[48px] sm:top-[65px] z-30 bg-[#FAF8F5]/95 backdrop-blur-md pt-1.5 pb-2.5">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar banana, morango, maxixe, quiabo, macaxeira..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#EAE3D9] rounded-xl sm:rounded-2xl text-[#38302B] text-base sm:text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#285336] focus:border-transparent shadow-xs transition-all touch-manipulation"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer touch-manipulation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* MOBILE CIRCULAR CATEGORY STORIES (ROLAGEM LATERAL RÁPIDA DE CATEGORIAS) */}
        <div className="sm:hidden">
          <div 
            ref={storiesScrollRef}
            className="flex items-center gap-3 overflow-x-auto py-1 px-1 scrollbar-none snap-x touch-pan-x scroll-smooth overscroll-x-contain"
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={`story-${cat.id}`}
                  type="button"
                  onClick={(e) => handleSelectCategory(cat.id, e.currentTarget)}
                  className="flex flex-col items-center gap-1 flex-shrink-0 snap-start cursor-pointer touch-manipulation active:scale-95 transition-transform"
                >
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center text-xl transition-all shadow-2xs ${
                    isActive 
                      ? 'bg-gradient-to-tr from-[#285336] to-[#3FAFA0] text-white ring-2 ring-[#285336] ring-offset-2 scale-105 shadow-md shadow-[#285336]/25' 
                      : 'bg-white border border-[#EAE3D9] text-[#38302B] hover:bg-[#FAF8F5]'
                  }`}>
                    <span>{cat.icon}</span>
                  </div>
                  <span className={`text-[10px] font-extrabold max-w-[62px] truncate text-center leading-tight ${
                    isActive ? 'text-[#285336]' : 'text-stone-600'
                  }`}>
                    {cat.shortLabel || cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CATEGORY BAR WITH SMOOTH HORIZONTAL SCROLL & CONTROLS */}
        <div className="relative group/cat">
          
          {/* Left Arrow button (visible when scrollable) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollCategories('left')}
              className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 text-[#38302B] shadow-md border border-[#EAE3D9] flex items-center justify-center hover:bg-[#FAF8F5] transition cursor-pointer hidden sm:flex touch-manipulation"
              title="Rolar para a esquerda"
              aria-label="Rolar categorias para a esquerda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Left Gradient Fade */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#FAF8F5] to-transparent z-10 pointer-events-none" />
          )}

          {/* Right Arrow button (visible when scrollable) */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollCategories('right')}
              className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 text-[#38302B] shadow-md border border-[#EAE3D9] flex items-center justify-center hover:bg-[#FAF8F5] transition cursor-pointer hidden sm:flex touch-manipulation"
              title="Rolar para a direita"
              aria-label="Rolar categorias para a direita"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Right Gradient Fade */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#FAF8F5] to-transparent z-10 pointer-events-none" />
          )}

          {/* Scrollable Track */}
          <div 
            ref={categoryScrollRef}
            onScroll={checkScroll}
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 px-1 scrollbar-none snap-x touch-pan-x scroll-smooth overscroll-x-contain"
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const count = categoryCounts[cat.id] || 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={(e) => handleSelectCategory(cat.id, e.currentTarget)}
                  className={`flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer snap-start touch-manipulation ${
                    isActive
                      ? 'bg-[#285336] text-white shadow-md shadow-[#285336]/30 ring-2 ring-[#285336] ring-offset-1'
                      : 'bg-white text-[#5C534B] border border-[#EAE3D9] hover:bg-[#F5EFEB] hover:text-[#38302B] active:scale-95'
                  }`}
                >
                  <span className="text-sm sm:text-base">{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                    isActive 
                      ? 'bg-white/25 text-white' 
                      : 'bg-stone-100 text-stone-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* HORIZONTAL PRODUCT SCROLLERS (QUANDO NAVEGANDO EM "TODOS" SEM BUSCA) */}
      {!searchQuery && selectedCategory === 'todos' && (
        <div className="space-y-4 sm:space-y-6 pt-1">
          {/* Carrossel 1: Mais Pedidos / Destaques da Janete */}
          {featuredPopularProducts.length > 0 && (
            <HorizontalProductScroller
              title="🔥 Mais Pedidos & Ofertas da Janete"
              subtitle="Os queridinhos dos nossos clientes com preços imperdíveis"
              icon="🔥"
              products={featuredPopularProducts}
              onAddToCart={onAddToCart}
              cartQtyMap={cartQtyMap}
              badgeText="Mais Vendidos"
              badgeColor="bg-[#D92338]"
            />
          )}

          {/* Carrossel 2: Combos & Especiais da Semana */}
          {freshCombosHighlights.length > 0 && (
            <HorizontalProductScroller
              title="🎁 Combos Especiais & Feira Pronta"
              subtitle="Praticidade e economia para o seu dia a dia"
              icon="🎁"
              products={freshCombosHighlights}
              onAddToCart={onAddToCart}
              cartQtyMap={cartQtyMap}
              badgeText="Economia"
              badgeColor="bg-[#285336]"
            />
          )}

          {/* Carrossel 3: Frutas Selecionadas da Estação */}
          {freshFruitsHighlights.length > 0 && (
            <HorizontalProductScroller
              title="🍎 Frutas Fresquinhas do Dia"
              subtitle="Docinhas e selecionadas a dedo para a sua família"
              icon="🍎"
              products={freshFruitsHighlights}
              onAddToCart={onAddToCart}
              cartQtyMap={cartQtyMap}
              badgeText="Frescor Total"
              badgeColor="bg-[#F5C518] text-[#38302B]"
            />
          )}
        </div>
      )}

      {/* Products Grid */}
      <div className="pt-2 sm:pt-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-[#38302B] text-base sm:text-xl">
              {selectedCategory === 'todos' && !searchQuery
                ? '🌿 Todos os Produtos do Catálogo'
                : CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Produtos'}
            </h2>
          </div>
          <span className="text-[11px] sm:text-xs text-[#5C534B] font-bold bg-[#EAE3D9]/70 px-2.5 py-0.5 sm:py-1 rounded-full">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'itens'}
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EAE3D9] p-8 sm:p-12 text-center space-y-3 shadow-xs">
            <div className="text-4xl">🔍</div>
            <h3 className="font-heading font-extrabold text-[#38302B] text-sm sm:text-base">
              Nenhum produto encontrado
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Não encontramos resultados para &quot;{searchQuery}&quot;. Tente buscar por outro termo ou escolha outra categoria.
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedCategory('todos'); }}
              className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#285336] hover:bg-[#1E3F29] px-4 py-2 rounded-xl shadow-xs transition touch-manipulation cursor-pointer"
            >
              Ver todos os produtos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                currentInCartQty={cartQtyMap[product.id]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Mobile Cart Bar (iFood style) */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-3 inset-x-3 sm:hidden z-40 pb-[env(safe-area-inset-bottom)]">
          <button
            type="button"
            onClick={openCart}
            className="w-full bg-gradient-to-r from-[#D92338] via-[#D92338] to-[#B8192C] text-white p-3 rounded-2xl shadow-xl shadow-[#D92338]/30 flex items-center justify-between font-bold text-sm active:scale-[0.98] transition-transform cursor-pointer border border-[#B8192C] touch-manipulation"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative bg-white/20 p-2 rounded-xl backdrop-blur-xs">
                <ShoppingBag className="w-5 h-5 text-amber-200" />
                <span className="absolute -top-1.5 -right-1.5 bg-[#F5C518] text-[#38302B] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {totalCartCount.toFixed(0)}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[10px] text-amber-100 font-semibold leading-none">Ver Cesta</p>
                <p className="text-xs sm:text-sm font-black leading-tight mt-0.5">Finalizar Pedido</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-heading text-sm sm:text-base font-extrabold text-white">
                {formatCurrency(totalCartValue)}
              </span>
            </div>
          </button>
        </div>
      )}

    </div>
  );
};

