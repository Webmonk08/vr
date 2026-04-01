'use client'
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, Truck, CheckCircle, User, Package, MapPin, Phone, ShoppingBag, Box, TrendingUp } from 'lucide-react';
import { OrdersService, Order } from '@/services/orders.service';
import withAuth from '@/component/withAuth';
import LoadingPage from '@/component/loadingPage';
import Link from 'next/link';

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
});

function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<DisplayOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const allOrders = await OrdersService.getAll();
        const found = allOrders.find(o => o.id === orderId);
        if (found) {
          setOrder(mapApiOrderToDisplayOrder(found));
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-5 h-5" />;
      case 'SHIPPED': return <Truck className="w-5 h-5" />;
      case 'DELIVERED': return <CheckCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  if (loading) return <LoadingPage />;

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-gray-900 mb-2">{error || 'Order not found'}</h3>
            <Link href="/order">
              <button className="mt-4 bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-full transition">
                Back to Orders
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/order" className="inline-flex items-center gap-2 text-gray-600 hover:text-green-700 mb-6 transition">
          <ArrowLeft className="w-5 h-5" />
          Back to Orders
        </Link>

        {/* Order Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{order.orderNumber}</h1>
              <p className="text-sm text-gray-500">
                Placed on {new Date(order.orderDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              {order.status}
            </span>
          </div>

          {/* Total */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <TrendingUp className="w-5 h-5 text-green-700" />
            <span className="text-lg font-bold text-green-700">Total: ${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Customer Details */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-green-700" />
              Customer Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{order.customer.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{order.customer.email}</span>
              </div>
              {order.customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{order.customer.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Details */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-green-700" />
              Shipping Details
            </h2>
            <div className="space-y-3">
              {order.customer.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600">{order.customer.address}</span>
                </div>
              )}
              {order.customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{order.customer.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Box className="w-5 h-5 text-green-700" />
            Order Items ({order.products.length})
          </h2>

          <div className="space-y-4">
            {order.products.map((product, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">🌾</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">Variant: {product.variant}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Qty: {product.quantity}</p>
                  <p className="font-semibold text-green-700">${(product.price * product.quantity).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">${product.price.toFixed(2)} each</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Total */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Order Total</span>
            <span className="text-2xl font-bold text-green-700">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(OrderDetailPage, ['ADMIN', 'OWNER', 'MANAGER']);
