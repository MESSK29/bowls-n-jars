import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  User as UserIcon, 
  Menu, 
  X, 
  LayoutDashboard, 
  LogOut, 
  Package, 
  ChevronDown,
  Volume2,
  VolumeX,
  Globe,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useAuthStore } from '../../stores/authStore';
import { useSound } from '../../hooks/useSound';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../utils/translations';
import { useFlyingCart } from '../common/FlyingCartThumbnail';
import { AuthModal } from '../common/AuthModal';
import { productService } from '../../services/productService';
import { Category } from '../../types';
import { SPRING_GENTLE, LUXURY_EASE } from '../../utils/motion';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { getItemCount, openDrawer } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const { isMuted, toggleMute, playTap, playSlide } = useSound();
  const { language, setLanguage, t } = useLanguage();
  const { cartPulse } = useFlyingCart();

  const cartCount = getItemCount();
  const wishlistCount = wishlistItems.length;

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  ];

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    productService.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Track scroll without layout shift
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
    setIsLangMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      playTap();
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleOpenCart = () => {
    playSlide();
    openDrawer();
  };

  const handleSelectLanguage = (lang: Language) => {
    playTap();
    setLanguage(lang);
    setIsLangMenuOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-30 transition-all duration-300 ${
          isScrolled
            ? 'bg-cream-200/95 backdrop-blur-md shadow-warm-sm border-b border-sand-300 py-1'
            : 'bg-cream-200/90 backdrop-blur-xs border-b border-sand-200 py-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 transition-all duration-300">
            
            {/* Left: Mobile hamburger menu trigger */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => {
                  playTap();
                  setIsMobileMenuOpen(true);
                }}
                className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-clay-800 hover:bg-sand-200 active:scale-95 transition-all flex items-center justify-center"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                onClick={playTap}
                className="flex items-center space-x-2 sm:space-x-3 group"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-terracotta-400 to-terracotta-600 flex items-center justify-center text-white shadow-warm-sm group-hover:scale-105 transition-transform duration-300 shrink-0">
                  <span className="text-lg sm:text-xl">🏺</span>
                </div>
                <div>
                  <span className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-clay-900 block leading-none">
                    Bowls <span className="text-terracotta-500">&apos;N&apos;</span> Jars
                  </span>
                  <span className="text-[9px] sm:text-[10px] tracking-widest uppercase font-medium text-clay-600 block mt-0.5">
                    Handcrafted Living
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links (>=1024px) */}
            <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-clay-700">
              <Link
                to="/shop"
                onClick={() => playTap()}
                className="hover:text-terracotta-600 transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-terracotta-500 after:absolute after:bottom-0 after:left-0 after:transition-all"
              >
                Shop All
              </Link>

              <div className="relative group py-2 -my-2">
                <button className="flex items-center space-x-1 hover:text-terracotta-600 transition-colors py-1 relative">
                  <span>Categories</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-0 w-52 bg-white border border-sand-200 rounded-2xl shadow-warm-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left group-hover:translate-y-1">
                  {categories.map(cat => (
                    <Link
                      key={cat.slug}
                      to={`/shop?category=${cat.slug}`}
                      onClick={() => {
                        playTap();
                        window.scrollTo(0, 0);
                      }}
                      className="block px-4 py-2 text-sm text-clay-700 hover:bg-sand-50 hover:text-terracotta-600 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                to="/about"
                onClick={playTap}
                className="hover:text-terracotta-600 transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-terracotta-500 after:absolute after:bottom-0 after:left-0 after:transition-all"
              >
                {t('nav.our_story')}
              </Link>
              <Link
                to="/contact"
                onClick={playTap}
                className="hover:text-terracotta-600 transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-terracotta-500 after:absolute after:bottom-0 after:left-0 after:transition-all"
              >
                {t('nav.contact_faq')}
              </Link>
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-0.5 sm:space-x-1.5">
              
              {/* Desktop Multi-Language Selector Dropdown (>= 1024px) */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => {
                    playTap();
                    setIsLangMenuOpen(!isLangMenuOpen);
                  }}
                  className="min-h-[38px] flex items-center space-x-1 py-1.5 px-3 rounded-full bg-sand-100 hover:bg-sand-200 border border-sand-300 text-xs font-semibold text-clay-800 transition-colors"
                  title="Switch Language / भाषा बदलें / భాష మార్చండి"
                >
                  <Globe className="w-3.5 h-3.5 text-terracotta-600" />
                  <span className="uppercase text-[11px]">
                    {language === 'hi' ? 'हिन्दी' : language === 'te' ? 'తెలుగు' : 'EN'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-clay-500" />
                </button>

                {isLangMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-warm-lg border border-sand-200 py-1.5 z-50 text-xs animate-fadeIn"
                    onClick={() => setIsLangMenuOpen(false)}
                  >
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => handleSelectLanguage(l.code)}
                        className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-sand-50 transition-colors ${
                          language === l.code ? 'font-bold text-terracotta-600 bg-terracotta-50/50' : 'text-clay-700'
                        }`}
                      >
                        <span>{l.native}</span>
                        {language === l.code && <span className="text-[10px] text-terracotta-500">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sound Design Toggle (Desktop & Tablet) */}
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute tactile sound' : 'Mute tactile sound'}
                title={isMuted ? 'Unmute porcelain clinks' : 'Mute sound effects'}
                className="hidden sm:flex min-w-[40px] min-h-[40px] items-center justify-center p-2 text-clay-700 hover:text-terracotta-600 rounded-full hover:bg-sand-100 transition-colors relative"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-clay-400" />
                ) : (
                  <div className="relative">
                    <Volume2 className="w-4 h-4 text-terracotta-600" />
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-sage-500 rounded-full animate-ping" />
                  </div>
                )}
              </button>

              {/* Search Toggle (Desktop) */}
              <div className="relative hidden md:block">
                {isSearchOpen ? (
                  <form onSubmit={handleSearchSubmit} className="flex items-center">
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('nav.search_placeholder')}
                      className="w-48 sm:w-64 pl-3 pr-8 py-1.5 text-xs sm:text-sm bg-white border border-terracotta-400 rounded-full focus:outline-none focus:ring-2 focus:ring-terracotta-300 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center absolute right-0 text-clay-400 hover:text-clay-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => {
                      playTap();
                      setIsSearchOpen(true);
                    }}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 text-clay-700 hover:text-terracotta-600 rounded-full hover:bg-sand-100 transition-colors"
                    aria-label="Search items"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Mobile Search Button (shows mobile search bar below header) */}
              <button
                onClick={() => {
                  playTap();
                  setIsSearchOpen(!isSearchOpen);
                }}
                className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 text-clay-700 hover:text-terracotta-600 rounded-full hover:bg-sand-100 transition-colors"
                aria-label="Search items"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                to="/account?tab=wishlist"
                onClick={playTap}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 text-clay-700 hover:text-terracotta-600 rounded-full hover:bg-sand-100 transition-colors relative"
                aria-label="View Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-sage-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scaleIn pointer-events-none">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <motion.button
                id="header-cart-btn"
                onClick={handleOpenCart}
                animate={cartPulse ? { scale: [1, 1.25, 0.95, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 text-clay-700 hover:text-terracotta-600 rounded-full hover:bg-sand-100 transition-colors relative"
                aria-label="View Shopping Basket"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1.5 right-1.5 w-4 h-4 bg-terracotta-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center pointer-events-none"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>

              {/* User Menu / Login (Desktop >= 640px) */}
              {isAuthenticated && user ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => {
                      playTap();
                      setIsUserMenuOpen(!isUserMenuOpen);
                    }}
                    className="min-h-[44px] flex items-center space-x-1.5 py-1.5 px-3 bg-sand-100 hover:bg-sand-200 border border-sand-300 rounded-full text-xs font-semibold text-clay-800 transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-terracotta-600" />
                    <span className="max-w-[80px] md:max-w-[100px] truncate">{user.full_name.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3 text-clay-500" />
                  </button>

                  {/* Desktop Dropdown */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-warm-lg border border-sand-200 py-2 z-50 text-sm animate-fadeIn"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-sand-100">
                        <p className="font-semibold text-clay-900 truncate">{user.full_name}</p>
                        <p className="text-xs text-clay-500 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold uppercase rounded-md">
                            Store Manager
                          </span>
                        )}
                      </div>

                      <Link
                        to="/account"
                        onClick={playTap}
                        className="flex items-center space-x-2.5 px-4 py-2.5 min-h-[44px] text-clay-700 hover:bg-sand-50 hover:text-terracotta-600"
                      >
                        <Package className="w-4 h-4" />
                        <span>{t('nav.account')}</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={playTap}
                          className="flex items-center space-x-2.5 px-4 py-2.5 min-h-[44px] text-amber-700 hover:bg-amber-50 font-bold"
                        >
                          <LayoutDashboard className="w-4 h-4 text-amber-600" />
                          <span>{t('nav.admin_portal')}</span>
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          playTap();
                          logout();
                        }}
                        className="w-full flex items-center space-x-2.5 px-4 py-2.5 min-h-[44px] text-red-600 hover:bg-red-50 text-left border-t border-sand-100 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('nav.logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    playTap();
                    setIsAuthModalOpen(true);
                  }}
                  className="hidden sm:inline-flex items-center space-x-1.5 min-h-[44px] py-2 px-4 rounded-full bg-clay-800 hover:bg-clay-900 text-cream-50 text-xs font-medium transition-all shadow-sm"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>{t('nav.sign_in')}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-sand-300 bg-cream-100/98 px-4 py-3 shadow-md"
            >
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.search_placeholder')}
                  className="w-full pl-4 pr-12 py-3 text-base bg-white border border-sand-300 focus:border-terracotta-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-200 shadow-inner text-clay-900 placeholder-clay-400"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-clay-500 hover:text-clay-800"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MOBILE / TABLET SLIDE-IN NAVIGATION DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: LUXURY_EASE }}
              className="absolute inset-0 bg-clay-950/60 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Sliding Drawer Container */}
            <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={SPRING_GENTLE}
                className="w-[85vw] max-w-sm sm:max-w-md bg-cream-100 flex flex-col shadow-2xl border-r border-sand-300 relative z-50 h-full"
              >
                
                {/* Drawer Header */}
                <div className="p-4 sm:p-5 border-b border-sand-200 flex items-center justify-between bg-cream-200">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-terracotta-400 to-terracotta-600 flex items-center justify-center text-white shadow-sm">
                      <span>🏺</span>
                    </div>
                    <div>
                      <span className="font-heading text-lg font-bold text-clay-900 block leading-none">
                        Bowls 'N' Jars
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-clay-500 font-medium">
                        Handcrafted Living
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      playTap();
                      setIsMobileMenuOpen(false);
                    }}
                    className="min-w-[44px] min-h-[44px] p-2 rounded-xl text-clay-500 hover:text-clay-900 hover:bg-sand-200 transition-colors flex items-center justify-center"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Drawer Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
                  
                  {/* Main Links */}
                  <div className="space-y-1">
                    <Link
                      to="/shop"
                      onClick={() => {
                        playTap();
                        setIsMobileMenuOpen(false);
                      }}
                      className="min-h-[48px] flex items-center justify-between px-3.5 py-3 rounded-2xl text-base font-semibold text-clay-800 hover:bg-sand-200 active:bg-sand-300 transition-colors"
                    >
                      <span>Shop All Goods</span>
                      <ArrowRight className="w-4 h-4 text-clay-400" />
                    </Link>

                    {/* Collapsible Categories Accordion */}
                    <div>
                      <button
                        onClick={() => {
                          playTap();
                          setIsCategoryExpanded(!isCategoryExpanded);
                        }}
                        className="min-h-[48px] w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-base font-semibold text-clay-800 hover:bg-sand-200 active:bg-sand-300 transition-colors"
                      >
                        <span>Categories</span>
                        <ChevronDown className={`w-4 h-4 text-clay-500 transition-transform duration-200 ${isCategoryExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isCategoryExpanded && (
                        <div className="pl-4 pr-1 py-1 space-y-1 animate-fadeIn">
                          {categories.map(cat => (
                            <Link
                              key={cat.slug}
                              to={`/shop?category=${cat.slug}`}
                              onClick={() => {
                                playTap();
                                setIsMobileMenuOpen(false);
                              }}
                              className="min-h-[44px] flex items-center px-3.5 py-2 text-sm font-medium text-clay-700 hover:text-terracotta-600 rounded-xl hover:bg-sand-200 transition-colors"
                            >
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    <Link
                      to="/about"
                      onClick={() => {
                        playTap();
                        setIsMobileMenuOpen(false);
                      }}
                      className="min-h-[48px] flex items-center justify-between px-3.5 py-3 rounded-2xl text-base font-semibold text-clay-800 hover:bg-sand-200 active:bg-sand-300 transition-colors"
                    >
                      <span>{t('nav.our_story')}</span>
                      <ArrowRight className="w-4 h-4 text-clay-400" />
                    </Link>

                    <Link
                      to="/contact"
                      onClick={() => {
                        playTap();
                        setIsMobileMenuOpen(false);
                      }}
                      className="min-h-[48px] flex items-center justify-between px-3.5 py-3 rounded-2xl text-base font-semibold text-clay-800 hover:bg-sand-200 active:bg-sand-300 transition-colors"
                    >
                      <span>{t('nav.contact_faq')}</span>
                      <ArrowRight className="w-4 h-4 text-clay-400" />
                    </Link>
                  </div>

                  {/* PREFERENCES PANEL (Language + Tactile Theme Audio) */}
                  <div className="bg-sand-100/90 rounded-3xl p-4 border border-sand-300/80 space-y-4">
                    
                    {/* Language Switcher Section */}
                    <div>
                      <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-clay-600 mb-2.5">
                        <Globe className="w-3.5 h-3.5 text-terracotta-600" />
                        <span>Language / भाषा / భాష</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {languages.map((l) => (
                          <button
                            key={l.code}
                            onClick={() => handleSelectLanguage(l.code)}
                            className={`min-h-[44px] py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                              language === l.code
                                ? 'bg-terracotta-500 text-white shadow-sm'
                                : 'bg-white text-clay-700 border border-sand-300 hover:bg-sand-50'
                            }`}
                          >
                            <span>{l.native}</span>
                            <span className="text-[10px] opacity-80">{l.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tactile Audio Toggle */}
                    <div className="pt-2 border-t border-sand-200">
                      <button
                        onClick={toggleMute}
                        className="w-full min-h-[44px] flex items-center justify-between p-2.5 rounded-2xl bg-white border border-sand-300 hover:bg-sand-50 transition-colors text-xs font-medium text-clay-800"
                      >
                        <div className="flex items-center space-x-2.5">
                          {isMuted ? (
                            <VolumeX className="w-4 h-4 text-clay-400" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-terracotta-600" />
                          )}
                          <div className="text-left">
                            <span className="font-semibold block">Tactile Sound Effects</span>
                            <span className="text-[10px] text-clay-500">
                              {isMuted ? 'Muted' : 'Playing ceramic clinks on tap'}
                            </span>
                          </div>
                        </div>

                        <div className={`w-10 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                          isMuted ? 'bg-sand-300 justify-start' : 'bg-terracotta-500 justify-end'
                        }`}>
                          <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                        </div>
                      </button>
                    </div>

                  </div>

                  {/* Trust Pill */}
                  <div className="flex items-center space-x-2 p-3 rounded-2xl bg-white/70 border border-sand-200 text-xs text-clay-600">
                    <Sparkles className="w-4 h-4 text-ochre-500 shrink-0" />
                    <span>Free shipping on all orders over ₹999 across India.</span>
                  </div>

                </div>

                {/* Drawer Footer (User Authentication & Actions) */}
                <div className="p-4 sm:p-5 border-t border-sand-200 bg-white">
                  {isAuthenticated && user ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 pb-2 border-b border-sand-100">
                        <div className="w-10 h-10 rounded-full bg-terracotta-100 text-terracotta-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {user.full_name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-clay-900 truncate">{user.full_name}</p>
                          <p className="text-xs text-clay-500 truncate">{user.email}</p>
                        </div>
                        {isAdmin && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold uppercase rounded-md shrink-0">
                            Admin
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to="/account"
                          onClick={() => {
                            playTap();
                            setIsMobileMenuOpen(false);
                          }}
                          className="min-h-[44px] flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-sand-100 text-clay-800 text-xs font-semibold hover:bg-sand-200 transition-colors"
                        >
                          <Package className="w-3.5 h-3.5 text-clay-600" />
                          <span>{t('nav.account')}</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => {
                              playTap();
                              setIsMobileMenuOpen(false);
                            }}
                            className="min-h-[44px] flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold hover:bg-amber-200 transition-colors"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-amber-700" />
                            <span>Admin</span>
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            playTap();
                            setIsMobileMenuOpen(false);
                            logout();
                          }}
                          className={`min-h-[44px] flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors ${isAdmin ? 'col-span-2' : ''}`}
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>{t('nav.logout')}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        playTap();
                        setIsMobileMenuOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full min-h-[48px] py-3 bg-terracotta-500 hover:bg-terracotta-600 active:scale-98 text-white rounded-2xl font-bold text-sm text-center shadow-warm-md flex items-center justify-center space-x-2 transition-all"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>{t('nav.sign_in')}</span>
                    </button>
                  )}
                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};
