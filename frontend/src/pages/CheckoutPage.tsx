import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  Check, 
  ArrowLeft, 
  Sparkles, 
  Package, 
  Calendar,
  AlertCircle,
  Smartphone,
  Banknote
} from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { orderService } from '../services/orderService';
import { useSound } from '../hooks/useSound';
import { Order, ShippingAddress, CartItem, INDIAN_STATES } from '../types';
import { LUXURY_EASE } from '../utils/motion';
import { price, GST_RATE, SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from '../utils/currency';
import { useLanguage } from '../context/LanguageContext';

// Indian phone number validation: +91 followed by 10 digits starting with 6-9
const isValidIndianPhone = (phone: string) =>
  /^(\+91[\s-]?)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));

// PIN code validation: exactly 6 digits
const isValidPinCode = (pin: string) => /^\d{6}$/.test(pin);

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, getShippingFee, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { playTap, playClink, playGlazeChime } = useSound();
  const { t } = useLanguage();

  // Indian address form state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    house_flat: '',
    street: '',
    landmark: '',
    city: '',
    state: 'Maharashtra',
    pin_code: '',
    country: 'India',
  });

  // Validation errors
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | 'cod'>('razorpay');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoApplied, setPromoApplied] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const discountedSubtotal = subtotal - discountAmount;
  const shipping = getShippingFee();
  // GST is shown for transparency (already included in Indian prices)
  const gstAmount = Math.round(discountedSubtotal * GST_RATE);
  const grandTotal = discountedSubtotal + shipping;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const code = promoCode.trim().toUpperCase();
    if (code === 'EARTH10') {
      playClink();
      setDiscountPercent(10);
      setPromoApplied(true);
    } else if (code === 'BOWLS15') {
      playClink();
      setDiscountPercent(15);
      setPromoApplied(true);
    } else {
      playTap();
      setPromoError('Invalid promo code. Try "EARTH10" for 10% off.');
    }
  };

  const validateForm = (): boolean => {
    let valid = true;
    if (!isValidIndianPhone(shippingAddress.phone)) {
      setPhoneError('Enter a valid 10-digit Indian mobile number (e.g. 9876543210)');
      valid = false;
    } else {
      setPhoneError(null);
    }
    if (!isValidPinCode(shippingAddress.pin_code)) {
      setPinError('PIN Code must be exactly 6 digits');
      valid = false;
    } else {
      setPinError(null);
    }
    return valid;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!validateForm()) return;

    setErrorMessage(null);
    setIsSubmitting(true);
    playClink();

    try {
      const orderPayload = {
        items: items.map((item: CartItem) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        notes: promoApplied ? `Promo code applied: ${promoCode.toUpperCase()}` : undefined,
      };

      const order = await orderService.createOrder(orderPayload);
      setPlacedOrder(order);
      clearCart();
      playGlazeChime();

      // Celebratory Confetti Burst
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#C86D51', '#7A8B78', '#D49B4B', '#4A3B32'],
        });
      } catch (err) {
        console.error('Confetti error', err);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order was successfully created, show confirmation view
  if (placedOrder) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: LUXURY_EASE }}
        className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6"
      >
        <div className="w-20 h-20 rounded-full bg-sage-100 text-sage-700 mx-auto flex items-center justify-center text-4xl shadow-warm-sm animate-bounce">
          🏺
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-sage-100 text-sage-800 text-xs font-bold uppercase tracking-wider rounded-full">
            Order Confirmed &amp; In Queue
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-clay-900">
            Shukriya, {placedOrder.shipping_address.full_name}! 🙏
          </h1>
          <p className="text-sm text-clay-600 max-w-md mx-auto">
            Your handcrafted piece is being inspected and packaged in eco-friendly compostable wraps. 
            Dispatching within 2–3 business days via our trusted delivery partners.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-300 shadow-warm-md text-left space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-sand-200 gap-2">
            <div>
              <span className="text-xs text-clay-400 block">Order Reference</span>
              <span className="font-mono text-base font-bold text-clay-900">{placedOrder.order_number}</span>
            </div>
            <div className="sm:text-right">
              <span className="text-xs text-clay-400 block">Estimated Studio Dispatch</span>
              <span className="text-sm font-semibold text-terracotta-600 flex items-center space-x-1 sm:justify-end">
                <Calendar className="w-3.5 h-3.5" />
                <span>Within 2–3 Business Days</span>
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="divide-y divide-sand-200">
            {placedOrder.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=200&auto=format&fit=crop'}
                    alt={item.product_name}
                    className="w-12 h-12 rounded-xl object-cover border border-sand-200"
                  />
                  <div>
                    <h4 className="font-semibold text-clay-900">{item.product_name}</h4>
                    <span className="text-clay-500">Qty: {item.quantity}</span>
                  </div>
                </div>
                <span className="font-bold text-clay-900">{price(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="pt-4 border-t border-sand-200 space-y-1.5 text-xs text-clay-600">
            <div className="flex justify-between">
              <span>Subtotal (incl. GST)</span>
              <span>{price(placedOrder.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{placedOrder.shipping_fee === 0 ? 'FREE' : price(placedOrder.shipping_fee)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-clay-900 pt-2 border-t border-sand-200">
              <span>Total Paid</span>
              <span className="text-terracotta-600">{price(placedOrder.total_amount)}</span>
            </div>
          </div>

          <div className="bg-sand-100 p-4 rounded-2xl text-xs text-clay-700">
            <span className="font-bold block mb-1">Delivering to:</span>
            <p>
              {placedOrder.shipping_address.house_flat}, {placedOrder.shipping_address.street}
              {placedOrder.shipping_address.landmark ? `, ${placedOrder.shipping_address.landmark}` : ''},{' '}
              {placedOrder.shipping_address.city}, {placedOrder.shipping_address.state} –{' '}
              {placedOrder.shipping_address.pin_code}
            </p>
            <p className="mt-1 text-clay-500">📞 {placedOrder.shipping_address.phone}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link
            to="/account"
            onClick={playTap}
            className="px-6 py-3 bg-clay-800 hover:bg-clay-900 text-cream-50 rounded-2xl text-xs font-semibold shadow-warm-sm transition-all flex items-center justify-center space-x-2"
          >
            <Package className="w-4 h-4" />
            <span>Track Order in My Account</span>
          </Link>
          <Link
            to="/shop"
            onClick={playTap}
            className="px-6 py-3 bg-white hover:bg-sand-100 text-clay-800 border border-sand-300 rounded-2xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center space-x-2"
          >
            <span>Continue Shopping</span>
          </Link>
        </div>
      </motion.div>
    );
  }

  // If basket is empty
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <span className="text-4xl">🥣</span>
        <h2 className="font-heading text-2xl font-bold text-clay-900">Your Basket is Empty</h2>
        <p className="text-xs text-clay-500">
          You need at least one piece in your basket to proceed through checkout.
        </p>
        <Link
          to="/shop"
          onClick={playTap}
          className="inline-block px-6 py-3 bg-terracotta-500 text-white rounded-xl text-xs font-semibold shadow-warm-sm"
        >
          Discover Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-sand-300 pb-4">
        <Link to="/shop" onClick={playTap} className="text-xs text-clay-500 hover:text-clay-800 flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Studio Shop</span>
        </Link>
        <div className="flex items-center space-x-2 text-xs font-semibold text-sage-800">
          <ShieldCheck className="w-4 h-4 text-sage-600" />
          <span>256-Bit SSL Encrypted Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Checkout Accordion Forms */}
        <div className="lg:col-span-7 space-y-6">
          
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            
            {/* Step 1: Shipping Address (Indian Format) */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-sand-200 shadow-warm-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-sand-200">
                <div className="flex items-center space-x-2.5">
                  <span className="w-6 h-6 rounded-full bg-terracotta-500 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="font-heading text-base font-bold text-clay-900">
                    Delivery Address
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playTap();
                    setShippingAddress({
                      full_name: 'Priya Sharma',
                      phone: '9876543210',
                      house_flat: 'Flat 402, Shivam Apartments',
                      street: '14, M.G. Road',
                      landmark: 'Near Inorbit Mall',
                      city: 'Mumbai',
                      state: 'Maharashtra',
                      pin_code: '400001',
                      country: 'India',
                    });
                  }}
                  className="text-[11px] text-terracotta-600 hover:underline font-semibold"
                >
                  Autofill Sample Address
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-clay-700 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={shippingAddress.full_name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, full_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-cream-50 border border-sand-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                </div>

                {/* Phone Number */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-clay-700 mb-1">
                    Mobile Number * (for delivery updates)
                  </label>
                  <div className="flex space-x-2">
                    <span className="inline-flex items-center px-3 py-2.5 bg-sand-100 border border-sand-300 rounded-xl text-xs font-semibold text-clay-700 whitespace-nowrap">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      maxLength={10}
                      value={shippingAddress.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setShippingAddress({ ...shippingAddress, phone: val });
                        if (phoneError) setPhoneError(null);
                      }}
                      className={`flex-1 px-3.5 py-2.5 bg-cream-50 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400 ${
                        phoneError ? 'border-red-400' : 'border-sand-300'
                      }`}
                    />
                  </div>
                  {phoneError && (
                    <p className="text-[11px] text-red-600 mt-1">{phoneError}</p>
                  )}
                </div>

                {/* House / Flat No. */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-clay-700 mb-1">
                    {t('checkout.street', 'House/Flat No. & Street')} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 402, Shivam Apartments"
                    value={shippingAddress.house_flat}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, house_flat: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-cream-50 border border-sand-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                </div>

                {/* Street / Area / Colony */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-clay-700 mb-1">
                    Street / Area / Colony *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 14, M.G. Road, Andheri East"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-cream-50 border border-sand-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                </div>

                {/* Landmark */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-clay-700 mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Inorbit Mall"
                    value={shippingAddress.landmark || ''}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, landmark: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-cream-50 border border-sand-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-semibold text-clay-700 mb-1">
                    {t('checkout.city', 'City')} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-cream-50 border border-sand-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                </div>

                {/* PIN Code */}
                <div>
                  <label className="block text-xs font-semibold text-clay-700 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="6-digit PIN"
                    maxLength={6}
                    value={shippingAddress.pin_code}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setShippingAddress({ ...shippingAddress, pin_code: val });
                      if (pinError) setPinError(null);
                    }}
                    className={`w-full px-3.5 py-2.5 bg-cream-50 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400 ${
                      pinError ? 'border-red-400' : 'border-sand-300'
                    }`}
                  />
                  {pinError && (
                    <p className="text-[11px] text-red-600 mt-1">{pinError}</p>
                  )}
                </div>

                {/* State Dropdown */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-clay-700 mb-1">
                    State / Union Territory *
                  </label>
                  <select
                    required
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-cream-50 border border-sand-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400 appearance-none"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-sand-200 shadow-warm-sm space-y-4">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-sand-200">
                <span className="w-6 h-6 rounded-full bg-terracotta-500 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-heading text-base font-bold text-clay-900">
                  Payment Method
                </h2>
              </div>

              {/* Payment Method Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Razorpay */}
                <button
                  type="button"
                  id="payment-razorpay"
                  onClick={() => { playTap(); setPaymentMethod('razorpay'); }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-terracotta-500 bg-terracotta-50/50 shadow-xs'
                      : 'border-sand-300 hover:bg-sand-50'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-terracotta-600 mb-2" />
                  <p className="text-xs font-bold text-clay-900">Razorpay</p>
                  <p className="text-[10px] text-clay-500">Cards, NetBanking & Wallets</p>
                </button>

                {/* UPI */}
                <button
                  type="button"
                  id="payment-upi"
                  onClick={() => { playTap(); setPaymentMethod('upi'); }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-terracotta-500 bg-terracotta-50/50 shadow-xs'
                      : 'border-sand-300 hover:bg-sand-50'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-sage-600 mb-2" />
                  <p className="text-xs font-bold text-clay-900">UPI</p>
                  <p className="text-[10px] text-clay-500">GPay / PhonePe / Paytm</p>
                </button>

                {/* Cash on Delivery */}
                <button
                  type="button"
                  id="payment-cod"
                  onClick={() => { playTap(); setPaymentMethod('cod'); }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-terracotta-500 bg-terracotta-50/50 shadow-xs'
                      : 'border-sand-300 hover:bg-sand-50'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-ochre-600 mb-2" />
                  <p className="text-xs font-bold text-clay-900">Cash on Delivery</p>
                  <p className="text-[10px] text-clay-500">Pay upon handover</p>
                </button>
              </div>

              {/* Razorpay Info */}
              {paymentMethod === 'razorpay' && (
                <div className="p-4 bg-sand-100/70 rounded-2xl border border-sand-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-clay-800">Razorpay Secure Payment</span>
                    <span className="text-[10px] px-2 py-0.5 bg-sage-200 text-sage-800 rounded font-mono">
                      Test Mode
                    </span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-clay-600 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-sand-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-clay-600 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-sand-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-clay-600 mb-1">CVV</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-sand-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-clay-500">
                    🔒 Powered by Razorpay · PCI DSS compliant · 256-bit SSL encryption
                  </p>
                </div>
              )}

              {/* UPI Info */}
              {paymentMethod === 'upi' && (
                <div className="p-4 bg-sage-50 rounded-2xl border border-sage-200 space-y-3">
                  <span className="font-semibold block text-sage-800 text-xs">Pay via UPI</span>
                  <div>
                    <label className="block text-[11px] font-medium text-clay-600 mb-1">Your UPI ID</label>
                    <input
                      type="text"
                      placeholder="yourname@upi  (e.g. 9876543210@ybl)"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-sage-300 rounded-xl text-xs"
                    />
                  </div>
                  <div className="flex items-center space-x-4 pt-1">
                    <span className="text-[10px] text-clay-500 font-semibold">Accepted:</span>
                    <div className="flex items-center space-x-2 text-[11px] text-clay-600">
                      <span className="px-2 py-0.5 bg-white rounded-lg border border-sand-200">GPay</span>
                      <span className="px-2 py-0.5 bg-white rounded-lg border border-sand-200">PhonePe</span>
                      <span className="px-2 py-0.5 bg-white rounded-lg border border-sand-200">Paytm</span>
                      <span className="px-2 py-0.5 bg-white rounded-lg border border-sand-200">BHIM</span>
                    </div>
                  </div>
                </div>
              )}

              {/* COD Info */}
              {paymentMethod === 'cod' && (
                <div className="p-4 bg-ochre-50 rounded-2xl border border-ochre-200 text-xs text-clay-800 space-y-1">
                  <span className="font-semibold block text-ochre-800">Cash on Delivery</span>
                  <p>Pay in cash when your order arrives. Please keep exact change handy. COD available for orders up to ₹10,000.</p>
                  <p className="text-[10px] text-clay-500 mt-1">⚠️ Additional ₹49 COD handling fee applies.</p>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Place Order CTA */}
            <button
              type="submit"
              id="place-order-btn"
              disabled={isSubmitting}
              className="w-full py-4 bg-terracotta-500 hover:bg-terracotta-600 active:scale-[0.99] text-white rounded-2xl font-bold text-sm shadow-warm-md hover:shadow-warm-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Processing your order...</span>
              ) : (
                <span>Complete Purchase · {price(grandTotal + (paymentMethod === 'cod' ? 49 : 0))}</span>
              )}
            </button>

            <p className="text-center text-[10px] text-clay-400">
              By placing this order, you agree to our Terms of Service and Privacy Policy.
              All prices are inclusive of GST.
            </p>
          </form>

        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-sand-200 shadow-warm-sm space-y-6">
            <h3 className="font-heading text-lg font-bold text-clay-900 pb-3 border-b border-sand-200">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h3>

            {/* Items list */}
            <div className="divide-y divide-sand-200 max-h-64 overflow-y-auto pr-1">
              {items.map(({ product, quantity, selectedColor }: CartItem) => (
                <div key={`${product.id}-${selectedColor}`} className="py-3 flex space-x-3 text-xs first:pt-0">
                  <img
                    src={product.images[0] || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=200&auto=format&fit=crop'}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-cover border border-sand-200 bg-sand-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-clay-900 truncate">{product.name}</h4>
                    <span className="text-clay-500">Qty: {quantity}</span>
                    {product.material && <span className="text-clay-400 block">{product.material}</span>}
                  </div>
                  <span className="font-bold text-clay-900">
                    {price(product.price * quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="space-y-1.5 pt-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="promo-code-input"
                  placeholder="Promo Code (Try EARTH10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-2 bg-cream-50 border border-sand-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-terracotta-400 uppercase font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-clay-800 hover:bg-clay-900 text-cream-50 rounded-xl text-xs font-semibold active:scale-95 transition-all"
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <p className="text-[11px] text-sage-700 font-semibold flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>{promoCode.toUpperCase()} applied: {discountPercent}% Studio Discount!</span>
                </p>
              )}
              {promoError && (
                <p className="text-[11px] text-red-600">{promoError}</p>
              )}
            </form>

            {/* Subtotals & Grand Total */}
            <div className="pt-4 border-t border-sand-200 space-y-2 text-xs text-clay-600">
              <div className="flex justify-between">
                <span>Subtotal (MRP)</span>
                <span>{price(subtotal)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-terracotta-600 font-semibold">
                  <span>Promo Discount ({discountPercent}%)</span>
                  <span>–{price(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sage-700">
                <span>GST (18%, included)</span>
                <span>~{price(gstAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <strong className="text-sage-700">FREE</strong>
                  ) : (
                    price(shipping)
                  )}
                </span>
              </div>
              {paymentMethod === 'cod' && (
                <div className="flex justify-between text-clay-500">
                  <span>COD Handling Fee</span>
                  <span>{price(49)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-clay-900 pt-3 border-t border-sand-200">
                <span>Total Due</span>
                <span className="text-terracotta-600 text-lg">
                  {price(grandTotal + (paymentMethod === 'cod' ? 49 : 0))}
                </span>
              </div>
              <p className="text-[10px] text-clay-400">
                * All prices are inclusive of GST · Free shipping on orders above {price(FREE_SHIPPING_THRESHOLD)}
              </p>
            </div>

          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { icon: '🔒', label: 'Secure Checkout' },
              { icon: '🚚', label: 'Pan-India Delivery' },
              { icon: '↩️', label: '7-Day Returns' },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-white p-3 rounded-2xl border border-sand-200 text-xs">
                <span className="text-2xl block mb-1">{icon}</span>
                <span className="text-clay-600 font-medium leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
