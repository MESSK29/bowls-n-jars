import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  IndianRupee, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  RefreshCw,
  Search,
  Truck,
  Sliders,
  Store,
  ArrowUpRight,
  Eye,
  TrendingUp,
  CheckCircle2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { price } from '../utils/currency';
import { useAuthStore } from '../stores/authStore';
import { useStoreConfigStore } from '../stores/storeConfigStore';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { AdminStats, Order, Product, Category } from '../types';
import { AuthModal } from '../components/common/AuthModal';

type AdminTab = 'overview' | 'orders' | 'products' | 'customizer';

export const AdminDashboardPage: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const { config, updateConfig, resetConfig } = useStoreConfigStore();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Search & Filter States
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: 1299,
    compare_at_price: 1499,
    material: 'Stoneware',
    color: 'Terracotta',
    stock: 20,
    category_id: 1,
    image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop',
    is_featured: false,
    is_bestseller: false,
    care_instructions: 'Dishwasher and microwave safe.',
  });

  // Website Customizer Local Form
  const [customizerForm, setCustomizerForm] = useState(config);

  useEffect(() => {
    setCustomizerForm(config);
  }, [config]);

  // View Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchDashboardData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [statsData, ordersData, productsData, categoriesData] = await Promise.all([
        orderService.getAdminStats(),
        orderService.getAllOrders(),
        productService.getProducts({ limit: 100 }),
        productService.getCategories(),
      ]);
      setStats(statsData);
      setOrders(ordersData);
      setProducts(productsData.items);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load admin business data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  // Derived Business Metrics
  const calculatedMetrics = useMemo(() => {
    const totalRevenue = orders.reduce((acc, order) => acc + (order.total_amount || 0), 0);
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

    return {
      totalRevenue: stats?.total_revenue || totalRevenue,
      totalOrders: stats?.total_orders || orders.length,
      completedOrders,
      pendingOrders,
      lowStockCount,
      outOfStockCount,
      avgOrderValue,
      totalProductsCount: products.length
    };
  }, [orders, products, stats]);

  // Filtered Lists
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                            p.description.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCat = selectedCategoryFilter === 'all' || p.category_id?.toString() === selectedCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [products, productSearch, selectedCategoryFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const custName = o.shipping_address?.full_name || '';
      const custCity = o.shipping_address?.city || '';
      const matchesSearch = o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
                            custName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                            custCity.toLowerCase().includes(orderSearch.toLowerCase());
      const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Status Updater
  const handleUpdateOrderStatus = async (orderId: number, newStatus: any) => {
    try {
      const updated = await orderService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
      setSaveSuccessMsg(`Order #${orderId} status updated to ${newStatus}`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  // Stock Quick-adjust
  const handleAdjustStock = async (prod: Product, delta: number) => {
    const newStock = Math.max(0, prod.stock + delta);
    try {
      const updated = await productService.updateProduct(prod.id, { stock: newStock });
      setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, stock: updated.stock } : p));
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  // Product CRUD
  const handleOpenCreateProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      slug: '',
      description: '',
      price: 1299,
      compare_at_price: 1499,
      material: 'Stoneware',
      color: 'Terracotta',
      stock: 25,
      category_id: categories[0]?.id || 1,
      image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop',
      is_featured: false,
      is_bestseller: false,
      care_instructions: 'Dishwasher and microwave safe.',
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductForm({
      name: prod.name,
      slug: prod.slug,
      description: prod.description,
      price: prod.price,
      compare_at_price: prod.compare_at_price || 0,
      material: prod.material || 'Stoneware',
      color: prod.color || 'Terracotta',
      stock: prod.stock,
      category_id: prod.category_id || categories[0]?.id || 1,
      image_url: prod.images[0] || '',
      is_featured: prod.is_featured,
      is_bestseller: prod.is_bestseller,
      care_instructions: prod.care_instructions || '',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: productForm.name,
        slug: productForm.slug || productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: productForm.description,
        price: Number(productForm.price),
        compare_at_price: productForm.compare_at_price ? Number(productForm.compare_at_price) : undefined,
        material: productForm.material,
        color: productForm.color,
        stock: Number(productForm.stock),
        category_id: Number(productForm.category_id),
        images: [productForm.image_url],
        is_featured: productForm.is_featured,
        is_bestseller: productForm.is_bestseller,
        care_instructions: productForm.care_instructions,
      };

      if (editingProductId) {
        const updated = await productService.updateProduct(editingProductId, payload);
        setProducts(prev => prev.map(p => p.id === editingProductId ? updated : p));
        setSaveSuccessMsg(`Product "${updated.name}" updated successfully.`);
      } else {
        const created = await productService.createProduct(payload);
        setProducts(prev => [created, ...prev]);
        setSaveSuccessMsg(`New product "${created.name}" created.`);
      }
      setIsProductModalOpen(false);
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setSaveSuccessMsg(`Product "${name}" deleted.`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleSaveCustomizer = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(customizerForm);
    setSaveSuccessMsg('Website & Store settings updated! Changes are live on the storefront.');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-sand-100">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-warm-lg border border-sand-300 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-clay-900 text-white mx-auto flex items-center justify-center text-2xl font-bold shadow-warm-sm">
            âš™ï¸
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-clay-900">
              Business Admin Portal
            </h2>
            <p className="text-xs text-clay-600 mt-1">
              Restricted management console for Bowls &apos;N&apos; Jars studio directors and store managers.
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-3.5 bg-clay-900 hover:bg-clay-800 text-white rounded-xl text-sm font-semibold shadow-warm-sm transition-all"
          >
            Sign In with Admin Account
          </button>
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      
      {/* Top Business Executive Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-lg">
                ðŸº
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-heading text-lg font-bold text-white tracking-wide">
                    Bowls &apos;N&apos; Jars
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                    Store Manager
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Business Control Center â€¢ India Operations</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs flex items-center space-x-1.5"
                title="Refresh Metrics"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh Data</span>
              </button>

              <Link
                to="/"
                target="_blank"
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition-colors"
              >
                <Store className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Storefront</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
            </div>

          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="border-t border-slate-800/80 bg-slate-900/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shrink-0 ${
                  activeTab === 'overview'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview &amp; Metrics</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shrink-0 ${
                  activeTab === 'orders'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Orders &amp; Fulfilment ({orders.length})</span>
                {calculatedMetrics.pendingOrders > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400 text-[10px]">
                    {calculatedMetrics.pendingOrders}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shrink-0 ${
                  activeTab === 'products'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Product Catalog &amp; Stock ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('customizer')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shrink-0 ${
                  activeTab === 'customizer'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Website Customizer</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Success Notice Banner */}
      {saveSuccessMsg && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{saveSuccessMsg}</span>
            </div>
            <button onClick={() => setSaveSuccessMsg(null)}>
              <X className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Total Revenue */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Total Amount Collected</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {price(calculatedMetrics.totalRevenue)}
                  </h3>
                  <p className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Live Indian Rupee Payments</span>
                  </p>
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Total Orders</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {calculatedMetrics.totalOrders}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {calculatedMetrics.completedOrders} Delivered â€¢ {calculatedMetrics.pendingOrders} Active
                  </p>
                </div>
              </div>

              {/* Average Order Value */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Avg. Order Value (AOV)</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {price(calculatedMetrics.avgOrderValue)}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Across all customer purchases
                  </p>
                </div>
              </div>

              {/* Catalog & Low Stock */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Inventory Status</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {calculatedMetrics.totalProductsCount} SKUs
                  </h3>
                  <p className="text-[11px] text-amber-400 mt-1 flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{calculatedMetrics.lowStockCount} Low stock â€¢ {calculatedMetrics.outOfStockCount} OOS</span>
                  </p>
                </div>
              </div>

            </div>

            {/* Quick Actions & Recent Orders Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Recent Orders Overview */}
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Recent Customer Orders</h3>
                    <p className="text-xs text-slate-400">Live feed of orders placed through the store</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                  >
                    <span>View All</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-slate-400 border-b border-slate-800 pb-2">
                      <tr>
                        <th className="py-2.5 font-medium">Order #</th>
                        <th className="py-2.5 font-medium">Customer</th>
                        <th className="py-2.5 font-medium">Location</th>
                        <th className="py-2.5 font-medium">Amount</th>
                        <th className="py-2.5 font-medium">Status</th>
                        <th className="py-2.5 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 font-mono font-medium text-slate-300">
                            {ord.order_number}
                          </td>
                          <td className="py-3 font-medium text-white">
                            {ord.shipping_address?.full_name || 'Customer'}
                          </td>
                          <td className="py-3 text-slate-400">
                            {ord.shipping_address?.city || 'India'}, {ord.shipping_address?.state || ''}
                          </td>
                          <td className="py-3 font-semibold text-amber-300">
                            {price(ord.total_amount)}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              ord.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                              ord.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                              ord.status === 'processing' ? 'bg-purple-500/20 text-purple-400' :
                              ord.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">
                            No orders recorded yet. Place a test order from the shop!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Management Panel */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-base font-bold text-white mb-2">Store Quick Actions</h3>
                  <p className="text-xs text-slate-400 mb-4">Direct shortcuts to frequent management tasks</p>
                  
                  <div className="space-y-2.5">
                    <button
                      onClick={() => {
                        setActiveTab('products');
                        handleOpenCreateProduct();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Product SKU</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('customizer')}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center space-x-2 transition-colors border border-slate-700"
                    >
                      <Sliders className="w-4 h-4 text-amber-400" />
                      <span>Edit Announcement &amp; Banner</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('orders')}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center space-x-2 transition-colors border border-slate-700"
                    >
                      <Truck className="w-4 h-4 text-blue-400" />
                      <span>Manage Order Dispatches</span>
                    </button>
                  </div>
                </div>

                {/* Low Stock Warning Card */}
                {calculatedMetrics.lowStockCount > 0 && (
                  <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 text-amber-400 mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      <h4 className="text-xs font-bold">Low Inventory Warning</h4>
                    </div>
                    <p className="text-xs text-amber-200/80">
                      {calculatedMetrics.lowStockCount} ceramic products have 5 or fewer units left. Restock or adjust inventory levels in the Products tab.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: ORDERS & FULFILMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Filter & Search Bar */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
              
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Order #, Customer, City..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400">Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-200 py-2 px-3 rounded-xl focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Statuses ({orders.length})</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

            </div>

            {/* Orders Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Order ID</th>
                      <th className="py-3 px-4 font-semibold">Customer Details</th>
                      <th className="py-3 px-4 font-semibold">Address &amp; PIN</th>
                      <th className="py-3 px-4 font-semibold">Items</th>
                      <th className="py-3 px-4 font-semibold">Amount (INR)</th>
                      <th className="py-3 px-4 font-semibold">Order Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-amber-400">
                          {ord.order_number}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-white">{ord.shipping_address?.full_name || 'Customer'}</p>
                          <p className="text-[11px] text-slate-400">{ord.shipping_address?.phone || '+91 98765 43210'}</p>
                        </td>
                        <td className="py-3.5 px-4 max-w-[200px]">
                          <p className="text-slate-300 truncate">{ord.shipping_address?.house_flat} {ord.shipping_address?.street}</p>
                          <p className="text-[11px] text-slate-400">{ord.shipping_address?.city}, {ord.shipping_address?.state} - {ord.shipping_address?.pin_code}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {ord.items?.length || 1} items
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          {price(ord.total_amount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className={`py-1 px-2.5 rounded-lg text-xs font-semibold focus:outline-none border ${
                              ord.status === 'delivered' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                              ord.status === 'shipped' ? 'bg-blue-950 text-blue-400 border-blue-800' :
                              ord.status === 'processing' ? 'bg-purple-950 text-purple-400 border-purple-800' :
                              ord.status === 'cancelled' ? 'bg-red-950 text-red-400 border-red-800' :
                              'bg-amber-950 text-amber-400 border-amber-800'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium inline-flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                          No matching orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: PRODUCT CATALOG & INVENTORY */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            {/* Products Action Bar */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
              
              <div className="flex flex-1 items-center space-x-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search product name, material..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-200 py-2 px-3 rounded-xl focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id.toString()}>{c.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleOpenCreateProduct}
                className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>

            </div>

            {/* Products Grid / Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Product SKU</th>
                      <th className="py-3 px-4 font-semibold">Material / Color</th>
                      <th className="py-3 px-4 font-semibold">Price (â‚¹)</th>
                      <th className="py-3 px-4 font-semibold">Stock Count</th>
                      <th className="py-3 px-4 font-semibold">Badges</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={prod.images[0] || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=200'}
                              alt={prod.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-800 border border-slate-700 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-white line-clamp-1">{prod.name}</p>
                              <p className="text-[11px] font-mono text-slate-400">{prod.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <p>{prod.material || 'Stoneware'}</p>
                          <p className="text-[11px] text-slate-500">{prod.color || 'Earthy'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-white">{price(prod.price)}</p>
                          {prod.compare_at_price && prod.compare_at_price > prod.price && (
                            <p className="text-[10px] text-slate-500 line-through">
                              {price(prod.compare_at_price)}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAdjustStock(prod, -1)}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-xs"
                              title="Decrease stock"
                            >
                              -
                            </button>
                            <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                              prod.stock === 0 ? 'bg-red-950 text-red-400 border border-red-800' :
                              prod.stock <= 5 ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                              'bg-slate-800 text-slate-200'
                            }`}>
                              {prod.stock}
                            </span>
                            <button
                              onClick={() => handleAdjustStock(prod, 1)}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-xs"
                              title="Increase stock"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 space-x-1">
                          {prod.is_featured && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                              Featured
                            </span>
                          )}
                          {prod.is_bestseller && (
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold">
                              Bestseller
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-400 rounded-lg text-xs"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          No products found matching &quot;{productSearch}&quot;.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: WEBSITE & STORE CUSTOMIZER */}
        {activeTab === 'customizer' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            <form onSubmit={handleSaveCustomizer} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              
              <div>
                <h3 className="text-lg font-bold text-white">Website &amp; Brand Settings</h3>
                <p className="text-xs text-slate-400">
                  Manage live announcements, free shipping thresholds, discount promo codes, and brand headers.
                </p>
              </div>

              {/* Announcement Bar Section */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Announcement Bar Messages
                </h4>
                
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Announcement Banner (English)
                  </label>
                  <input
                    type="text"
                    value={customizerForm.announcementText}
                    onChange={(e) => setCustomizerForm({ ...customizerForm, announcementText: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Announcement Banner (Hindi - à¤¹à¤¿à¤¨à¥à¤¦à¥€)
                    </label>
                    <input
                      type="text"
                      value={customizerForm.announcementTextHi}
                      onChange={(e) => setCustomizerForm({ ...customizerForm, announcementTextHi: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Announcement Banner (Telugu - à°¤à±†à°²à±à°—à±)
                    </label>
                    <input
                      type="text"
                      value={customizerForm.announcementTextTe}
                      onChange={(e) => setCustomizerForm({ ...customizerForm, announcementTextTe: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Business Rules Section */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Pricing &amp; Shipping Rules
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Free Shipping Threshold (â‚¹)
                    </label>
                    <input
                      type="number"
                      value={customizerForm.freeShippingThreshold}
                      onChange={(e) => setCustomizerForm({ ...customizerForm, freeShippingThreshold: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Active Promo Coupon Code
                    </label>
                    <input
                      type="text"
                      value={customizerForm.promoCode}
                      onChange={(e) => setCustomizerForm({ ...customizerForm, promoCode: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Promo Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      value={customizerForm.promoDiscountPercent}
                      onChange={(e) => setCustomizerForm({ ...customizerForm, promoDiscountPercent: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Brand & Studio Location Section */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Studio Info &amp; Operations
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Studio Heritage Location
                    </label>
                    <input
                      type="text"
                      value={customizerForm.studioCity}
                      onChange={(e) => setCustomizerForm({ ...customizerForm, studioCity: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Fulfillment Lead Time
                    </label>
                    <input
                      type="text"
                      value={customizerForm.leadTimeDays}
                      onChange={(e) => setCustomizerForm({ ...customizerForm, leadTimeDays: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Customer Care Email
                    </label>
                    <input
                      type="email"
                      value={customizerForm.contactEmail}
                      onChange={(e) => setCustomizerForm({ ...customizerForm, contactEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      WhatsApp / Helpline
                    </label>
                    <input
                      type="text"
                      value={customizerForm.contactPhone}
                      onChange={(e) => setCustomizerForm({ ...customizerForm, contactPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    resetConfig();
                    setSaveSuccessMsg('Settings reset to factory defaults');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Reset Defaults
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-colors"
                >
                  Save Storefront Customizations
                </button>
              </div>

            </form>

          </div>
        )}

      </main>

      {/* PRODUCT ADD/EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 my-8 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingProductId ? 'Edit Product SKU' : 'Add New Ceramic Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Ribbed Stoneware Ramen Bowl"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Price (â‚¹ INR) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Compare Price (â‚¹ MRP)</label>
                  <input
                    type="number"
                    value={productForm.compare_at_price}
                    onChange={(e) => setProductForm({ ...productForm, compare_at_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category *</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Stock Units *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Material</label>
                  <input
                    type="text"
                    value={productForm.material}
                    onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                    placeholder="Stoneware"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Describe the artisanal details, craftsmanship, and specifications..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_featured}
                    onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                    className="rounded text-amber-500 bg-slate-950 border-slate-800"
                  />
                  <span>Featured on Homepage</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_bestseller}
                    onChange={(e) => setProductForm({ ...productForm, is_bestseller: e.target.checked })}
                    className="rounded text-amber-500 bg-slate-950 border-slate-800"
                  />
                  <span>Bestseller Tag</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md"
                >
                  {editingProductId ? 'Update Product' : 'Create Product'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* INSPECT ORDER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Order Details</h3>
                <p className="text-xs font-mono text-amber-400">#{selectedOrder.order_number}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Customer Information</span>
                <p className="font-semibold text-white mt-1">{selectedOrder.shipping_address?.full_name || 'Customer'}</p>
                <p className="text-slate-400">{selectedOrder.shipping_address?.phone || '+91 98200 54321'}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Indian Delivery Address</span>
                <p className="text-slate-200 mt-1">{selectedOrder.shipping_address?.house_flat} {selectedOrder.shipping_address?.street}</p>
                {selectedOrder.shipping_address?.landmark && (
                  <p className="text-slate-400">Landmark: {selectedOrder.shipping_address?.landmark}</p>
                )}
                <p className="text-slate-400">{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pin_code}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Purchased Items</span>
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-slate-300">
                    <div>
                      <p className="font-medium text-white">{item.product_name}</p>
                      <p className="text-[11px] text-slate-500">Qty: {item.quantity} Ã— {price(item.price)}</p>
                    </div>
                    <span className="font-bold text-amber-300">{price(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-400 font-medium">Total Amount Collected:</span>
                <span className="text-base font-bold text-white">{price(selectedOrder.total_amount)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
