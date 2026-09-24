import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Leaf, 
  Flame, 
  Award, 
  ChevronRight,
  Star,
  CheckCircle2
} from 'lucide-react';
import { productService } from '../services/productService';
import { Product } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { PotterySkeleton } from '../components/common/PotterySkeleton';
import { AnimatedSection } from '../components/common/AnimatedSection';
import { useSound } from '../hooks/useSound';
import { useLanguage } from '../context/LanguageContext';
import { useStoreConfigStore } from '../stores/storeConfigStore';

export const HomePage: React.FC = () => {
  const { playTap } = useSound();
  const { t, language } = useLanguage();
  const { config } = useStoreConfigStore();

  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [bestResp, featResp] = await Promise.all([
          productService.getProducts({ bestseller: true, limit: 4 }),
          productService.getProducts({ featured: true, limit: 4 }),
        ]);
        setBestsellers(bestResp.items);
        setFeaturedProducts(featResp.items);
      } catch (err) {
        console.error('Failed to load home page products', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-12 sm:space-y-20 lg:space-y-24 pb-12 sm:pb-16 overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-4 sm:pt-10 pb-6 sm:pb-14 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            
            {/* Left Narrative Column */}
            <AnimatedSection direction="up" className="lg:col-span-7 space-y-4 sm:space-y-6">
              
              {/* Studio Origin Pill */}
              <div className="inline-flex items-center space-x-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-sand-200 border border-sand-300 text-[11px] sm:text-xs font-semibold text-clay-700">
                <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-pulse" />
                <span>{config.heroBadgeText || t('hero.badge')}</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-1 sm:space-y-2">
                <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-clay-900 leading-[1.15] break-words">
                  {t('hero.title_1')}{' '}
                  <span className="italic font-normal font-serif text-terracotta-600 block sm:inline">
                    {t('hero.title_2')}
                  </span>
                </h1>
              </div>

              {/* Subtext */}
              <p className="text-sm sm:text-base lg:text-lg text-clay-600 max-w-xl leading-relaxed">
                {t('hero.description')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-1 sm:pt-2">
                <Link
                  to="/shop"
                  onClick={playTap}
                  className="min-h-[48px] px-6 sm:px-8 py-3.5 sm:py-4 bg-terracotta-500 hover:bg-terracotta-600 active:scale-98 text-white rounded-2xl font-bold text-sm text-center shadow-warm-md hover:shadow-warm-lg transition-all flex items-center justify-center"
                >
                  {t('hero.cta_shop')}
                </Link>
                <Link
                  to="/about"
                  onClick={playTap}
                  className="min-h-[48px] px-6 sm:px-8 py-3.5 sm:py-4 bg-white/90 hover:bg-white text-clay-800 border border-sand-300 rounded-2xl font-semibold text-sm text-center shadow-warm-xs transition-all flex items-center justify-center"
                >
                  {t('hero.cta_story')}
                </Link>
              </div>

              {/* Customer Rating Bar */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-3 sm:pt-4 text-xs font-medium text-clay-600 border-t border-sand-300/80">
                <div className="flex items-center space-x-1 text-ochre-600">
                  <Star className="w-4 h-4 fill-ochre-500 text-ochre-500" />
                  <span className="font-bold text-clay-900">4.9/5</span>
                  <span className="text-clay-500 font-normal">Rating</span>
                </div>
                <span className="text-sand-300">•</span>
                <span>Pan-India Delivery</span>
                <span className="text-sand-300">•</span>
                <span>Zero Plastic Pack</span>
              </div>
            </AnimatedSection>

            {/* Right Hero Image Column */}
            <AnimatedSection direction="up" delay={0.15} className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
                <div className="rounded-3xl overflow-hidden shadow-warm-lg border border-sand-300 bg-sand-200 aspect-4/3 sm:aspect-4/5 relative">
                  <img
                    src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1000&auto=format&fit=crop"
                    alt="Handcrafted ceramic bowls on rustic tabletop"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-clay-900/75 via-transparent to-transparent" />
                  
                  {/* Bottom Image Caption */}
                  <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white">
                    <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-terracotta-500/90 backdrop-blur-md rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-1.5 sm:mb-2 inline-block">
                      Jaipur &amp; Khurja Crafts
                    </span>
                    <h3 className="font-heading text-lg sm:text-2xl font-bold">
                      The Earth &amp; Stone Series
                    </h3>
                    <p className="text-[11px] sm:text-xs text-cream-200 mt-0.5 sm:mt-1 opacity-90 line-clamp-2">
                      Ribbed bowls, airtight spice jars, and tactile espresso duos.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

          </div>
        </div>
      </section>

      {/* 2. GROUNDED ARTISANAL TRUST PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="bg-white/80 p-4 sm:p-5 rounded-2xl border border-sand-300 shadow-warm-xs flex items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-clay-900">{t('pillar.lead_free')}</p>
              <p className="text-[11px] text-clay-500">{t('pillar.lead_free_sub')}</p>
            </div>
          </div>

          <div className="bg-white/80 p-4 sm:p-5 rounded-2xl border border-sand-300 shadow-warm-xs flex items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-clay-900">{t('pillar.high_fired')}</p>
              <p className="text-[11px] text-clay-500">{t('pillar.high_fired_sub')}</p>
            </div>
          </div>

          <div className="bg-white/80 p-4 sm:p-5 rounded-2xl border border-sand-300 shadow-warm-xs flex items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-sand-200 text-clay-700 flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-clay-900">{t('pillar.sustainable')}</p>
              <p className="text-[11px] text-clay-500">{t('pillar.sustainable_sub')}</p>
            </div>
          </div>

          <div className="bg-white/80 p-4 sm:p-5 rounded-2xl border border-sand-300 shadow-warm-xs flex items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-ochre-100 text-ochre-700 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-clay-900">{t('pillar.artisans')}</p>
              <p className="text-[11px] text-clay-500">{t('pillar.artisans_sub')}</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. DUAL COLLECTION BENTO */}
      <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600 block mb-1.5 sm:mb-2">
            {t('home.curated_lines')}
          </span>
          <h2 className="font-heading text-2xl sm:text-4xl font-bold text-clay-900">
            {t('home.curated_title')}
          </h2>
          <p className="text-xs sm:text-sm text-clay-600 mt-1.5 sm:mt-2">
            {t('home.curated_sub')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Collection 1: Ceramics */}
          <Link
            to="/shop?category=ceramics-kitchenware"
            onClick={playTap}
            className="group relative rounded-3xl overflow-hidden aspect-4/3 sm:aspect-16/10 border border-sand-300 shadow-warm-sm hover:shadow-warm-md transition-all duration-300 block"
          >
            <img
              src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1000&auto=format&fit=crop"
              alt="Handmade Ceramic Kitchenware"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-clay-900/85 via-clay-900/30 to-transparent" />
            <div className="absolute bottom-5 sm:bottom-8 left-5 sm:left-8 right-5 sm:right-8 text-white">
              <span className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-terracotta-300 mb-1 block">
                Artisanal Pottery
              </span>
              <h3 className="font-heading text-xl sm:text-3xl font-bold mb-1.5 sm:mb-2">
                Ceramics &amp; Kitchenware
              </h3>
              <p className="text-[11px] sm:text-sm text-cream-200 line-clamp-2 max-w-md opacity-90 mb-3 sm:mb-4">
                Wheel-thrown bowls, spice jars, pickle pots, and terracotta serveware crafted for soulful dining.
              </p>
              <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-white group-hover:text-terracotta-300 transition-colors">
                <span>Shop Ceramics Collection</span>
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          {/* Collection 2: School & Workspace */}
          <Link
            to="/shop?category=school-workspace-essentials"
            onClick={playTap}
            className="group relative rounded-3xl overflow-hidden aspect-4/3 sm:aspect-16/10 border border-sand-300 shadow-warm-sm hover:shadow-warm-md transition-all duration-300 block"
          >
            <img
              src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop"
              alt="School and Workspace Essentials"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-clay-900/85 via-clay-900/30 to-transparent" />
            <div className="absolute bottom-5 sm:bottom-8 left-5 sm:left-8 right-5 sm:right-8 text-white">
              <span className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-sage-300 mb-1 block">
                Tactile Workspace
              </span>
              <h3 className="font-heading text-xl sm:text-3xl font-bold mb-1.5 sm:mb-2">
                School &amp; Workspace Essentials
              </h3>
              <p className="text-[11px] sm:text-sm text-cream-200 line-clamp-2 max-w-md opacity-90 mb-3 sm:mb-4">
                Ceramic-coated bento lunchboxes, organic canvas pouches, copper &amp; steel bottles, and stoneware desk sets.
              </p>
              <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-white group-hover:text-sage-300 transition-colors">
                <span>Shop Workspace Essentials</span>
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

        </div>
      </AnimatedSection>

      {/* 4. BEST SELLERS SECTION (2 cols mobile -> 3 cols tablet -> 4 cols desktop) */}
      <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-sand-300">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-terracotta-600 block mb-1">
              Customer Favorites
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-clay-900">
              {t('home.bestsellers')}
            </h2>
          </div>
          <Link
            to="/shop?sort=popular"
            onClick={playTap}
            className="min-h-[44px] flex items-center mt-2 sm:mt-0 text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 space-x-1"
          >
            <span>{t('home.view_all_bestsellers')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <PotterySkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {bestsellers.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </AnimatedSection>

      {/* 5. BRAND HERITAGE STORY SECTION */}
      <AnimatedSection className="bg-sand-100 py-12 sm:py-20 lg:py-24 border-y border-sand-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            
            <div className="lg:col-span-6">
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden aspect-4/3 shadow-warm-md border border-sand-300">
                <img
                  src="https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?q=80&w=1000&auto=format&fit=crop"
                  alt="Master potter shaping wet clay on the wheel"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4 sm:space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600 block">
                The Bowls &apos;N&apos; Jars Philosophy
              </span>

              <h2 className="font-heading text-2xl sm:text-4xl font-bold text-clay-900 leading-tight">
                Slow, tactile objects in an age of disposable speed.
              </h2>

              <p className="text-xs sm:text-sm text-clay-600 leading-relaxed">
                We started Bowls &apos;N&apos; Jars in partnership with multigenerational artisan clusters across Jaipur and Khurja with a single conviction: everyday kitchen and study wares should tell an authentic story of patience, soil, and human hands.
              </p>

              <p className="text-xs sm:text-sm text-clay-600 leading-relaxed">
                When you hold one of our ribbed bowls or unpack lunch from our ceramic-lined bento box, you feel the honest density of natural stoneware and the gentle fingerprint ridges of the master potter.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                <div className="p-3.5 sm:p-4 bg-white/90 rounded-2xl border border-sand-300">
                  <h4 className="font-heading text-sm sm:text-base font-bold text-clay-900">Jaipur &amp; Khurja</h4>
                  <p className="text-[11px] sm:text-xs text-clay-500 mt-1">Direct fair-trade partnership with Indian master potters.</p>
                </div>
                <div className="p-3.5 sm:p-4 bg-white/90 rounded-2xl border border-sand-300">
                  <h4 className="font-heading text-sm sm:text-base font-bold text-clay-900">Zero Plastic</h4>
                  <p className="text-[11px] sm:text-xs text-clay-500 mt-1">100% recyclable, biodegradable honeycomb cushioning.</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/about"
                  onClick={playTap}
                  className="min-h-[44px] inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-terracotta-600 hover:text-terracotta-700"
                >
                  <span>Read our full craftsmanship journey</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </AnimatedSection>

      {/* 6. NEW STUDIO ADDITIONS (2 cols mobile -> 3 cols tablet -> 4 cols desktop) */}
      <AnimatedSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-sand-300">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-sage-600 block mb-1">
              Curator&apos;s Selection
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-clay-900">
              {t('home.new_additions')}
            </h2>
          </div>
          <Link
            to="/shop"
            onClick={playTap}
            className="min-h-[44px] flex items-center mt-2 sm:mt-0 text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 space-x-1"
          >
            <span>{t('home.explore_shop')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </AnimatedSection>

    </div>
  );
};
