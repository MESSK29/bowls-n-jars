import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { FlyingCartProvider } from './components/common/FlyingCartThumbnail';
import { ToastProvider } from './components/common/Toast';
import { LanguageProvider } from './context/LanguageContext';
import { pageVariants } from './utils/motion';
import { DesktopModeBanner } from './components/layout/DesktopModeBanner';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccountPage } from './pages/AccountPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLandingRoute = location.pathname === '/';

  return (
    <LanguageProvider>
      <ToastProvider>
        <FlyingCartProvider>
          <div className="flex flex-col min-h-screen bg-cream-200 text-clay-800 selection:bg-terracotta-200 selection:text-terracotta-900">
            <ScrollToTop />
            
            {/* Consumer header and announcement bar only for non-admin customer shopping routes, and not landing page */}
            {!isAdminRoute && !isLandingRoute && (
              <>
                <AnnouncementBar />
                <Navbar />
                <CartDrawer />
              </>
            )}

            <DesktopModeBanner />

            <main className="flex-1 overflow-x-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Routes location={location}>
                    {/* Unauthenticated / Gate */}
                    <Route path="/" element={<LandingPage />} />
                    
                    {/* Protected Store Front */}
                    <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                    <Route path="/shop" element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
                    <Route path="/products" element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
                    <Route path="/product/:slug" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
                    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                    <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                    <Route path="/about" element={<ProtectedRoute><AboutPage /></ProtectedRoute>} />
                    <Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
                    
                    {/* Protected Admin */}
                    <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboardPage /></ProtectedRoute>} />
                    
                    {/* Fallback */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Consumer footer for store customer pages and admin */}
            {!isLandingRoute && <Footer />}
          </div>
        </FlyingCartProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}

export default App;
