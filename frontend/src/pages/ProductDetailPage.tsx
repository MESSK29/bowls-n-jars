import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Heart, 
  Check, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Plus, 
  Minus, 
  Star,
  ChevronRight,
} from 'lucide-react';
import { productService } from '../services/productService';
import { ProductDetail, Product } from '../types';
import { RatingStars } from '../components/common/RatingStars';
import { ProductCard } from '../components/product/ProductCard';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';
import { useSound } from '../hooks/useSound';
import { useFlyingCart } from '../components/common/FlyingCartThumbnail';
import { useToast } from '../components/common/Toast';
import { LUXURY_EASE } from '../utils/motion';
import { price, savings } from '../utils/currency';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const mainImageRef = useRef<HTMLDivElement>(null);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'care'>('desc');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const { addToCart } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const { playTap, playClink, playGlazeChime } = useSound();
  const { triggerFlyToCart } = useFlyingCart();
  const { showToast } = useToast();

  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await productService.getProduct(slug);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }
        
        // Fetch related products from same category
        if (data.category_id) {
          const rel = await productService.getProducts({ limit: 4 });
          setRelatedProducts(rel.items.filter((p) => p.id !== data.id).slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load product detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="animate-spin text-4xl inline-block">🏺</div>
        <p className="text-xs text-clay-500 font-medium">Unpacking handcrafted stoneware from studio kiln...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-heading text-2xl font-bold text-clay-900">Piece Not Found</h2>
        <p className="text-xs text-clay-500">The product you are looking for may have been archived.</p>
        <Link to="/shop" className="inline-block px-6 py-2.5 bg-terracotta-500 text-white rounded-xl text-xs font-semibold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = () => {
    playClink();
    if (mainImageRef.current) {
      triggerFlyToCart(selectedImage || product.images[0], mainImageRef.current);
    }
    addToCart(product, quantity, product.color);
    setAdded(true);

    showToast({
      title: 'Added to Basket',
      description: `${quantity}x ${product.name} ready for checkout.`,
      type: 'success',
      duration: 3500,
    });

    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleWishlist = () => {
    playTap();
    toggleWishlist(product);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !product) return;
    setReviewSubmitting(true);
    try {
      const rev = await productService.submitReview(product.id, {
        rating: newRating,
        comment: newComment,
      });
      setProduct({
        ...product,
        reviews: [rev, ...product.reviews],
        review_count: product.review_count + 1,
      });
      setNewComment('');
      setReviewSuccess(true);
      playGlazeChime();

      showToast({
        title: 'Review Published',
        description: 'Thank you for documenting your experience with this studio piece.',
        type: 'success',
      });

      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to submit review', err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-clay-500">
        <Link to="/" onClick={playTap} className="hover:text-clay-800">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-sand-300" />
        <Link to="/shop" onClick={playTap} className="hover:text-clay-800">Shop</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-sand-300" />
            <Link to={`/shop?category=${product.category.slug}`} onClick={playTap} className="hover:text-clay-800">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-sand-300" />
        <span className="text-clay-800 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div
            ref={mainImageRef}
            className="aspect-square sm:aspect-4/3 w-full rounded-3xl overflow-hidden bg-sand-100 border border-sand-300 shadow-warm-md relative group"
          >
            <motion.img
              key={selectedImage}
              initial={{ opacity: 0.85, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: LUXURY_EASE }}
              src={selectedImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700"
            />
            {product.is_bestseller && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-terracotta-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm">
                Studio Bestseller
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => {
                    playTap();
                    setSelectedImage(imgUrl);
                  }}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === imgUrl
                      ? 'border-terracotta-500 scale-95 shadow-sm ring-2 ring-terracotta-200'
                      : 'border-sand-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Purchase Options */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-clay-500 mb-2">
              <span className="uppercase tracking-widest font-semibold text-terracotta-600">
                {product.material}
              </span>
              <span className="text-sage-700 font-medium bg-sage-100 px-2.5 py-0.5 rounded-full">
                {product.stock > 5 ? 'In Stock (Ready to dispatch)' : `Only ${product.stock} pieces left`}
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-clay-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center space-x-3 mt-3">
              <RatingStars rating={product.rating} reviewCount={product.review_count} size="md" />
              <span className="text-sand-300">•</span>
              <a href="#reviews" onClick={playTap} className="text-xs text-clay-500 hover:text-clay-800 underline">
                Read {product.review_count} reviews
              </a>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline space-x-3 pt-2">
            <span className="text-3xl font-bold text-clay-900">
              {price(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <>
                <span className="text-base text-clay-400 line-through">
                  {price(product.compare_at_price)}
                </span>
                <span className="px-2 py-0.5 bg-sage-100 text-sage-800 text-xs font-bold rounded-md">
                  {savings(product.compare_at_price, product.price)}
                </span>
              </>
            )}
          </div>

          <p className="text-xs sm:text-sm text-clay-600 leading-relaxed">
            {product.description}
          </p>

          {/* Attributes breakdown */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-sand-100/70 rounded-2xl border border-sand-200 text-xs text-clay-700">
            {product.dimensions && (
              <div>
                <span className="text-clay-400 block text-[11px]">Dimensions:</span>
                <span className="font-semibold">{product.dimensions}</span>
              </div>
            )}
            {product.capacity && (
              <div>
                <span className="text-clay-400 block text-[11px]">Capacity:</span>
                <span className="font-semibold">{product.capacity}</span>
              </div>
            )}
            {product.color && (
              <div>
                <span className="text-clay-400 block text-[11px]">Signature Finish:</span>
                <span className="font-semibold">{product.color}</span>
              </div>
            )}
            <div>
              <span className="text-clay-400 block text-[11px]">Food &amp; Beverage:</span>
              <span className="font-semibold text-sage-700">100% Non-Toxic</span>
            </div>
          </div>

          {/* Quantity & Add to Cart Controls */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-4">
              {/* Quantity selector */}
              <div className="flex items-center border border-sand-300 rounded-2xl bg-white overflow-hidden shadow-xs">
                <button
                  onClick={() => {
                    playTap();
                    setQuantity(Math.max(1, quantity - 1));
                  }}
                  className="p-3 text-clay-600 hover:bg-sand-100 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-clay-900 min-w-[32px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    playTap();
                    setQuantity(quantity + 1);
                  }}
                  className="p-3 text-clay-600 hover:bg-sand-100 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-sm flex items-center justify-center space-x-2 shadow-warm-md hover:shadow-warm-lg active:scale-98 transition-all ${
                  added
                    ? 'bg-sage-600 text-white'
                    : 'bg-terracotta-500 hover:bg-terracotta-600 text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Your Basket!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-terracotta-200" />
                    <span>Add to Basket • {price(product.price * quantity)}</span>
                  </>
                )}
              </button>

              {/* Wishlist button */}
              <button
                onClick={handleToggleWishlist}
                aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
                className={`p-4 rounded-2xl border transition-all active:scale-95 ${
                  isFavorited
                    ? 'bg-red-50 text-red-500 border-red-200 shadow-xs'
                    : 'bg-white text-clay-700 border-sand-300 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Value propositions */}
          <div className="pt-4 border-t border-sand-200 space-y-2 text-xs text-clay-600">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-terracotta-500" />
              <span>Complimentary shipping on orders over $60</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-sage-600" />
              <span>Safe-arrival ceramic guarantee: Free replacement if damaged</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-ochre-500" />
              <span>30-day effortless returns for studio items</span>
            </div>
          </div>
        </div>

      </div>

      {/* Tabs: Specifications & Care */}
      <div className="pt-8 border-t border-sand-300">
        <div className="flex border-b border-sand-300 space-x-8 text-sm font-semibold">
          <button
            onClick={() => {
              playTap();
              setActiveTab('desc');
            }}
            className={`pb-3 relative transition-colors ${
              activeTab === 'desc'
                ? 'text-terracotta-600 border-b-2 border-terracotta-500'
                : 'text-clay-500 hover:text-clay-800'
            }`}
          >
            Craftsmanship &amp; Story
          </button>
          <button
            onClick={() => {
              playTap();
              setActiveTab('specs');
            }}
            className={`pb-3 relative transition-colors ${
              activeTab === 'specs'
                ? 'text-terracotta-600 border-b-2 border-terracotta-500'
                : 'text-clay-500 hover:text-clay-800'
            }`}
          >
            Materials &amp; Dimensions
          </button>
          <button
            onClick={() => {
              playTap();
              setActiveTab('care');
            }}
            className={`pb-3 relative transition-colors ${
              activeTab === 'care'
                ? 'text-terracotta-600 border-b-2 border-terracotta-500'
                : 'text-clay-500 hover:text-clay-800'
            }`}
          >
            Care Instructions
          </button>
        </div>

        <div className="py-6 text-sm text-clay-700 leading-relaxed max-w-3xl">
          {activeTab === 'desc' && (
            <div className="space-y-3">
              <p>
                Each piece in the Bowls &apos;N&apos; Jars collection is individually thrown or cast in our small studio batch sessions. We embrace subtle variations in glaze pooling, speckle distribution, and raw edge texture — hallmarks of genuine handcraft.
              </p>
              <p>
                Crafted to transition seamlessly from your kitchen table to your workspace, bringing grounding tactile comfort to everyday living.
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-2">
              <p><strong>Primary Material:</strong> {product.material || 'Stoneware'}</p>
              <p><strong>Dimensions:</strong> {product.dimensions || 'Standard artisanal sizing'}</p>
              <p><strong>Capacity / Volume:</strong> {product.capacity || 'Refer to dimensions'}</p>
              <p><strong>Glaze:</strong> Food-grade, 100% lead-free, cadmium-free matte glaze.</p>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-3">
              <p>
                {product.care_instructions ||
                  'Dishwasher and microwave safe. To prolong the life of your ceramic piece, avoid exposing it to extreme thermal shocks (such as transferring straight from a freezing refrigerator into a boiling oven).'}
              </p>
              <p className="text-xs text-clay-500 italic">
                For items containing cork or waxed canvas, spot clean with a damp cloth and mild soap.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section id="reviews" className="pt-8 border-t border-sand-300 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-clay-900">
              Customer Reviews ({product.review_count})
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <RatingStars rating={product.rating} reviewCount={product.review_count} size="md" />
              <span className="text-xs text-clay-500">Based on verified collector feedback</span>
            </div>
          </div>
        </div>

        {/* Submit Review Form */}
        <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-warm-sm max-w-2xl">
          <h3 className="font-heading text-base font-bold text-clay-900 mb-3">
            Share Your Experience with this Piece
          </h3>

          {reviewSuccess && (
            <div className="mb-4 p-3 bg-sage-100 text-sage-800 rounded-xl text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 text-sage-600" />
              <span>Thank you! Your review has been added to our studio record.</span>
            </div>
          )}

          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-clay-700 mb-1">
                  Overall Rating
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => {
                        playTap();
                        setNewRating(star);
                      }}
                      className="p-1 text-ochre-500 hover:scale-110 active:scale-95 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newRating ? 'fill-ochre-500 text-ochre-500' : 'text-sand-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-clay-700 mb-1">
                  Your Review Comments
                </label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="How does it feel in your hands? How does the glaze look in natural light?"
                  className="w-full p-3 bg-cream-50 border border-sand-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="px-6 py-2.5 bg-clay-800 hover:bg-clay-900 active:scale-95 text-cream-50 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {reviewSubmitting ? 'Posting...' : 'Submit Verified Review'}
              </button>
            </form>
          ) : (
            <div className="p-4 bg-sand-100 rounded-2xl text-xs text-clay-600 flex items-center justify-between">
              <span>Please sign in with your customer account to submit a verified review.</span>
              <span className="font-semibold text-terracotta-600">Click &ldquo;Sign In&rdquo; in navigation</span>
            </div>
          )}
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4 max-w-3xl">
          {product.reviews.length === 0 ? (
            <p className="text-xs text-clay-500 italic">
              Be the first to review this artisanal creation!
            </p>
          ) : (
            product.reviews.map((rev) => (
              <div key={rev.id} className="p-5 bg-white rounded-2xl border border-sand-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-sand-200 text-clay-800 font-bold text-xs flex items-center justify-center">
                      {rev.user_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-clay-900">{rev.user_name}</h4>
                      <span className="text-[10px] text-sage-700 font-semibold flex items-center space-x-1">
                        <Check className="w-2.5 h-2.5" />
                        <span>Verified Studio Collector</span>
                      </span>
                    </div>
                  </div>
                  <RatingStars rating={rev.rating} showCount={false} size="sm" />
                </div>
                <p className="text-xs text-clay-700 leading-relaxed pt-1">
                  {rev.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-sand-300 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold text-clay-900">
              Pairs Well With
            </h2>
            <Link to="/shop" onClick={playTap} className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700">
              View Entire Collection →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
