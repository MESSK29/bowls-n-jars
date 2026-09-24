import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../../types';
import { RatingStars } from '../common/RatingStars';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useSound } from '../../hooks/useSound';
import { useFlyingCart } from '../common/FlyingCartThumbnail';
import { useToast } from '../common/Toast';
import { LUXURY_EASE } from '../../utils/motion';
import { price, savings } from '../../utils/currency';
import { useLanguage } from '../../context/LanguageContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { addToCart } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { playTap, playClink } = useSound();
  const { triggerFlyToCart } = useFlyingCart();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    playClink();
    if (cardRef.current) {
      triggerFlyToCart(product.images[0] || '', cardRef.current);
    }
    addToCart(product, 1);
    setAdded(true);

    showToast({
      title: t('product.added', 'Added!'),
      description: `${product.name} has been added.`,
      type: 'success',
      duration: 3000,
    });

    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playTap();
    toggleWishlist(product);
  };

  const primaryImage = product.images[0] || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=600&auto=format&fit=crop';
  const secondaryImage = product.images[1] || primaryImage;

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: LUXURY_EASE }}
      className="group relative bg-white rounded-3xl p-3 border border-sand-200 hover:border-sand-300 shadow-warm-sm hover:shadow-warm-md transition-all duration-300 flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Crossfade & Badges */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-sand-100 mb-3">
        <Link to={`/product/${product.slug}`} onClick={playTap} className="block w-full h-full relative">
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-out group-hover:scale-105 ${
              isHovered && secondaryImage !== primaryImage ? 'opacity-0' : 'opacity-100'
            }`}
          />
          {secondaryImage !== primaryImage && (
            <img
              src={secondaryImage}
              alt={`${product.name} alternate view`}
              loading="lazy"
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-out group-hover:scale-105 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none">
          {product.is_bestseller && (
            <span className="px-2.5 py-1 bg-terracotta-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm">
              Bestseller
            </span>
          )}
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="px-2 py-0.5 bg-sage-600 text-white text-[10px] font-bold rounded-lg shadow-sm">
              {savings(product.compare_at_price, product.price)}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-sm ${
            isFavorited
              ? 'bg-red-50 text-red-500 scale-105'
              : 'bg-white/80 text-clay-600 hover:text-red-500 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Quick Add Overlay on desktop hover */}
        <div className="absolute bottom-2.5 inset-x-2.5 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleAddToCart}
            className={`w-full py-2.5 rounded-xl font-medium text-xs flex items-center justify-center space-x-1.5 shadow-warm-md transition-all relative overflow-hidden ${
              added
                ? 'bg-sage-600 text-white'
                : 'bg-clay-900/90 hover:bg-clay-900 text-cream-50 backdrop-blur-md active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{t('product.added', 'Added!')}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-terracotta-300" />
                <span>{t('product.add_to_cart', 'Quick Add')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between px-1">
        <div>
          {/* Material & Signature Finish */}
          <div className="flex items-center justify-between text-xs text-clay-400 mb-1">
            <span className="uppercase tracking-wider font-medium text-[10px]">
              {product.material || 'Artisanal Ceramic'}
            </span>
            {product.color && (
              <span className="text-[11px] text-clay-600 font-medium">
                {product.color}
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link
            to={`/product/${product.slug}`}
            onClick={playTap}
            className="block group-hover:text-terracotta-600 transition-colors"
          >
            <h3 className="font-heading text-base font-semibold text-clay-900 line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="mt-1.5">
            <RatingStars rating={product.rating} reviewCount={product.review_count} size="sm" />
          </div>
        </div>

        {/* Price & Mobile Add Button */}
        <div className="mt-3 pt-3 border-t border-sand-100 flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-base font-bold text-clay-900">
              {price(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xs text-clay-400 line-through">
                {price(product.compare_at_price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="sm:hidden p-2 rounded-xl bg-terracotta-500 active:scale-95 text-white"
            aria-label="Add to basket"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
