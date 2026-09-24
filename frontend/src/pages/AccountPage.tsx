import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Package, 
  Heart, 
  MapPin, 
  User as UserIcon, 
  LogOut, 
  ShoppingBag, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { orderService } from '../services/orderService';
import { Order, Product } from '../types';
import { AuthModal } from '../components/common/AuthModal';
import { price } from '../utils/currency';

export const AccountPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'orders';

  const { user, isAuthenticated, logout } = useAuthStore();
  const { addToCart } = useCartStore();
  const { items: wishlistItems, removeFromWishlist } = useWishlistStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLoadingOrders(true);
      orderService.getMyOrders()
        .then(setOrders)
        .catch(console.error)
        .finally(() => setLoadingOrders(false));
    }
  }, [isAuthenticated]);

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-sand-200 text-clay-700 mx-auto flex items-center justify-center text-3xl">
          🏺
        </div>
        <h2 className="font-heading text-2xl font-bold text-clay-900">
          Sign In to Your Account
        </h2>
        <p className="text-xs text-clay-600">
          View your order history, track studio shipments, and access your saved handcrafted wishlist.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-6 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-2xl text-xs font-semibold shadow-warm-sm transition-all"
        >
          Sign In / Register
        </button>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Summary */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-200 shadow-warm-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-terracotta-400 to-terracotta-600 text-white font-bold text-xl flex items-center justify-center shadow-warm-sm">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-clay-900">
              {user?.full_name}
            </h1>
            <p className="text-xs text-clay-500">{user?.email} • Member since {new Date(user?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="self-start sm:self-auto px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors flex items-center space-x-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <button
            onClick={() => setTab('orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              currentTab === 'orders'
                ? 'bg-clay-800 text-cream-50 shadow-warm-sm'
                : 'bg-white/70 text-clay-700 hover:bg-sand-100 border border-sand-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History ({orders.length})</span>
          </button>

          <button
            onClick={() => setTab('wishlist')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              currentTab === 'wishlist'
                ? 'bg-clay-800 text-cream-50 shadow-warm-sm'
                : 'bg-white/70 text-clay-700 hover:bg-sand-100 border border-sand-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Wishlist ({wishlistItems.length})</span>
          </button>

          <button
            onClick={() => setTab('address')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              currentTab === 'address'
                ? 'bg-clay-800 text-cream-50 shadow-warm-sm'
                : 'bg-white/70 text-clay-700 hover:bg-sand-100 border border-sand-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Studio Address</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="lg:col-span-3">
          
          {/* ORDERS TAB */}
          {currentTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl font-bold text-clay-900">
                Your Studio Orders
              </h2>

              {loadingOrders ? (
                <div className="p-8 text-center text-xs text-clay-500">Loading your orders...</div>
              ) : orders.length === 0 ? (
                <div className="bg-white p-10 rounded-3xl border border-sand-200 text-center space-y-3">
                  <Package className="w-10 h-10 text-clay-400 mx-auto" />
                  <h3 className="font-heading text-base font-bold text-clay-900">No Orders Yet</h3>
                  <p className="text-xs text-clay-500 max-w-sm mx-auto">
                    You haven&apos;t placed any orders with Bowls &apos;N&apos; Jars yet. Ready to invite handcrafted warmth home?
                  </p>
                  <Link
                    to="/shop"
                    className="inline-block px-5 py-2.5 bg-terracotta-500 text-white rounded-xl text-xs font-semibold"
                  >
                    Start Exploring
                  </Link>
                </div>
              ) : (
                orders.map((ord) => (
                  <div key={ord.id} className="bg-white rounded-3xl border border-sand-200 shadow-warm-sm p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-sand-200 gap-2">
                      <div>
                        <span className="text-xs text-clay-400 block">Order Number</span>
                        <span className="font-mono text-sm font-bold text-clay-900">{ord.order_number}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          ord.status === 'delivered'
                            ? 'bg-sage-100 text-sage-800'
                            : ord.status === 'shipped'
                            ? 'bg-ochre-100 text-ochre-800'
                            : 'bg-terracotta-100 text-terracotta-800'
                        }`}>
                          {ord.status}
                        </span>
                        <span className="text-xs text-clay-500">
                          {new Date(ord.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-sand-100">
                      {ord.items.map((item) => (
                        <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.image_url || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=150&auto=format&fit=crop'}
                              alt={item.product_name}
                              className="w-12 h-12 rounded-xl object-cover border border-sand-200"
                            />
                            <div>
                              <h4 className="font-semibold text-clay-900">{item.product_name}</h4>
                              <span className="text-clay-500">Quantity: {item.quantity}</span>
                            </div>
                          </div>
                          <span className="font-bold text-clay-900">{price(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-sand-200 flex justify-between items-center text-xs">
                      <span className="text-clay-500">Payment: <strong className="text-clay-800 uppercase">{ord.payment_method}</strong> ({ord.payment_status})</span>
                      <span className="text-sm font-bold text-clay-900">Total: {price(ord.total_amount)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {currentTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl font-bold text-clay-900">
                Your Saved Pieces ({wishlistItems.length})
              </h2>

              {wishlistItems.length === 0 ? (
                <div className="bg-white p-10 rounded-3xl border border-sand-200 text-center space-y-3">
                  <Heart className="w-10 h-10 text-sand-300 mx-auto" />
                  <h3 className="font-heading text-base font-bold text-clay-900">Your Wishlist is Empty</h3>
                  <p className="text-xs text-clay-500 max-w-sm mx-auto">
                    Save pieces you love while browsing to keep track of them for your next home or desk refresh.
                  </p>
                  <Link
                    to="/shop"
                    className="inline-block px-5 py-2.5 bg-terracotta-500 text-white rounded-xl text-xs font-semibold"
                  >
                    Browse Collections
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistItems.map((prod: Product) => (
                    <div key={prod.id} className="bg-white p-4 rounded-3xl border border-sand-200 flex space-x-4 items-center shadow-warm-sm">
                      <img
                        src={prod.images[0] || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=200&auto=format&fit=crop'}
                        alt={prod.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-sand-200"
                      />
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${prod.slug}`} className="font-heading text-sm font-semibold text-clay-900 hover:text-terracotta-600 truncate block">
                          {prod.name}
                        </Link>
                        <span className="text-xs font-bold text-clay-900 block mt-0.5">
                          {price(prod.price)}
                        </span>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => {
                              addToCart(prod, 1);
                              removeFromWishlist(prod.id);
                            }}
                            className="px-3 py-1 bg-terracotta-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Add to Cart</span>
                          </button>
                          <button
                            onClick={() => removeFromWishlist(prod.id)}
                            className="text-xs text-clay-400 hover:text-red-600 underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADDRESS TAB */}
          {currentTab === 'address' && (
            <div className="space-y-6">
              <h2 className="font-heading text-xl font-bold text-clay-900">
                Studio Shipping Address
              </h2>
              <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-warm-sm max-w-lg space-y-3 text-xs text-clay-700">
                <div className="flex items-center justify-between pb-3 border-b border-sand-200">
                  <span className="font-bold text-clay-900 text-sm">Primary Delivery Address</span>
                  <span className="px-2 py-0.5 bg-sage-100 text-sage-800 text-[10px] font-bold rounded">Default</span>
                </div>
                <p className="font-semibold text-clay-900">{user?.full_name}</p>
                <p>Flat 302, Shivam Towers</p>
                <p>14, Linking Road, Bandra West</p>
                <p>Near Shoppers Stop</p>
                <p>Mumbai, Maharashtra – 400050</p>
                <p>India</p>
                <p className="text-clay-500 pt-2 border-t border-sand-100">
                  📞 +91 {user?.phone || '9845123456'}
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
