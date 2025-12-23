'use client'
import { useCartStore } from '@/store/useCartStore'
import { ShoppingCart } from 'lucide-react'

const cart = () => {
  const { cart, setShowCart, updateQuantity, removeFromCart } = useCartStore()

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product_variants.price * item.quantity,
    0
  )
  return (
    <div
      className='z-50 fixed inset-0 bg-black bg-opacity-50'
      onClick={() => setShowCart(false)}
    >
      <div
        className='top-0 right-0 fixed bg-white shadow-2xl w-full md:w-96 h-full overflow-y-auto'
        onClick={e => e.stopPropagation()}
      >
        <div className='p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='font-bold text-gray-800 text-2xl'>Shopping Cart</h2>
            <button
              onClick={() => setShowCart(false)}
              className='text-gray-500 hover:text-gray-800 text-2xl'
            >
              ×
            </button>
          </div>

          {cart.length === 0 ? (
            <div className='py-12 text-center'>
              <ShoppingCart className='mx-auto mb-4 text-gray-300' size={64} />
              <p className='text-gray-500 text-lg'>Your cart is empty</p>
              <button
                onClick={() => setShowCart(false)}
                className='bg-indigo-600 hover:bg-indigo-700 mt-4 px-6 py-2 rounded-lg text-white transition'
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className='space-y-4 mb-6'>
                {cart.map(item => (
                  <div key={item.id} className='bg-gray-50 p-4 rounded-xl'>
                    <div className='flex gap-4'>
                      {/* <div className="text-4xl">{item}</div> */}
                      <div className='flex-1'>
                        <h3 className='mb-1 font-semibold text-gray-800'>
                          {item.product_variants.name}
                        </h3>
                        <p className='mb-2 text-gray-500 text-sm'>
                          {item.variant_id}
                        </p>
                        <div className='flex justify-between items-center'>
                          <div className='flex items-center gap-2'>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className='bg-white hover:bg-gray-100 border border-gray-300 rounded-lg w-8 h-8 transition'
                            >
                              −
                            </button>
                            <span className='w-8 font-semibold text-center'>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className='bg-white hover:bg-gray-100 border border-gray-300 rounded-lg w-8 h-8 transition'
                            >
                              +
                            </button>
                          </div>
                          <div className='text-right'>
                            <p className='font-bold text-gray-800'>
                              $
                              {(
                                item.product_variants.price * item.quantity
                              ).toFixed(2)}
                            </p>
                            <p className='text-gray-500 text-xs'>
                              ${item.product_variants.price} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className='mt-3 text-red-500 hover:text-red-700 text-sm transition'
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className='mb-6 pt-4 border-gray-200 border-t'>
                <div className='flex justify-between mb-2'>
                  <span className='text-gray-600'>Subtotal</span>
                  <span className='font-semibold'>${cartTotal.toFixed(2)}</span>
                </div>
                <div className='flex justify-between mb-2'>
                  <span className='text-gray-600'>Shipping</span>
                  <span className='font-semibold'>$5.00</span>
                </div>
                <div className='flex justify-between mb-2'>
                  <span className='text-gray-600'>Tax</span>
                  <span className='font-semibold'>
                    ${(cartTotal * 0.1).toFixed(2)}
                  </span>
                </div>
                <div className='mt-2 pt-2 border-gray-200 border-t'>
                  <div className='flex justify-between'>
                    <span className='font-bold text-gray-800 text-lg'>
                      Total
                    </span>
                    <span className='font-bold text-indigo-600 text-lg'>
                      ${(cartTotal + 5 + cartTotal * 0.1).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button className='bg-indigo-600 hover:bg-indigo-700 mb-3 py-3 rounded-lg w-full font-semibold text-white transition'>
                Proceed to Checkout
              </button>
              <button
                onClick={() => setShowCart(false)}
                className='bg-gray-100 hover:bg-gray-200 py-3 rounded-lg w-full font-semibold text-gray-800 transition'
              >
                Continue Shopping
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
export default cart
