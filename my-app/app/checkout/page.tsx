'use client'
import { useState, useMemo } from 'react';
import { ShoppingBag, MapPin, Phone, ArrowLeft, CreditCard, CheckCircle, Truck, Tag } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CartService } from '@/services/cart.service';
import { OrdersService } from '@/services/orders.service';
import { CartItem } from '@/types/cart.types';
import LoadingPage from '@/component/loadingPage';
import withAuth from '@/component/withAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { cart: guestCart, clearCart: clearGuestCart } = useCartStore();
  const queryClient = useQueryClient();

  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  // Fetch cart
  const { data: userCart, isLoading } = useQuery<CartItem[]>({
    queryKey: ['cart', user?.id],
    queryFn: () => CartService.getCart(user?.id),
    enabled: !!user,
  });

  const cart = user ? userCart : guestCart;

  // Calculate totals (same logic as cart page)
  const subtotal = useMemo(() => {
    return cart?.reduce((acc, item) => acc + item.variant.price * item.quantity, 0) ?? 0;
  }, [cart]);

  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Clear cart mutation
  const { mutate: clearCartMutation } = useMutation({
    mutationFn: () => CartService.clearCart(user!.id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    },
  });

  // Place order mutation
  const { mutate: placeOrder, isPending: isPlacingOrder } = useMutation({
    mutationFn: () => {
      if (!cart || cart.length === 0) throw new Error('Cart is empty');
      return OrdersService.create({
        user_id: user!.id,
        shipping_address: shippingAddress,
        phone_no: phoneNo,
        items: cart.map((item) => ({
          product_id: item.product.id,
          variant_id: item.variant.id,
          quantity: item.quantity,
          price_at_purchase: item.variant.price,
        })),
      });
    },
    onSuccess: (order) => {
      setOrderPlaced(true);
      setPlacedOrderId(order.id);
      // Clear the cart after order is placed
      if (user) {
        clearCartMutation();
      } else {
        clearGuestCart();
      }
    },
    onError: (error) => {
      console.error('Failed to place order:', error);
      alert('Failed to place order. Please try again.');
    },
  });

  const handlePlaceOrder = () => {
    if (!shippingAddress.trim()) {
      alert('Please enter a shipping address.');
      return;
    }
    if (!phoneNo.trim()) {
      alert('Please enter a phone number.');
      return;
    }
    placeOrder();
  };

  if (isLoading) return <LoadingPage />;

  // Order success view
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-700" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-2">Thank you for your purchase.</p>
            {placedOrderId && (
              <p className="text-sm text-gray-500 mb-8">
                Order ID: <span className="font-mono font-semibold text-gray-700">{placedOrderId.slice(0, 8).toUpperCase()}</span>
              </p>
            )}
            <div className="flex gap-4 justify-center">
              <Link href="/">
                <button className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-full transition font-semibold">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart redirect
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={48} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add items to your cart before checking out.</p>
            <Link href="/products">
              <button className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-full transition font-semibold">
                Browse Products
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-green-700">Home</Link>
          <span> / </span>
          <Link href="/cart" className="hover:text-green-700">Cart</Link>
          <span> / </span>
          <span className="text-gray-900 font-medium">Checkout</span>
        </div>

        {/* Back to Cart */}
        <Link href="/cart" className="inline-flex items-center gap-2 text-gray-600 hover:text-green-700 mb-6 transition">
          <ArrowLeft className="w-5 h-5" />
          Back to Cart
        </Link>

        <div className="grid lg:grid-cols-3 gap-8 mt-4">
          {/* Left Column: Shipping + Products */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-700" />
                Shipping Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Shipping Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                    <textarea
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Enter your full shipping address..."
                      rows={3}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-green-700 focus:outline-none resize-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={phoneNo}
                      onChange={(e) => setPhoneNo(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:border-green-700 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-green-700" />
                Order Items ({cart.length})
              </h2>

              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 rounded-xl border-2 border-gray-100"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.variant?.image ? (
                        <img
                          src={typeof item.variant.image === 'string' ? item.variant.image : item.variant.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">🌾</span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">{item.variant.weight}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-gray-800">
                        ${(item.variant.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">${item.variant.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h3>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-semibold">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (8%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
              </div>

              {shipping === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 flex items-center gap-2">
                  <Tag className="text-green-700 w-5 h-5" />
                  <p className="text-sm text-green-700">Free shipping applied!</p>
                </div>
              )}

              {/* Total */}
              <div className="border-t-2 border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-green-700">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full bg-green-700 hover:bg-green-800 disabled:bg-green-400 disabled:cursor-not-allowed text-white py-3 rounded-full transition font-semibold flex items-center justify-center gap-2 mb-3"
              >
                {isPlacingOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Place Order
                  </>
                )}
              </button>

              <Link href="/cart">
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-full transition font-semibold">
                  Back to Cart
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(CheckoutPage, ['ADMIN', 'MANAGER', 'CUSTOMER', 'OWNER']);
