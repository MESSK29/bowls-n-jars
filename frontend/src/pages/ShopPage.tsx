import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  X, 
  SlidersHorizontal, 
  Search, 
} from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { PotterySkeleton } from '../components/common/PotterySkeleton';
import { productService } from '../services/productService';
import { useSound } from '../hooks/useSound';
import { useLanguage } from '../context/LanguageContext';
import { Product, Category } from '../types';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { playTap } = useSound();
  const { t } = useLanguage();

  // State from URL or defaults
  const currentCategory = searchParams.get('category') || 'all';
  const currentMaterial = searchParams.get('material') || 'all';
  const currentColor = searchParams.get('color') || 'all';
  const currentSort = searchParams.get('sort') || 'popular';
  const searchQuery = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Price range state
  const [minPrice, setMinPrice] = useState<number | undefined>(
    searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined
  );
  const [maxPrice, setMaxPrice] = useState<number | undefined>(
    searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined
  );

  const materials = ['Stoneware', 'Terracotta', 'Porcelain', 'Canvas', 'Stainless Steel'];
  const colors = ['Cream', 'Terracotta', 'Sand', 'Sage', 'Clay'];

  // Fetch categories on mount
  useEffect(() => {
    productService.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch products whenever params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productService.getProducts({
          category: currentCategory === 'all' ? undefined : currentCategory,
          material: currentMaterial === 'all' ? undefined : currentMaterial,
          color: currentColor === 'all' ? undefined : currentColor,
          sort: currentSort,
          q: searchQuery || undefined,
          min_price: minPrice,
          max_price: maxPrice,
          page: currentPage,
          limit: 12,
        });
        setProducts(res.items);
        setTotal(res.total);
        setTotalPages(res.pages);
      } catch (err) {
        console.error('Error fetching products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentCategory, currentMaterial, currentColor, currentSort, searchQuery, minPrice, maxPrice, currentPage]);

  const updateParam = (key: string, value: string | null) => {
    playTap();
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter
    setSearchParams(newParams);
  };

  const handleClearAll = () => {
    playTap();
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    currentCategory !== 'all' ||
    currentMaterial !== 'all' ||
    currentColor !== 'all' ||
    !!searchQuery ||
    minPrice !== undefined ||
    maxPrice !== undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header & Page Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-sand-300 pb-6 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600 block mb-1">
            Handcrafted Catalog
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-clay-900">
            {currentCategory === 'ceramics-kitchenware'
              ? 'Ceramics & Kitchenware'
              : currentCategory === 'school-workspace-essentials'
              ? 'School & Workspace Essentials'
              : 'The Everyday Collection'}
          </h1>
          <p className="text-xs sm:text-sm text-clay-600 mt-1">
            Discover slow-made stoneware and purposeful school &amp; desk tools.
          </p>
        </div>

        {/* Search bar & Mobile filter button */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-clay-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder={t('nav.search_placeholder', 'Search products...')}
              className="w-full pl-9 pr-4 py-2 bg-white border border-sand-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400"
            />
          </div>

          <button
            onClick={() => {
              playTap();
              setIsMobileFilterOpen(!isMobileFilterOpen);
            }}
            className="lg:hidden px-4 py-2 bg-white border border-sand-300 rounded-xl text-xs font-semibold text-clay-800 flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4 text-terracotta-600" />
            <span>{t('shop.filters', 'Filters')}</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* DESKTOP FILTERS SIDEBAR */}
        <div className="hidden lg:block space-y-6 bg-white/70 p-6 rounded-3xl border border-sand-200 shadow-warm-sm h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-sand-200">
            <h3 className="font-heading text-lg font-bold text-clay-900 flex items-center space-x-2">
              <Filter className="w-4 h-4 text-terracotta-600" />
              <span>{t('shop.filters', 'Filters')}</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleClearAll}
                className="text-xs text-terracotta-600 hover:text-terracotta-800 font-semibold"
              >
                {t('shop.clear_all', 'Clear All')}
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-clay-800 uppercase tracking-wider block">
              Categories
            </label>
            <div className="space-y-1.5">
              <button
                onClick={() => updateParam('category', 'all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  currentCategory === 'all'
                    ? 'bg-terracotta-50 text-terracotta-700 font-semibold'
                    : 'text-clay-600 hover:bg-sand-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam('category', cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    currentCategory === cat.slug
                      ? 'bg-terracotta-50 text-terracotta-700 font-semibold'
                      : 'text-clay-600 hover:bg-sand-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Materials */}
          <div className="space-y-3 pt-4 border-t border-sand-200">
            <label className="text-xs font-bold text-clay-800 uppercase tracking-wider block">
              {t('shop.materials', 'Material')}
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => updateParam('material', 'all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  currentMaterial === 'all'
                    ? 'bg-clay-800 text-white border-clay-800'
                    : 'bg-white text-clay-700 border-sand-300 hover:bg-sand-100'
                }`}
              >
                All
              </button>
              {materials.map((mat) => (
                <button
                  key={mat}
                  onClick={() => updateParam('material', mat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    currentMaterial === mat
                      ? 'bg-terracotta-500 text-white border-terracotta-500'
                      : 'bg-white text-clay-700 border-sand-300 hover:bg-sand-100'
                  }`}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palettes */}
          <div className="space-y-3 pt-4 border-t border-sand-200">
            <label className="text-xs font-bold text-clay-800 uppercase tracking-wider block">
              {t('shop.colors', 'Color Palette')}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateParam('color', 'all')}
                className={`px-3 py-1 rounded-lg text-xs border font-medium ${
                  currentColor === 'all'
                    ? 'bg-clay-800 text-white border-clay-800'
                    : 'bg-white text-clay-700 border-sand-300'
                }`}
              >
                All
              </button>
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => updateParam('color', c)}
                  className={`px-3 py-1 rounded-lg text-xs border font-medium ${
                    currentColor === c
                      ? 'bg-terracotta-500 text-white border-terracotta-500'
                      : 'bg-white text-clay-700 border-sand-300 hover:bg-sand-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3 pt-4 border-t border-sand-200">
            <label className="text-xs font-bold text-clay-800 uppercase tracking-wider block">
              Price Range
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-clay-400">₹</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice ?? ''}
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full pl-6 pr-2 py-1.5 bg-white border border-sand-300 rounded-lg text-xs"
                />
              </div>
              <span className="text-clay-400 text-xs">to</span>
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-clay-400">₹</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice ?? ''}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full pl-6 pr-2 py-1.5 bg-white border border-sand-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE FILTER MODAL / DRAWER */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-clay-900/50 backdrop-blur-xs flex justify-end lg:hidden">
            <div className="w-80 bg-cream-100 h-full p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between border-b border-sand-300 pb-4">
                <h3 className="font-heading text-lg font-bold text-clay-900">Filters</h3>
                <button onClick={() => setIsMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-clay-600" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <label className="text-xs font-bold text-clay-800 uppercase block mb-2">Category</label>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      updateParam('category', 'all');
                      setIsMobileFilterOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-sand-200"
                  >
                    All
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        updateParam('category', c.slug);
                        setIsMobileFilterOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-sand-200"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  handleClearAll();
                  setIsMobileFilterOpen(false);
                }}
                className="w-full py-2.5 bg-terracotta-500 text-white rounded-xl text-xs font-semibold"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* PRODUCT GRID SECTION */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Sorting & Result Count Bar */}
          <div className="flex items-center justify-between bg-white/60 p-4 rounded-2xl border border-sand-200 text-xs text-clay-600">
            <span>
              Showing <strong className="text-clay-900 font-semibold">{products.length}</strong> of{' '}
              <strong className="text-clay-900 font-semibold">{total}</strong> handcrafted pieces
            </span>

            <div className="flex items-center space-x-2">
              <span className="hidden sm:inline font-medium text-clay-700">Sort By:</span>
              <select
                value={currentSort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="bg-white border border-sand-300 rounded-xl px-3 py-1.5 text-xs font-medium text-clay-800 focus:outline-none focus:ring-1 focus:ring-terracotta-400"
              >
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-clay-500 font-medium">Active filters:</span>
              {currentCategory !== 'all' && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-sand-200 rounded-lg text-xs font-medium text-clay-800">
                  <span>Category: {currentCategory}</span>
                  <button onClick={() => updateParam('category', 'all')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {currentMaterial !== 'all' && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-sand-200 rounded-lg text-xs font-medium text-clay-800">
                  <span>Material: {currentMaterial}</span>
                  <button onClick={() => updateParam('material', 'all')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {currentColor !== 'all' && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-sand-200 rounded-lg text-xs font-medium text-clay-800">
                  <span>Color: {currentColor}</span>
                  <button onClick={() => updateParam('color', 'all')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-sand-200 rounded-lg text-xs font-medium text-clay-800">
                  <span>Query: &ldquo;{searchQuery}&rdquo;</span>
                  <button onClick={() => updateParam('q', null)}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={handleClearAll}
                className="text-xs text-terracotta-600 underline font-semibold ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Products Grid with PotterySkeleton Loader */}
          {loading ? (
            <PotterySkeleton count={6} />
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-sand-200 space-y-4">
              <span className="text-4xl">🏺</span>
              <h3 className="font-heading text-xl font-bold text-clay-900">
                No Handcrafted Items Found
              </h3>
              <p className="text-xs sm:text-sm text-clay-500 max-w-md mx-auto">
                We couldn&apos;t find any objects matching your selected filters. Try broadening your criteria or reset all filters.
              </p>
              <button
                onClick={handleClearAll}
                className="px-6 py-2.5 bg-terracotta-500 text-white rounded-xl text-xs font-semibold shadow-warm-sm active:scale-95 transition-all"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-8">
              {[...Array(totalPages)].map((_, idx) => {
                const pageNumber = idx + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => updateParam('page', String(pageNumber))}
                    className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${
                      currentPage === pageNumber
                        ? 'bg-terracotta-500 text-white shadow-warm-sm scale-105'
                        : 'bg-white text-clay-700 border border-sand-300 hover:bg-sand-100 active:scale-95'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
