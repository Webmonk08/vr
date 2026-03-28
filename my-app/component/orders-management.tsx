'use client'
import { useState, useEffect } from 'react';
import { ShoppingBag, Clock, Package, CheckCircle, Search, User, Warehouse, Truck, Box, TrendingUp, Eye, Download, XCircle } from 'lucide-react';
import { OrdersService, Order, OrderStatus } from '@/services/orders.service';

interface DisplayOrder {
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
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED';
  total: number;
  orderDate: string;
  deliveryDate?: string;
  storage?: string;
}

const mapApiOrderToDisplayOrder = (order: Order): DisplayOrder => ({
  id: order.id,
  orderNumber: `ORD-${order.id.slice(0, 8).toUpperCase()}`,
  customer: {
    name: order.customer_name || 'Unknown',
    email: order.customer_email || '',
    phone: order.phone_no || '',
    address: order.shipping_address || '',
  },
  products: order.items?.map(item => ({
    id: String(item.product_id),
    name: item.product_name || 'Unknown Product',
    variant: item.weight || 'N/A',
    quantity: item.quantity,
    price: item.price_at_purchase,
    image: item.image?.[0] || '',
  })) || [],
  status: order.status as DisplayOrder['status'],
  total: order.total_amount,
  orderDate: order.created_at,
  storage: 'Main Warehouse',
});

export default function OrdersManagement() {
  const [orderTab, setOrderTab] = useState<'pending' | 'history'>('pending');
  const [loading, setLoading] = useState(true);
  
  const [orders, setOrders] = useState<DisplayOrder[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await OrdersService.getAll();
        setOrders(data.map(mapApiOrderToDisplayOrder));
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<DisplayOrder | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingStatus(orderId);
      await OrdersService.updateStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus as DisplayOrder['status'] } : order
      ));
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await OrdersService.deleteOrder(orderId);
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const refreshOrders = async () => {
    try {
      setLoading(true);
      const data = await OrdersService.getAll();
      setOrders(data.map(mapApiOrderToDisplayOrder));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'SHIPPED':
        return <Truck className="w-4 h-4" />;
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const historyOrders = orders.filter(o => o.status === 'SHIPPED' || o.status === 'DELIVERED');

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Refresh Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={refreshOrders}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-full hover:bg-green-800 transition"
        >
          <ShoppingBag className="w-4 h-4" />
          Refresh Orders
        </button>
      </div>

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
              <h3 className="text-3xl text-gray-900">{orders.filter(o => o.status === 'PENDING').length}</h3>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Shipped</p>
              <h3 className="text-3xl text-gray-900">{orders.filter(o => o.status === 'SHIPPED').length}</h3>
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
              <h3 className="text-3xl text-gray-900">{orders.filter(o => o.status === 'DELIVERED').length}</h3>
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
            <option value="PENDING">Pending</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
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
                {order.status === 'PENDING' && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                    disabled={updatingStatus === order.id}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-full transition disabled:opacity-50"
                  >
                    {updatingStatus === order.id ? 'Updating...' : 'Mark as Shipped'}
                  </button>
                )}
                {order.status === 'SHIPPED' && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                    disabled={updatingStatus === order.id}
                    className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-full transition disabled:opacity-50"
                  >
                    {updatingStatus === order.id ? 'Updating...' : 'Mark as Delivered'}
                  </button>
                )}
                <button
                  onClick={() => handleDeleteOrder(order.id)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-full transition"
                >
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
  );
}
