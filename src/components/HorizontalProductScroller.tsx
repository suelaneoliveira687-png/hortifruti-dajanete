import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Plus, Check, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';

interface HorizontalProductScrollerProps {
  title: string;
  subtitle?: string;
  icon?: string | React.ReactNode;
  products: Product[];
  onAddToCart: (product: Product, quantity: number, notes?: string) => void;
  cartQtyMap: Record<string, number>;
  badgeText?: string;
  badgeColor?: string;
}

export const HorizontalProductScroller: React.FC<HorizontalProductScrollerProps> = ({
  title,
  subtitle,
  icon = '🔥',
  products,
  onAddToCart,
  cartQtyMap,
  badgeText,
  badgeColor = 'bg-[#D92338]'
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [products]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = 200;
      const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const min = product.minQty || (product.unit === 'kg' ? 0.5 : 1);
    onAddToCart(product, min);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1200);
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="space-y-2.5 sm:space-y-3 py-1">
      {/* Header with Title & Desktop Navigation Arrows */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          {typeof icon === 'string' ? (
            <span className="text-lg sm:text-xl">{icon}</span>
          ) : (
            icon
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-[#38302B] text-sm sm:text-lg">
                {title}
              </h3>
              {badgeText && (
                <span className={`text-[10px] font-black text-white px-2 py-0.2 rounded-full shadow-2xs ${badgeColor}`}>
                  {badgeText}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-stone-500 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Scroll Control Buttons (Desktop) & Swipe hint (Mobile) */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-stone-400 font-semibold sm:hidden flex items-center gap-0.5">
            Deslize para ver mais 👉
          </span>
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={`w-7 h-7 rounded-full border flex items-center justify-center transition cursor-pointer ${
                canScrollLeft 
                  ? 'bg-white text-[#38302B] border-[#EAE3D9] hover:bg-[#FAF8F5] shadow-xs' 
                  : 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed opacity-50'
              }`}
              title="Rolar para esquerda"
              aria-label="Rolar para a esquerda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={`w-7 h-7 rounded-full border flex items-center justify-center transition cursor-pointer ${
                canScrollRight 
                  ? 'bg-white text-[#38302B] border-[#EAE3D9] hover:bg-[#FAF8F5] shadow-xs' 
                  : 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed opacity-50'
              }`}
              title="Rolar para direita"
              aria-label="Rolar para a direita"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div className="relative group/track">
        {/* Left Gradient on Scroll */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#FAF8F5] to-transparent z-10 pointer-events-none rounded-l-2xl" />
        )}

        {/* Right Gradient on Scroll */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#FAF8F5] to-transparent z-10 pointer-events-none rounded-r-2xl" />
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-stretch gap-2.5 sm:gap-3.5 overflow-x-auto snap-x scroll-smooth touch-pan-x scrollbar-none pb-2 pt-0.5 px-0.5 -mx-1 sm:mx-0 overscroll-x-contain"
        >
          {products.map((product) => {
            const inCart = cartQtyMap[product.id] || 0;
            const isJustAdded = addedProductId === product.id;

            return (
              <div
                key={product.id}
                className={`w-[150px] xs:w-[170px] sm:w-[200px] flex-shrink-0 snap-start bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  product.inStock
                    ? 'border-[#EAE3D9] hover:border-[#C5A059]'
                    : 'border-[#EAE3D9]/60 opacity-70'
                }`}
              >
                {/* Product Image */}
                <div>
                  <div className="relative h-28 xs:h-32 sm:h-36 w-full overflow-hidden bg-[#FAF8F5]">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badge */}
                    {product.badge && (
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-extrabold bg-[#D92338] text-white px-1.5 py-0.2 rounded-full shadow-xs truncate max-w-[80%]">
                        {product.badge}
                      </span>
                    )}

                    {/* Stock Alert */}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-[#38302B]/70 backdrop-blur-[2px] flex items-center justify-center p-1">
                        <span className="bg-[#D92338] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Esgotado
                        </span>
                      </div>
                    )}

                    {/* In Cart Indicator */}
                    {inCart > 0 && (
                      <div className="absolute top-1.5 right-1.5 bg-[#285336] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5 border border-white/20">
                        <ShoppingBag className="w-2.5 h-2.5 text-[#F5C518]" />
                        <span>{inCart} {product.unit}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2.5 sm:p-3">
                    <h4 className="font-heading font-extrabold text-[#38302B] text-xs sm:text-sm leading-snug line-clamp-1 group-hover:text-[#D92338] transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-stone-500 text-[10px] sm:text-[11px] line-clamp-1 mt-0.5 font-medium">
                      {product.description}
                    </p>

                    {/* Price & Unit */}
                    <div className="mt-1.5 flex items-baseline gap-1">
                      <span className="text-[#285336] font-black text-xs sm:text-base font-heading">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-stone-400 text-[9px] sm:text-[10px] font-medium">
                        /{product.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Add Button */}
                <div className="p-2.5 pt-0 sm:p-3 sm:pt-0">
                  {product.inStock ? (
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(product, e)}
                      className={`w-full min-h-[34px] py-1.5 px-2 rounded-xl text-[11px] sm:text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer touch-manipulation active:scale-95 ${
                        isJustAdded
                          ? 'bg-[#285336] text-white shadow-xs'
                          : 'bg-[#FAF8F5] text-[#285336] hover:bg-[#285336] hover:text-white border border-[#EAE3D9]'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-amber-300" />
                          <span>Adicionado!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full min-h-[34px] py-1.5 px-2 rounded-xl text-[10px] font-bold bg-stone-100 text-stone-400 cursor-not-allowed text-center"
                    >
                      Indisponível
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
