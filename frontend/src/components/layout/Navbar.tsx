import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Globe
} from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useAuthStore } from '../../stores/authStore';
import { useSound } from '../../hooks/useSound';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../utils/translations';
import { useFlyingCart } from '../common/FlyingCartThumbnail';
import { AuthModal } from '../common/AuthModal';
import { STATIC_CATEGORIES } from '../../utils/categories';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
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

  // Track scroll without layout shift
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 transition-all duration-300">
            
            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => {
                  playTap();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="p-2 rounded-xl text-clay-700 hover:bg-sand-100 transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                onClick={playTap}
                className="flex items-center space-x-3 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-terracotta-400 to-terracotta-600 flex items-center justify-center text-white shadow-warm-sm group-hover:scale-105 transition-transform duration-300">
                  <span className="text-xl">🏺</span>
                </div>
                <div>
                  <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-clay-900 block leading-none">
                    Bowls <span className="text-terracotta-500">&apos;N&apos;</span> Jars
                  </span>
                  <span className="text-[10px] tracking-widest uppercase font-medium text-clay-600 block mt-0.5">
                    Handcrafted Living
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
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
                <div className="absolute top-full left-0 w-48 bg-white border border-sand-200 rounded-xl shadow-warm-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left group-hover:translate-y-1">
                  {STATIC_CATEGORIES.map(cat => (
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
            <div className="flex items-center space-x-1 sm:space-x-2">
              
              {/* Multi-Language Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    playTap();
                    setIsLangMenuOpen(!isLangMenuOpen);
                  }}
                  className="flex items-center space-x-1 py-1.5 px-2.5 rounded-full bg-sand-100 hover:bg-sand-200 border border-sand-300 text-xs font-semibold text-clay-800 transition-colors"
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

              {/* Sound Design Toggle */}
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute tactile sound' : 'Mute tactile sound'}
                title={isMuted ? 'Unmute porcelain clinks' : 'Mute sound effects'}
                className="p-2 text-clay-700 hover:text-terracotta-600 rounded-full hover:bg-sand-100 transition-colors relative"
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

              {/* Search Toggle */}
              <div className="relative">
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
                      className="absolute right-2.5 text-clay-400 hover:text-clay-700"
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
                    className="p-2.5 text-clay-700 hover:text-terracotta-600 rounded-full hover:bg-sand-100 transition-colors"
                    aria-label="Search items"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Wishlist */}
              <Link
                to="/account?tab=wishlist"
                onClick={playTap}
                className="p-2.5 text-clay-700 hover:text-terracotta-600 rounded-full hover:bg-sand-100 transition-colors relative"
                aria-label="View Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-sage-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scaleIn">
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
                className="p-2.5 text-clay-700 hover:text-terracotta-600 rounded-full hover:bg-sand-100 transition-colors relative"
                aria-label="View Shopping Basket"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-4 h-4 bg-terracotta-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>

              {/* User Menu / Login */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => {
                      playTap();
                      setIsUserMenuOpen(!isUserMenuOpen);
                    }}
                    className="flex items-center space-x-1.5 py-1.5 px-3 bg-sand-100 hover:bg-sand-200 border border-sand-300 rounded-full text-xs font-semibold text-clay-800 transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-terracotta-600" />
                    <span className="hidden md:inline max-w-[90px] truncate">{user.full_name.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3 text-clay-500" />
                  </button>

                  {/* Dropdown */}
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
                        className="flex items-center space-x-2.5 px-4 py-2 text-clay-700 hover:bg-sand-50 hover:text-terracotta-600"
                      >
                        <Package className="w-4 h-4" />
                        <span>{t('nav.account')}</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={playTap}
                          className="flex items-center space-x-2.5 px-4 py-2 text-amber-700 hover:bg-amber-50 font-bold"
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
                        className="w-full flex items-center space-x-2.5 px-4 py-2 text-red-600 hover:bg-red-50 text-left border-t border-sand-100 mt-1"
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
                  className="hidden sm:inline-flex items-center space-x-1.5 py-2 px-4 rounded-full bg-clay-800 hover:bg-clay-900 text-cream-50 text-xs font-medium transition-all shadow-sm"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>{t('nav.sign_in')}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-sand-200 bg-cream-100 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
            <Link
              to="/shop"
              onClick={() => {
                playTap();
                setIsMobileMenuOpen(false);
              }}
              className="block px-3 py-2 text-base font-medium text-clay-800 rounded-xl hover:bg-sand-200"
            >
              Shop All
            </Link>
            
            <div className="px-3 py-2 text-sm font-bold text-clay-500 uppercase tracking-wider">
              Categories
            </div>
            {STATIC_CATEGORIES.map(cat => (
              <Link
                key={cat.slug}
                to={`/shop?category=${cat.slug}`}
                onClick={() => {
                  playTap();
                  setIsMobileMenuOpen(false);
                  window.scrollTo(0, 0);
                }}
                className="block pl-6 pr-3 py-2 text-base font-medium text-clay-700 rounded-xl hover:bg-sand-200"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/about"
              onClick={() => {
                playTap();
                setIsMobileMenuOpen(false);
              }}
              className="block px-3 py-2 text-base font-medium text-clay-800 rounded-xl hover:bg-sand-200"
            >
              {t('nav.our_story')}
            </Link>
            <Link
              to="/contact"
              onClick={() => {
                playTap();
                setIsMobileMenuOpen(false);
              }}
              className="block px-3 py-2 text-base font-medium text-clay-800 rounded-xl hover:bg-sand-200"
            >
              {t('nav.contact_faq')}
            </Link>
            {!isAuthenticated && (
              <div className="pt-3 border-t border-sand-200">
                <button
                  onClick={() => {
                    playTap();
                    setIsMobileMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-terracotta-500 text-white rounded-xl font-medium text-sm text-center"
                >
                  {t('nav.sign_in')}
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};
