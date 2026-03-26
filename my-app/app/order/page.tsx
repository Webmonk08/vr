'use client'
import {ShoppingBag, User, Package, Search, Truck, Clock, CheckCircle, XCircle, Eye, Download, Warehouse, Plus, ArrowRight, Edit2, X, Box, TrendingUp, User2, ShoppingBagIcon } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import UserManagementPage from '@/component/user-management'
import ProductManagement from '@/component/product-management';
import withAuth from '@/component/withAuth';

interface OrderManagementPageProps {
  onNavigate: (page: string) => void;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  products: {
    id: string;
    name: string;
    variant: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  orderDate: string;
  deliveryDate?: string;
  storage?: string;
}

interface StorageUnit {
  id: string;
  name: string;
  location: string;
  products: {
    productId: string;
    productName: string;
    variant: string;
    quantity: number;
    image: string;
  }[];
}

function OrderManagementPage({ onNavigate }: OrderManagementPageProps) {
  const [activeSection, setActiveSection] = useState<'orders' | 'storage' | 'users'|'product'>('orders');
  const [orderTab, setOrderTab] = useState<'pending' | 'history'>('pending');
  const {role} = useAuthStore()
  // Orders State
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-001',
      orderNumber: 'RH-2025-001',
      customer: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, Green Valley, CA 94000'
      },
      products: [
        {
          id: 'PROD-001',
          name: 'Premium Jasmine Rice',
          variant: '5kg',
          quantity: 2,
          price: 24.99,
          image: 'https://images.unsplash.com/photo-1686820740687-426a7b9b2043?w=300'
        },
        {
          id: 'PROD-002',
          name: 'Premium Basmati Rice',
          variant: '10kg',
          quantity: 1,
          price: 54.99,
          image: 'https://images.unsplash.com/photo-1633945274417-ab205ae69d10?w=300'
        }
      ],
      status: 'Pending',
      total: 104.97,
      orderDate: '2025-03-20T10:30:00',
      storage: 'Main Warehouse'
    },
    {
      id: 'ORD-002',
      orderNumber: 'RH-2025-002',
      customer: {
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        phone: '+1 (555) 234-5678',
        address: '456 Oak Ave, Green Valley, CA 94001'
      },
      products: [
        {
          id: 'PROD-001',
          name: 'Premium Jasmine Rice',
          variant: '25kg',
          quantity: 1,
          price: 119.99,
          image: 'https://images.unsplash.com/photo-1686820740687-426a7b9b2043?w=300'
        }
      ],
      status: 'Processing',
      total: 119.99,
      orderDate: '2025-03-21T14:15:00',
      storage: 'North Storage'
    },
    {
      id: 'ORD-003',
      orderNumber: 'RH-2025-003',
      customer: {
        name: 'Mike Chen',
        email: 'mike.chen@example.com',
        phone: '+1 (555) 345-6789',
        address: '789 Pine Rd, Green Valley, CA 94002'
      },
      products: [
        {
          id: 'PROD-003',
          name: 'Brown Rice Blend',
          variant: '5kg',
          quantity: 3,
          price: 29.99,
          image: 'https://images.unsplash.com/photo-1633945274417-ab205ae69d10?w=300'
        }
      ],
      status: 'Delivered',
      total: 89.97,
      orderDate: '2025-03-15T09:00:00',
      deliveryDate: '2025-03-18T16:30:00',
      storage: 'Main Warehouse'
    },
    {
      id: 'ORD-004',
      orderNumber: 'RH-2025-004',
      customer: {
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        phone: '+1 (555) 456-7890',
        address: '321 Elm St, Green Valley, CA 94003'
      },
      products: [
        {
          id: 'PROD-002',
          name: 'Premium Basmati Rice',
          variant: '5kg',
          quantity: 4,
          price: 29.99,
          image: 'https://images.unsplash.com/photo-1633945274417-ab205ae69d10?w=300'
        }
      ],
      status: 'Shipped',
      total: 119.96,
      orderDate: '2025-03-19T11:45:00',
      storage: 'South Depot'
    }
  ]);

  const [storageUnits, setStorageUnits] = useState<StorageUnit[]>([
    {
      id: 'STR-001',
      name: 'Main Warehouse',
      location: 'Building A, Section 1',
      products: [
        {
          productId: 'PROD-001',
          productName: 'Premium Jasmine Rice',
          variant: '5kg',
          quantity: 150,
          image: 'https://images.unsplash.com/photo-1686820740687-426a7b9b2043?w=300'
        },
        {
          productId: 'PROD-002',
          productName: 'Premium Basmati Rice',
          variant: '10kg',
          quantity: 200,
          image: 'https://images.unsplash.com/photo-1633945274417-ab205ae69d10?w=300'
        }
      ]
    },
    {
      id: 'STR-002',
      name: 'North Storage',
      location: 'Building B, Section 2',
      products: [
        {
          productId: 'PROD-001',
          productName: 'Premium Jasmine Rice',
          variant: '25kg',
          quantity: 80,
          image: 'https://images.unsplash.com/photo-1686820740687-426a7b9b2043?w=300'
        }
      ]
    },
    {
      id: 'STR-003',
      name: 'South Depot',
      location: 'Building C, Section 1',
      products: [
        {
          productId: 'PROD-003',
          productName: 'Brown Rice Blend',
          variant: '5kg',
          quantity: 120,
          image: 'https://images.unsplash.com/photo-1633945274417-ab205ae69d10?w=300'
        }
      ]
    }
  ]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Storage States
  const [showAddStorage, setShowAddStorage] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState<StorageUnit | null>(null);
  const [newStorageName, setNewStorageName] = useState('');
  const [newStorageLocation, setNewStorageLocation] = useState('');

  // Transfer States
  const [transferData, setTransferData] = useState({
    fromStorage: '',
    toStorage: '',
    productId: '',
    quantity: 0
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Processing':
        return <Package className="w-4 h-4" />;
      case 'Shipped':
        return <Truck className="w-4 h-4" />;
      case 'Delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleAddStorage = (e: React.FormEvent) => {
    e.preventDefault();
    const newStorage: StorageUnit = {
      id: `STR-${String(storageUnits.length + 1).padStart(3, '0')}`,
      name: newStorageName,
      location: newStorageLocation,
      products: []
    };
    setStorageUnits([...storageUnits, newStorage]);
    setNewStorageName('');
    setNewStorageLocation('');
    setShowAddStorage(false);
  };

  const handleTransferProduct = (e: React.FormEvent) => {
    e.preventDefault();
    // Transfer logic here
    alert('Product transferred successfully!');
    setShowTransfer(false);
    setTransferData({ fromStorage: '', toStorage: '', productId: '', quantity: 0 });
  };

  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing');
  const historyOrders = orders.filter(o => o.status === 'Shipped' || o.status === 'Delivered' || o.status === 'Cancelled');

  const filteredOrders = (orderTab === 'pending' ? pendingOrders : historyOrders).filter(order => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCustomer = filterCustomer === 'all' || order.customer.name === filterCustomer;
    const matchesProduct = filterProduct === 'all' || order.products.some(p => p.name === filterProduct);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

    return matchesSearch && matchesCustomer && matchesProduct && matchesStatus;
  });

  const uniqueCustomers = Array.from(new Set(orders.map(o => o.customer.name)));
  const uniqueProducts = Array.from(new Set(orders.flatMap(o => o.products.map(p => p.name))));

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-gray-900 mb-2">Operations Management</h1>
          <p className="text-gray-600">Manage orders, storage, and inventory</p>
        </div>

        {/* Main Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveSection('orders')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition ${activeSection === 'orders'
              ? 'bg-green-700 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            <ShoppingBag className="w-5 h-5" />
            Orders Management
          </button>
          <button
            onClick={() => setActiveSection('storage')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition ${activeSection === 'storage'
              ? 'bg-green-700 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Warehouse className="w-5 h-5" />
            Storage Management
          </button>
          {role === "OWNER" && (<button
            onClick={() => setActiveSection('users')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition ${activeSection === 'users'
              ? 'bg-green-700 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            <User2 className="w-5 h-5" />
            User-Management
          </button>)}
          <button
            onClick={() => setActiveSection('product')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition ${activeSection === 'product'
              ? 'bg-green-700 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            <ShoppingBagIcon className="w-5 h-5" />
            Product-Management
          </button>
        </div>

        {/* Orders Section */}
        {activeSection === 'orders' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                    <h3 className="text-3xl text-gray-900">{orders.length}</h3>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <h3 className="text-3xl text-gray-900">{orders.filter(o => o.status === 'Pending').length}</h3>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-700" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Processing</p>
                    <h3 className="text-3xl text-gray-900">{orders.filter(o => o.status === 'Processing').length}</h3>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-700" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Delivered</p>
                    <h3 className="text-3xl text-gray-900">{orders.filter(o => o.status === 'Delivered').length}</h3>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Tabs */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setOrderTab('pending')}
                className={`px-6 py-3 rounded-full transition ${orderTab === 'pending'
                  ? 'bg-green-700 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Pending Orders ({pendingOrders.length})
              </button>
              <button
                onClick={() => setOrderTab('history')}
                className={`px-6 py-3 rounded-full transition ${orderTab === 'history'
                  ? 'bg-green-700 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Order History ({historyOrders.length})
              </button>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                  />
                </div>

                <select
                  value={filterCustomer}
                  onChange={(e) => setFilterCustomer(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                >
                  <option value="all">All Customers</option>
                  {uniqueCustomers.map(customer => (
                    <option key={customer} value={customer}>{customer}</option>
                  ))}
                </select>

                <select
                  value={filterProduct}
                  onChange={(e) => setFilterProduct(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                >
                  <option value="all">All Products</option>
                  {uniqueProducts.map(product => (
                    <option key={product} value={product}>{product}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl text-gray-900 mb-1">{order.orderNumber}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.orderDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      {/* Customer Info */}
                      <div className="space-y-2">
                        <h4 className="text-sm text-gray-500 mb-2">Customer Details</h4>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{order.customer.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{order.customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Warehouse className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{order.customer.phone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Truck className="w-4 h-4 text-gray-400 mt-0.5" />
                          <span className="text-sm text-gray-600">{order.customer.address}</span>
                        </div>
                      </div>

                      {/* Storage Info */}
                      <div className="space-y-2">
                        <h4 className="text-sm text-gray-500 mb-2">Order Details</h4>
                        <div className="flex items-center gap-2">
                          <Warehouse className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">Storage: {order.storage}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Box className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{order.products.length} Product{order.products.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-green-700 font-medium">Total: ${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Products */}
                    <div className="border-t border-gray-100 pt-4">
                      <h4 className="text-sm text-gray-500 mb-3">Products</h4>
                      <div className="space-y-3">
                        {order.products.map((product, idx) => (
                          <div key={idx} className="flex items-center gap-4 bg-gray-50 rounded-xl p-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-500">Variant: {product.variant}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-900">Qty: {product.quantity}</p>
                              <p className="text-sm text-green-700 font-medium">${(product.price * product.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-full transition flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      {order.status === 'Pending' && (
                        <button
                          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-full transition"
                        >
                          Update Status
                        </button>
                      )}
                      <button className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full transition">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredOrders.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl text-gray-900 mb-2">No Orders Found</h3>
                  <p className="text-gray-600">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Storage Section */}
        {activeSection === 'storage' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Storage Units</p>
                    <h3 className="text-3xl text-gray-900">{storageUnits.length}</h3>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Warehouse className="w-6 h-6 text-purple-700" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Products</p>
                    <h3 className="text-3xl text-gray-900">
                      {storageUnits.reduce((sum, unit) => sum + unit.products.length, 0)}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Box className="w-6 h-6 text-green-700" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Stock</p>
                    <h3 className="text-3xl text-gray-900">
                      {storageUnits.reduce((sum, unit) =>
                        sum + unit.products.reduce((pSum, p) => pSum + p.quantity, 0), 0
                      )}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setShowAddStorage(true)}
                className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-full transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Storage Unit
              </button>
              <button
                onClick={() => setShowTransfer(true)}
                className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-full transition flex items-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                Transfer Products
              </button>
            </div>

            {/* Storage Units Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storageUnits.map((storage) => (
                <div key={storage.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-br from-green-700 to-green-800 p-6 text-white">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl mb-1">{storage.name}</h3>
                        <p className="text-sm text-green-100">{storage.location}</p>
                      </div>
                      <Warehouse className="w-8 h-8" />
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm text-gray-600">Products in Storage</h4>
                      <span className="text-sm text-green-700 font-medium">
                        {storage.products.length} items
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      {storage.products.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No products yet</p>
                      ) : (
                        storage.products.map((product, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                            <img
                              src={product.image}
                              alt={product.productName}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{product.productName}</p>
                              <p className="text-xs text-gray-500">{product.variant}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-900 font-medium">{product.quantity}</p>
                              <p className="text-xs text-gray-500">units</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedStorage(storage)}
                      className="w-full bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-full transition flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Manage Storage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {(activeSection == 'users' && role === 'OWNER') && (
          <UserManagementPage />
        )}
        {activeSection == 'product' && (

          <ProductManagement/>

        )}
      </div>

      {/* Add Storage Modal */}
      {showAddStorage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-gray-900">Add Storage Unit</h2>
                <button
                  onClick={() => setShowAddStorage(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleAddStorage} className="space-y-4">
                <div>
                  <label className="block mb-2 text-gray-900">Storage Name *</label>
                  <input
                    type="text"
                    value={newStorageName}
                    onChange={(e) => setNewStorageName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                    placeholder="e.g., East Warehouse"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-gray-900">Location *</label>
                  <input
                    type="text"
                    value={newStorageLocation}
                    onChange={(e) => setNewStorageLocation(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                    placeholder="e.g., Building D, Section 3"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddStorage(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-full transition"
                  >
                    Add Storage
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Product Modal */}
      {showTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-gray-900">Transfer Product</h2>
                <button
                  onClick={() => setShowTransfer(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleTransferProduct} className="space-y-4">
                <div>
                  <label className="block mb-2 text-gray-900">From Storage *</label>
                  <select
                    value={transferData.fromStorage}
                    onChange={(e) => setTransferData({ ...transferData, fromStorage: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                  >
                    <option value="">Select storage</option>
                    {storageUnits.map(storage => (
                      <option key={storage.id} value={storage.id}>{storage.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-gray-900">To Storage *</label>
                  <select
                    value={transferData.toStorage}
                    onChange={(e) => setTransferData({ ...transferData, toStorage: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                  >
                    <option value="">Select storage</option>
                    {storageUnits.map(storage => (
                      <option key={storage.id} value={storage.id}>{storage.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-gray-900">Product *</label>
                  <select
                    value={transferData.productId}
                    onChange={(e) => setTransferData({ ...transferData, productId: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                  >
                    <option value="">Select product</option>
                    {transferData.fromStorage && storageUnits.find(s => s.id === transferData.fromStorage)?.products.map((product, idx) => (
                      <option key={idx} value={product.productId}>
                        {product.productName} - {product.variant} (Available: {product.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-gray-900">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={transferData.quantity || ''}
                    onChange={(e) => setTransferData({ ...transferData, quantity: parseInt(e.target.value) || 0 })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                    placeholder="Enter quantity"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTransfer(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-full transition"
                  >
                    Transfer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
export default withAuth(OrderManagementPage , ['ADMIN' , 'OWNER' , 'MANAGER'])
