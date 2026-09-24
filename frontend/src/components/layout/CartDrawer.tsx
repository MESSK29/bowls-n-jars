import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useSound } from '../../hooks/useSound';
import { LUXURY_EASE, SPRING_GENTLE } from '../../utils/motion';
import { price, FREE_SHIPPING_THRESHOLD } from '../../utils/currency';
import { useLanguage } from '../../context/LanguageContext';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeFromCart,
    getSubtotal,
    getShippingFee,
    getTotal,
    getItemCount
  } = useCartStore();

  const { playTap, playClink, playSlide } = useSound();
  const { t } = useLanguage();

  const subtotal = getSubtotal();
  const shipping = getShippingFee();
  const total = getTotal();
  const itemCount = getItemCount();

  const freeShippingThreshold = FREE_SHIPPING_THRESHOLD;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleClose = () => {
    playSlide();
    closeDrawer();
  };

  const handleCheckout = () => {
    playClink();
    closeDrawer();
    navigate('/checkout');
  };

  const handleRemove = (productId: number) => {
    playTap();
    removeFromCart(productId);
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-40 overflow-hidden">
          {/* Backdrop Blur Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: LUXURY_EASE }}
            className="absolute inset-0 bg-clay-900/50 backdrop-blur-xs"
            onClick={handleClose}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            {/* Sliding Drawer Panel with Spring Physics */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={SPRING_GENTLE}
              className="w-screen max-w-md bg-cream-100 shadow-2xl flex flex-col border-l border-sand-300 relative z-50 h-full"
            >
              
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-sand-200 flex items-center justify-between bg-cream-200">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-terracotta-600" />
                  <h2 className="font-heading text-lg font-bold text-clay-900">
                    {t('cart.your_bag', 'Your Basket')} ({itemCount})
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="min-w-[44px] min-h-[44px] p-2 rounded-full text-clay-400 hover:text-clay-800 hover:bg-sand-200 transition-colors flex items-center justify-center"
                  aria-label="Close basket"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Meter */}
              <div className="bg-sand-100 p-4 border-b border-sand-200">
                <div className="flex items-center justify-between text-xs font-medium text-clay-700 mb-1.5">
                  <span className="flex items-center space-x-1.5">
                    <Truck className="w-4 h-4 text-terracotta-500" />
                    {remainingForFreeShipping > 0 ? (
                      <span>
                        Add <strong className="text-terracotta-600 font-semibold">{price(remainingForFreeShipping)}</strong> more for <strong>FREE Shipping</strong>!
                      </span>
                    ) : (
                      <span className="text-sage-700 font-semibold flex items-center space-x-1">
                        <span>🎉 You unlocked Free Carbon-Neutral Shipping!</span>
                      </span>
                    )}
                  </span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full bg-sand-300 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-terracotta-400 to-terracotta-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, ease: LUXURY_EASE }}
                  />
                </div>
              </div>

              {/* Cart Item List */}
              <div className="flex-1 overflow-y-auto p-5 divide-y divide-sand-200">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-sand-200 flex items-center justify-center text-3xl">
                      🥣
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-clay-800">
                        {t('cart.empty', 'Your basket is empty')}
                      </h3>
                      <p className="text-xs text-clay-500 mt-1 max-w-xs">
                        {t('home.curated_sub', 'Explore our collection of hand-thrown ceramics and mindful workspace essentials.')}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        handleClose();
                        navigate('/shop');
                      }}
                      className="px-6 py-2.5 bg-terracotta-500 hover:bg-terracotta-600 active:scale-95 text-white rounded-full text-xs font-semibold shadow-warm-sm transition-all"
                    >
                      {t('hero.cta_shop', 'Explore Collection')}
                    </button>
                  </div>
                ) : (
                  items.map(({ product, quantity, selectedColor }) => (
                    <div key={`${product.id}-${selectedColor}`} className="py-4 flex space-x-4 first:pt-0">
                      <img
                        src={product.images[0] || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=300&auto=format&fit=crop'}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-2xl border border-sand-300 bg-sand-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-semibold text-clay-900 truncate pr-2">
                              {product.name}
                            </h4>
                            <button
                              onClick={() => handleRemove(product.id)}
                              className="text-clay-400 hover:text-red-600 transition-colors p-0.5"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-clay-500 mt-0.5">
                            {product.material} {product.color && `• ${product.color}`}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity Controller with Touch-Friendly Targets */}
                          <div className="flex items-center border border-sand-300 rounded-xl bg-white overflow-hidden shadow-xs">
                            <button
                              onClick={() => {
                                playTap();
                                updateQuantity(product.id, quantity - 1);
                              }}
                              className="min-w-[36px] min-h-[36px] p-2 text-clay-600 hover:bg-sand-100 transition-colors flex items-center justify-center active:bg-sand-200"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-semibold text-clay-800 min-w-[28px] text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => {
                                playTap();
                                updateQuantity(product.id, quantity + 1);
                              }}
                              className="min-w-[36px] min-h-[36px] p-2 text-clay-600 hover:bg-sand-100 transition-colors flex items-center justify-center active:bg-sand-200"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Price */}
                          <span className="text-sm font-semibold text-clay-900">
                            {price(product.price * quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer & Checkout */}
              {items.length > 0 && (
                <div className="p-5 bg-white border-t border-sand-200 space-y-3 shadow-lg">
                  <div className="space-y-1.5 text-xs text-clay-600">
                    <div className="flex justify-between">
                      <span>{t('cart.subtotal', 'Subtotal')}</span>
                      <span className="font-semibold text-clay-800">{price(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('cart.shipping', 'Shipping')}</span>
                      <span className="font-semibold text-clay-800">
                        {shipping === 0 ? <span className="text-sage-700">{t('cart.free_shipping', 'FREE')}</span> : price(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-clay-900 pt-2 border-t border-sand-100">
                      <span>Estimated Total</span>
                      <span className="text-terracotta-600">{price(total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-3.5 bg-terracotta-500 hover:bg-terracotta-600 active:scale-[0.99] text-white rounded-2xl font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-warm-md hover:shadow-warm-lg"
                  >
                    <span>{t('cart.checkout_btn', 'Proceed to Checkout')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleClose}
                    className="w-full text-center text-xs text-clay-500 hover:text-clay-800 py-1 transition-colors"
                  >
                    Or Continue Shopping
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
