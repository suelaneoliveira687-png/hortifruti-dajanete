import React, { useState } from 'react';
import { Plus, Minus, Check, ShoppingBag, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency, resolveProductImageUrl, handleProductImageError } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number, notes?: string) => void;
  currentInCartQty?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  currentInCartQty = 0
}) => {
  const step = product.stepQty || (product.unit === 'kg' ? 0.5 : 1);
  const min = product.minQty || step;
  const [qty, setQty] = useState<number>(min);
  const [isAdded, setIsAdded] = useState(false);

  // Check if this product is the Maxixe & Quiabo combo
  const isMaxixeQuiaboCombo = 
    product.id === 'l-11' || 
    (product.name.toLowerCase().includes('maxixe') && product.name.toLowerCase().includes('quiabo'));

  const [comboChoice, setComboChoice] = useState<'misto' | 'maxixe' | 'quiabo' | 'custom'>('misto');
  const [customProportion, setCustomProportion] = useState('');

  const handleIncrement = () => {
    setQty(prev => Number((prev + step).toFixed(2)));
  };

  const handleDecrement = () => {
    setQty(prev => {
      const next = Number((prev - step).toFixed(2));
      return next >= min ? next : min;
    });
  };

  const getComboNotes = (): string | undefined => {
    if (!isMaxixeQuiaboCombo) return undefined;
    if (comboChoice === 'misto') return 'Meio a Meio (Misto: ~8 Maxixes e ~7 Quiabos)';
    if (comboChoice === 'maxixe') return 'Apenas Maxixe (15 unidades)';
    if (comboChoice === 'quiabo') return 'Apenas Quiabo (15 unidades)';
    if (comboChoice === 'custom') {
      return customProportion.trim() 
        ? `Personalizado: ${customProportion.trim()}` 
        : 'Meio a Meio (Misto: ~8 Maxixes e ~7 Quiabos)';
    }
    return undefined;
  };

  const handleAdd = () => {
    const notes = getComboNotes();
    onAddToCart(product, qty, notes);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const calculatedSubtotal = Number((product.price * qty).toFixed(2));

  return (
    <div className={`group relative bg-white rounded-2xl sm:rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
      product.inStock 
        ? 'border-[#EAE3D9] hover:border-[#C5A059]' 
        : 'border-[#EAE3D9]/60 opacity-70'
    }`}>
      
      {/* Top Image & Badges */}
      <div>
        <div className="relative h-36 xs:h-40 sm:h-48 w-full overflow-hidden bg-[#FAF8F5]">
          <img
            src={resolveProductImageUrl(product.image)}
            data-original-src={product.image}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => handleProductImageError(e, product.image)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 items-start max-w-[80%]">
            {product.badge && (
              <span className="text-[9px] sm:text-[10px] font-extrabold bg-[#D92338] text-white px-2 py-0.5 rounded-full shadow-xs truncate">
                {product.badge}
              </span>
            )}
            {product.category === 'kits' && (
              <span className="text-[9px] sm:text-[10px] font-extrabold bg-[#F5C518] text-[#38302B] px-2 py-0.5 rounded-full shadow-xs truncate">
                Combo Especial
              </span>
            )}
            {isMaxixeQuiaboCombo && (
              <span className="text-[9px] sm:text-[10px] font-extrabold bg-[#285336] text-amber-200 px-2 py-0.5 rounded-full shadow-xs truncate flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Escolha sua porção
              </span>
            )}
          </div>

          {!product.inStock && (
            <div className="absolute inset-0 bg-[#38302B]/70 backdrop-blur-[2px] flex items-center justify-center p-2">
              <span className="bg-[#D92338] text-white text-[10px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-wider shadow-md">
                Esgotado
              </span>
            </div>
          )}

          {currentInCartQty > 0 && (
            <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 bg-[#285336] text-white text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-white/20">
              <ShoppingBag className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#F5C518]" />
              <span>{currentInCartQty} {product.unit}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="font-heading font-extrabold text-[#38302B] text-xs sm:text-base leading-snug group-hover:text-[#D92338] transition-colors line-clamp-1 sm:line-clamp-2">
              {product.name}
            </h3>
          </div>

          <p className="text-stone-500 text-[11px] sm:text-xs mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2 leading-relaxed font-medium">
            {product.description}
          </p>

          {/* Price */}
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1">
            <span className="text-[#285336] font-black text-sm sm:text-lg font-heading">
              {formatCurrency(product.price)}
            </span>
            <span className="text-stone-400 text-[10px] sm:text-xs font-medium">
              /{product.unit}
            </span>
          </div>

          {/* SELETOR DE ESCOLHA EXCLUSIVO: MAXIXE E QUIABO */}
          {isMaxixeQuiaboCombo && product.inStock && (
            <div className="mt-2.5 pt-2 border-t border-[#EAE3D9] space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-extrabold text-[#285336] flex items-center justify-between">
                <span>Como prefere sua porção?</span>
                <span className="text-[9px] font-medium text-stone-500">(15 unidades)</span>
              </label>

              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => setComboChoice('misto')}
                  className={`py-1 px-1 rounded-lg text-[10px] sm:text-[11px] font-bold border transition-all text-center leading-tight touch-manipulation cursor-pointer ${
                    comboChoice === 'misto'
                      ? 'bg-[#285336] text-white border-[#285336] shadow-xs'
                      : 'bg-[#F8F5F1] text-stone-700 border-[#EAE3D9] hover:bg-[#EAE3D9]'
                  }`}
                  title="Meio a Meio: ~8 Maxixes e ~7 Quiabos"
                >
                  Meio a Meio
                </button>

                <button
                  type="button"
                  onClick={() => setComboChoice('maxixe')}
                  className={`py-1 px-1 rounded-lg text-[10px] sm:text-[11px] font-bold border transition-all text-center leading-tight touch-manipulation cursor-pointer ${
                    comboChoice === 'maxixe'
                      ? 'bg-[#285336] text-white border-[#285336] shadow-xs'
                      : 'bg-[#F8F5F1] text-stone-700 border-[#EAE3D9] hover:bg-[#EAE3D9]'
                  }`}
                  title="15 unidades de Maxixe"
                >
                  Só Maxixe
                </button>

                <button
                  type="button"
                  onClick={() => setComboChoice('quiabo')}
                  className={`py-1 px-1 rounded-lg text-[10px] sm:text-[11px] font-bold border transition-all text-center leading-tight touch-manipulation cursor-pointer ${
                    comboChoice === 'quiabo'
                      ? 'bg-[#285336] text-white border-[#285336] shadow-xs'
                      : 'bg-[#F8F5F1] text-stone-700 border-[#EAE3D9] hover:bg-[#EAE3D9]'
                  }`}
                  title="15 unidades de Quiabo"
                >
                  Só Quiabo
                </button>
              </div>

              {/* Botão para proporção personalizada */}
              <div className="flex items-center justify-between pt-0.5">
                <button
                  type="button"
                  onClick={() => setComboChoice(comboChoice === 'custom' ? 'misto' : 'custom')}
                  className="text-[10px] text-stone-500 hover:text-[#285336] font-semibold underline underline-offset-2 touch-manipulation"
                >
                  {comboChoice === 'custom' ? '← Voltar às opções' : '+ Outra proporção'}
                </button>
                <span className="text-[9px] text-stone-400">
                  {comboChoice === 'misto' && '🥒 ~8 Maxixes + 7 Quiabos'}
                  {comboChoice === 'maxixe' && '🥒 15 Maxixes'}
                  {comboChoice === 'quiabo' && '🌿 15 Quiabos'}
                </span>
              </div>

              {comboChoice === 'custom' && (
                <div className="pt-1">
                  <input
                    type="text"
                    value={customProportion}
                    onChange={(e) => setCustomProportion(e.target.value)}
                    placeholder="Ex: 10 maxixes e 5 quiabos..."
                    className="w-full bg-[#FAF8F5] border border-[#C5A059] rounded-lg px-2 py-1 text-[11px] text-[#38302B] focus:outline-none focus:ring-1 focus:ring-[#285336]"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer & Add Controls */}
      <div className="p-3 sm:p-4 pt-0">
        {product.inStock ? (
          <div className="space-y-1.5 sm:space-y-2">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-[#F8F5F1] border border-[#EAE3D9] rounded-xl sm:rounded-2xl p-0.5 sm:p-1">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={qty <= min}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-white border border-[#EAE3D9] text-[#38302B] flex items-center justify-center hover:bg-emerald-50 hover:text-[#285336] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-bold touch-manipulation"
                title="Diminuir quantidade"
              >
                <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>

              <span className="text-[11px] sm:text-xs font-black text-[#38302B]">
                {qty} <span className="font-medium text-stone-500 text-[10px] sm:text-xs">{product.unit}</span>
              </span>

              <button
                type="button"
                onClick={handleIncrement}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-white border border-[#EAE3D9] text-[#38302B] flex items-center justify-center hover:bg-emerald-50 hover:text-[#285336] active:scale-95 transition-all cursor-pointer font-bold touch-manipulation"
                title="Aumentar quantidade"
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAdd}
              className={`w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl sm:rounded-2xl font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer touch-manipulation ${
                isAdded
                  ? 'bg-[#244A32] text-white'
                  : 'bg-[#285336] hover:bg-[#1E3F29] text-white shadow-[#285336]/20'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F5C518]" />
                  <span className="truncate">Adicionado ({formatCurrency(calculatedSubtotal)})</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="truncate">Adicionar • {formatCurrency(calculatedSubtotal)}</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="py-1.5 sm:py-2 text-center text-stone-400 text-[11px] sm:text-xs font-medium bg-[#F8F5F1] rounded-xl sm:rounded-2xl">
            Indisponível
          </div>
        )}
      </div>

    </div>
  );
};

