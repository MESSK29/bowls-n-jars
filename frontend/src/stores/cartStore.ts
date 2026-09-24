import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from '../types';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, GST_RATE } from '../utils/currency';

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  addToCart: (product: Product, quantity?: number, selectedColor?: string) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  getSubtotal: () => number;
  getShippingFee: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addToCart: (product, quantity = 1, selectedColor) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id && item.selectedColor === selectedColor
          );
          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex].quantity += quantity;
            return { items: updated, isDrawerOpen: true };
          } else {
            return {
              items: [...state.items, { product, quantity, selectedColor }],
              isDrawerOpen: true,
            };
          }
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      getSubtotal: () => {
        const { items } = get();
        return Math.round(
          items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
        );
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
      },

      getTax: () => {
        const subtotal = get().getSubtotal();
        // GST is typically included in Indian prices (shown separately for transparency)
        return Math.round(subtotal * GST_RATE);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        const shipping = get().getShippingFee();
        // Total = subtotal (GST inclusive) + shipping
        return subtotal + shipping;
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'bowls_cart_storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
