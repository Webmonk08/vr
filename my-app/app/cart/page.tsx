'use client'
import { useState, useMemo } from 'react';
import { Wheat, Minus, Plus, Trash2, ShoppingBag, Tag, Truck, ArrowRight } from 'lucide-react';
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CartService } from "@/services/cart.service";
import { CartItem } from "@/types/cart.types";
import LoadingPage from '@/component/loadingPage';
import withAuth from '@/component/withAuth';

interface CartPageProps {
  onNavigate: (page: string) => void;
}

function CartPage({ onNavigate }: CartPageProps) {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(false);

  const { user } = useAuthStore();
  const {
    cart: guestCart,
    removeFromCart: removeGuestItem,
    updateQuantity: updateGuestQuantity,
    clearCart: clearGuestCart,
  } = useCartStore();

  const queryClient = useQueryClient();

  // Fetch user cart from backend
  const { data: userCart, isLoading } = useQuery<CartItem[]>({
    queryKey: ["cart", user?.id],
    queryFn: () => CartService.getCart(user?.id),
    enabled: !!user,
  });
  console.log("after", userCart)
  // Update quantity mutation
  const { mutate: updateQuantity } = useMutation({
    mutationFn: ({
      itemId,
      productVariantId,
      quantity,
    }: {
      itemId: number;
      productVariantId: number;
      quantity: number;
    }) => CartService.updateItem(itemId, productVariantId, quantity, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
  });

  // Remove item mutation
  const { mutate: removeItem } = useMutation({
    mutationFn: ({ cartId, productId }: { cartId: number; productId: number }) =>
      CartService.removeItem(cartId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
  });

  // Clear cart mutation
  const { mutate: clearCart } = useMutation({
    mutationFn: () => CartService.clearCart(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
  });

  // Use appropriate cart based on authentication
  const cart = user ? userCart : guestCart;
  console.log("usercart", userCart)
  // Calculate totals
  const subtotal = useMemo(() => {
    return (
      cart?.reduce(
        (acc, item) => acc + item.variant.price * item.quantity,
        0
      ) ?? 0
    );
  }, [cart]);

  const discount = appliedPromo ? subtotal * 0.1 : 0;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shipping + tax;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'RICE10') {
      setAppliedPromo(true);
    }
  };

  const handleUpdateQuantity = (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;

    if (user) {
      updateQuantity({
        itemId: item.id,
        productVariantId: item.variant.id,
        quantity: newQuantity,
      });
    } else {
      updateGuestQuantity(item.id, newQuantity);
    }
  };

  const handleRemoveItem = (item: CartItem) => {
    if (user) {
      removeItem({ cartId: item.id, productId: item.product.id });
    } else {
      removeGuestItem(item.id);
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }
  console.log(cart)
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-8">
          <button onClick={() => onNavigate('home')} className="hover:text-green-700">Home</button>
          <span> / </span>
          <span>Shopping Cart</span>
        </div>

        {!cart || cart.length === 0 ? (
          // Empty Cart State
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={48} className="text-green-700" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <button
              onClick={() => onNavigate('product')}
              className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-full transition inline-flex items-center gap-2"
            >
              Start Shopping
              <ArrowRight size={20} />
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
                  <span className="text-gray-600">
                    {cart.length} {cart.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-green-200 transition">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-4xl">
                        {item.variant?.image || item.variant.image || '🌾'}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{item.product.name}</h3>
                          <button
                            onClick={() => handleRemoveItem(item)}
                            className="text-gray-400 hover:text-red-600 transition p-1"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{item.variant.weight}</p>

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center border-2 border-gray-200 rounded-full overflow-hidden">
                            <button
                              onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-12 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-800">
                              ${(item.variant.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">${item.variant.price} each</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Continue Shopping */}
                <button
                  onClick={() => onNavigate('product')}
                  className="mt-6 text-green-700 hover:text-green-800 transition flex items-center gap-2"
                >
                  ← Continue Shopping
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h3>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Promo Code</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-full focus:border-green-700 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleApplyPromo}
                    className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-full transition font-semibold"
                  >
                    Apply
                  </button>
                  {appliedPromo && (
                    <div className="mt-2 text-sm text-green-700 flex items-center gap-1">
                      ✓ Promo code applied! 10% discount
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Try code: RICE10</p>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount (10%)</span>
                      <span className="font-semibold">-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span className="font-semibold">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (8%)</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                </div>

                {subtotal < 50 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 flex items-center gap-2">
                    <Truck className="text-green-700" size={20} />
                    <p className="text-sm text-green-700">
                      Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  </div>
                )}

                {/* Total */}
                <div className="border-t-2 border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-green-700">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-full transition font-semibold flex items-center justify-center gap-2 mb-3">
                  Proceed to Checkout
                  <ArrowRight size={20} />
                </button>

                <button
                  onClick={() => (user ? clearCart() : clearGuestCart())}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-full transition font-semibold"
                >
                  Clear Cart
                </button>

                {/* Secure Checkout Info */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div >
  );
}

export default withAuth(CartPage, ['ADMIN', 'customer', 'OWNER']);
