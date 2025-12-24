
'use client'
import React from 'react'
import { useCartStore } from '@/store/useCartStore';
import { ShoppingCart, Package, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { Tables } from '@/store/useCartStore';

const mockProducts: (Tables<'products'> & { variant: Tables<'product_variants'> })[] = [
  {
    id: 1,
    name: 'Wireless Headphones',
    category_id: 1,
    variant: {
      id: 1,
      product_id: 1,
      price: 79.99,
      sku: 'WH-001',
      stock_quantity: 50,
      weight_value: 250,
      weight_unit: 'g',
      is_default: true,
    },
  },
  {
    id: 2,
    name: 'Smart Watch',
    category_id: 1,
    variant: {
      id: 2,
      product_id: 2,
      price: 199.99,
      sku: 'SW-001',
      stock_quantity: 30,
      weight_value: 45,
      weight_unit: 'g',
      is_default: true,
    },
  },
  {
    id: 3,
    name: 'Running Shoes',
    category_id: 4,
    variant: {
      id: 3,
      product_id: 3,
      price: 89.99,
      sku: 'RS-001',
      stock_quantity: 100,
      weight_value: 400,
      weight_unit: 'g',
      is_default: true,
    },
  },
  {
    id: 4,
    name: 'Cotton T-Shirt',
    category_id: 2,
    variant: {
      id: 4,
      product_id: 4,
      price: 24.99,
      sku: 'TS-001',
      stock_quantity: 200,
      weight_value: 150,
      weight_unit: 'g',
      is_default: true,
    },
  },
  {
    id: 5,
    name: 'LED Desk Lamp',
    category_id: 3,
    variant: {
      id: 5,
      product_id: 5,
      price: 45.99,
      sku: 'DL-001',
      stock_quantity: 75,
      weight_value: 800,
      weight_unit: 'g',
      is_default: true,
    },
  },
  {
    id: 6,
    name: 'Yoga Mat',
    category_id: 4,
    variant: {
      id: 6,
      product_id: 6,
      price: 34.99,
      sku: 'YM-001',
      stock_quantity: 60,
      weight_value: 1200,
      weight_unit: 'g',
      is_default: true,
    },
  },
];


const CheckoutSteps = ({ currentStep = 1 }) => {
  const steps = [
    { num: 1, label: 'CART' },
    { num: 2, label: 'ADDRESS' },
    { num: 3, label: 'PAYMENT' },
  ];

  return (
    <div className="flex items-center justify-center py-8 bg-white">
      {steps.map((step, idx) => (
        <React.Fragment key={step.num}>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step.num <= currentStep
                ? 'bg-teal-700 text-white'
                : 'bg-gray-300 text-gray-600'
                }`}
            >
              {step.num}
            </div>
            <span
              className={`ml-2 text-sm font-medium ${step.num <= currentStep ? 'text-gray-900' : 'text-gray-500'
                }`}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className="w-16 h-0.5 bg-gray-300 mx-4" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const CartView = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCartStore();
  const totalPrice = getTotalPrice();
  const deliveryFee = 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CheckoutSteps currentStep={1} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                Shopping cart ({cart.length} Item{cart.length !== 1 ? 's' : ''})
              </h2>
              <p className="text-lg font-semibold mt-1">Total ₹{totalPrice.toFixed(0)}</p>
            </div>

            <div className="divide-y">
              {cart.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="p-6 flex gap-6">
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-300" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                          <p className="text-2xl font-semibold text-gray-900 mt-2">
                            ₹{item.product.variant.price.toFixed(0)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-gray-600 uppercase text-sm font-medium"
                        >
                          REMOVE
                        </button>
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <span className="text-sm text-gray-600">Qty:</span>
                        <select
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center justify-between">
                Other popular products
                <div className="flex gap-2">
                  <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full bg-teal-700 hover:bg-teal-800 text-white">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mockProducts.slice(0, 4).map((product) => (
                  <div key={product.id} className="bg-white rounded-lg border overflow-hidden">
                    <div className="aspect-square bg-gray-100">

                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-300" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border sticky top-24">
            <div className="p-6">
              <div className="flex items-start gap-3 pb-6 border-b">
                <Tag className="w-5 h-5 text-green-600 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Coupons and offers</h3>
                    <span className="text-sm text-gray-600">1 Offer →</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Save more with coupon and offers</p>
                </div>
              </div>

              <div className="py-6 space-y-3 border-b">
                <div className="flex justify-between text-gray-700">
                  <span>Item total</span>
                  <span>₹{totalPrice.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery fee</span>
                  <span className="text-green-600">
                    {deliveryFee === 0 ? (
                      <>
                        <span className="line-through text-gray-400 mr-2">₹0</span>
                        FREE
                      </>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
              </div>

              <div className="py-6 border-b">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Grand total</span>
                  <span>₹{(totalPrice + deliveryFee).toFixed(0)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Inclusive of all taxes</p>
              </div>

              <div className="pt-6">
                <p className="text-sm text-gray-600 mb-4">
                  Average delivery time: <span className="font-semibold text-gray-900">6-24 hours</span>
                </p>
                <button
                  disabled={cart.length === 0}
                  className="w-full bg-teal-700 text-white py-3.5 rounded-lg hover:bg-teal-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartView
