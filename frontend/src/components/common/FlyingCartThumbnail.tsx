import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlyingItem {
  id: string;
  imageUrl: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface FlyingCartContextType {
  triggerFlyToCart: (imageUrl: string, sourceElement: HTMLElement) => void;
  cartPulse: boolean;
}

const FlyingCartContext = createContext<FlyingCartContextType>({
  triggerFlyToCart: () => {},
  cartPulse: false,
});

export const useFlyingCart = () => useContext(FlyingCartContext);

export const FlyingCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [cartPulse, setCartPulse] = useState(false);

  const triggerFlyToCart = useCallback((imageUrl: string, sourceElement: HTMLElement) => {
    const cartButton = document.getElementById('header-cart-btn');
    if (!sourceElement || !cartButton) return;

    const sourceRect = sourceElement.getBoundingClientRect();
    const cartRect = cartButton.getBoundingClientRect();

    const startX = sourceRect.left + sourceRect.width / 2 - 24;
    const startY = sourceRect.top + sourceRect.height / 2 - 24;
    const endX = cartRect.left + cartRect.width / 2 - 16;
    const endY = cartRect.top + cartRect.height / 2 - 16;

    const id = `${Date.now()}-${Math.random()}`;

    setFlyingItems((prev) => [
      ...prev,
      { id, imageUrl, startX, startY, endX, endY },
    ]);

    // When the animation completes (~600ms), pulse the cart
    setTimeout(() => {
      setCartPulse(true);
      setTimeout(() => setCartPulse(false), 400);
      setFlyingItems((prev) => prev.filter((item) => item.id !== id));
    }, 650);
  }, []);

  return (
    <FlyingCartContext.Provider value={{ triggerFlyToCart, cartPulse }}>
      {children}

      {/* Render flying thumbnail layer */}
      <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
        <AnimatePresence>
          {flyingItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{
                x: item.startX,
                y: item.startY,
                scale: 1,
                opacity: 0.95,
                rotate: 0,
              }}
              animate={{
                x: item.endX,
                y: item.endY,
                scale: 0.25,
                opacity: 0.8,
                rotate: 15,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute top-0 left-0 w-14 h-14 rounded-2xl overflow-hidden shadow-warm-lg border-2 border-terracotta-400 bg-sand-100"
            >
              <img
                src={item.imageUrl}
                alt="Flying product"
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </FlyingCartContext.Provider>
  );
};
