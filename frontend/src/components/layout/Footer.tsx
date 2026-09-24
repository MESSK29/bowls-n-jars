import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Check, Leaf, Shield, HeartHandshake, Sparkles } from 'lucide-react';
import { BowlsNJarsText } from '../common/BowlsNJarsText';
import { useToast } from '../common/Toast';
import { useStoreConfigStore } from '../../stores/storeConfigStore';
import { STATIC_CATEGORIES } from '../../utils/categories';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useToast();
  const { config } = useStoreConfigStore();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
      showToast({
        title: 'Subscribed Successfully',
        description: 'Welcome to the Bowls \'N\' Jars family!',
        type: 'success'
      });
    }
  };

  return (
    <footer className="bg-clay-900 text-cream-200 pt-16 pb-10 border-t border-clay-800 relative overflow-hidden">
      <BowlsNJarsText />
      {/* Brand Values Ribbon */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 px-6 bg-clay-800/80 rounded-3xl border border-clay-700">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-terracotta-500/20 text-terracotta-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-cream-100 uppercase tracking-wider">Handcrafted</h4>
              <p className="text-xs text-clay-400 mt-0.5">Slow-made on the wheel</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-sage-500/20 text-sage-400 flex items-center justify-center flex-shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-cream-100 uppercase tracking-wider">100% Non-Toxic</h4>
              <p className="text-xs text-clay-400 mt-0.5">Lead-free natural glazes</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-ochre-500/20 text-ochre-400 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-cream-100 uppercase tracking-wider">Zero-Plastic</h4>
              <p className="text-xs text-clay-400 mt-0.5">Recycled &amp; compostable pack</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-terracotta-500/20 text-terracotta-400 flex items-center justify-center flex-shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-cream-100 uppercase tracking-wider">Artisan Fair Trade</h4>
              <p className="text-xs text-clay-400 mt-0.5">Direct studio collaboration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-clay-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">🏺</span>
              <span className="font-heading text-2xl font-bold tracking-tight text-cream-50">
                Bowls <span className="text-terracotta-400">&apos;N&apos;</span> Jars
              </span>
            </div>
            <p className="text-xs sm:text-sm text-clay-400 leading-relaxed max-w-sm">
              Bowls &apos;N&apos; Jars celebrates the beauty of tactile, slow craftsmanship. From wheel-thrown dinnerware to ceramic-insulated lunch boxes and durable stationery, each piece is designed to ground your everyday moments in warmth and intention.
            </p>
            <p className="text-xs text-clay-400">
              <a href={`https://maps.google.com/?q=${encodeURIComponent(config.storeAddress)}`} target="_blank" rel="noopener noreferrer" className="hover:text-terracotta-400 transition-colors whitespace-pre-line">
                Studio: {config.storeAddress}
              </a>
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="font-heading text-sm font-semibold text-cream-100 uppercase tracking-wider">
              Collections
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm text-clay-400">
              {STATIC_CATEGORIES.map(cat => (
                <li key={cat.slug}>
                  <Link to={`/shop?category=${cat.slug}`} className="hover:text-terracotta-400 transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/shop" className="hover:text-terracotta-400 transition-colors">
                  View All Goods
                </Link>
              </li>
            </ul>
          </div>

          {/* Brand & Support */}
          <div className="space-y-3">
            <h5 className="font-heading text-sm font-semibold text-cream-100 uppercase tracking-wider">
              Studio &amp; Care
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm text-clay-400">
              <li>
                <Link to="/about" className="hover:text-terracotta-400 transition-colors">
                  Our Philosophy
                </Link>
              </li>
              <li>
                <Link to="/about#care" className="hover:text-terracotta-400 transition-colors">
                  Ceramic Care Guide
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-terracotta-400 transition-colors">
                  Shipping &amp; Returns
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-terracotta-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-terracotta-400 transition-colors">
                  Wholesale Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-3">
            <h5 className="font-heading text-sm font-semibold text-cream-100 uppercase tracking-wider">
              The Clay Chronicle
            </h5>
            <p className="text-xs text-clay-400">
              Subscribe for private kiln-firing releases, studio recipes, and 10% off your first purchase.
            </p>
            {subscribed ? (
              <div className="p-3 bg-sage-900/50 border border-sage-700 rounded-2xl flex items-center space-x-2 text-sage-300 text-xs">
                <Check className="w-4 h-4 text-sage-400" />
                <span>Welcome to our inner circle! Check your inbox soon.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <Mail className="w-4 h-4 text-clay-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full pl-10 pr-4 py-2.5 bg-clay-800 border border-clay-700 rounded-xl text-xs text-cream-100 placeholder-clay-500 focus:outline-none focus:border-terracotta-400 focus:ring-1 focus:ring-terracotta-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm"
                >
                  Join Newsletter
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-clay-400 space-y-3 sm:space-y-0 relative z-10">
          <p>© {new Date().getFullYear()} Bowls &apos;N&apos; Jars Studio Inc. All handcrafted rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/about" className="hover:text-cream-200 transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-cream-200 transition-colors">Terms of Craft</Link>
            <Link to="/about" className="hover:text-cream-200 transition-colors">Accessibility Statement</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
