import { Star, Heart, TrendingUp, Package } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { CartWithDetails } from '@/types/cart'

// Mock Data
const products = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 99.99,
    rating: 4.5,
    image: '🎧',
    category: 'Electronics'
  },
  {
    id: 2,
    name: 'Smart Watch',
    price: 249.99,
    rating: 4.8,
    image: '⌚',
    category: 'Electronics'
  },
  {
    id: 3,
    name: 'Laptop Bag',
    price: 49.99,
    rating: 4.3,
    image: '💼',
    category: 'Accessories'
  },
  {
    id: 4,
    name: 'Coffee Maker',
    price: 79.99,
    rating: 4.6,
    image: '☕',
    category: 'Home'
  },
  {
    id: 5,
    name: 'Running Shoes',
    price: 129.99,
    rating: 4.7,
    image: '👟',
    category: 'Fashion'
  },
  {
    id: 6,
    name: 'Desk Lamp',
    price: 39.99,
    rating: 4.4,
    image: '💡',
    category: 'Home'
  }
]

const ComponentRegistry : any = {
  // Hero doesn't use the cart, so no changes needed
  hero: ({ config }: any) => (
    <div className='relative bg-gradient-to-r from-indigo-600 to-pink-500 mb-8 px-6 py-20 rounded-2xl text-white'>
      <div className='max-w-3xl'>
        <h1 className='mb-4 font-bold text-5xl'>Summer Collection 2024</h1>
        <p className='opacity-90 mb-6 text-xl'>
          Discover the latest trends with up to 50% off
        </p>
        <button className='bg-white hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-indigo-600 transition'>
          Shop Now
        </button>
      </div>
    </div>
  ),

  featured: ({ config }: any) => {
    const { addToCart } = useCartStore()

    const handleAddToCart = (product: any) => {
      const item: CartWithDetails = {
        cart_id: null,
        id: 0,
        created_at: new Date().toISOString(),
        variant_id: product.id,
        quantity: 1,
        product_variants: {
          name: product.name,
          price: product.price,
          image_url: product.image
        }
      }
      addToCart(item)
    }

    return (
      <div className='mb-8'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='font-bold text-gray-800 text-3xl'>
            Featured Products
          </h2>
          <TrendingUp className='text-indigo-600' size={28} />
        </div>
        <div className='gap-6 grid grid-cols-1 md:grid-cols-3'>
          {products.slice(0, 3).map(product => (
            <div
              key={product.id}
              className='bg-white hover:shadow-xl p-6 border border-gray-200 rounded-xl transition'
            >
              <div className='mb-4 text-6xl text-center'>{product.image}</div>
              <div className='flex justify-between items-center mb-2'>
                <span className='bg-indigo-50 px-2 py-1 rounded font-semibold text-indigo-600 text-xs'>
                  {product.category}
                </span>
                <Heart
                  className='text-gray-400 hover:text-pink-500 cursor-pointer'
                  size={20}
                />
              </div>
              <h3 className='mb-2 font-semibold text-lg'>{product.name}</h3>
              <div className='flex items-center mb-3'>
                <Star className='fill-yellow-400 text-yellow-400' size={16} />
                <span className='ml-1 text-gray-600 text-sm'>
                  {product.rating}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='font-bold text-gray-800 text-2xl'>
                  ${product.price}
                </span>

                {/* 3. Attach the Handler */}
                <button
                  onClick={() => handleAddToCart(product)}
                  className='bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-white transition'
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },

  categories: ({ config }: any) => (
    <div className='mb-8'>
      <h2 className='mb-6 font-bold text-gray-800 text-3xl'>
        Shop by Category
      </h2>
      <div className='gap-4 grid grid-cols-2 md:grid-cols-4'>
        {['Electronics', 'Fashion', 'Home', 'Accessories'].map(cat => (
          <div
            key={cat}
            className='bg-gradient-to-br from-indigo-50 to-pink-50 hover:shadow-lg p-6 rounded-xl text-center transition cursor-pointer'
          >
            <Package className='mx-auto mb-3 text-indigo-600' size={32} />
            <h3 className='font-semibold text-gray-800'>{cat}</h3>
          </div>
        ))}
      </div>
    </div>
  ),

  // PRODUCTS COMPONENT: Updated to use addToCart
  products: ({ config }: any) => {
    // 1. Initialize Hook Inside
    const { addToCart } = useCartStore()
    const handleAddToCart = (product: any) => {
      const item: CartWithDetails = {
        cart_id: null,
        id: 0,
        created_at: new Date().toISOString(),
        variant_id: product.id,
        quantity: 1,
        product_variants: {
          name: product.name,
          price: product.price,
          image_url: product.image
        }
      }
      addToCart(item)
    }

    return (
      <div className='mb-8'>
        <h2 className='mb-6 font-bold text-gray-800 text-3xl'>All Products</h2>
        <div className='gap-6 grid grid-cols-1 md:grid-cols-3'>
          {products.map(product => (
            <div
              key={product.id}
              className='bg-white hover:shadow-xl p-6 border border-gray-200 rounded-xl transition'
            >
              <div className='mb-4 text-6xl text-center'>{product.image}</div>
              <span className='bg-pink-50 px-2 py-1 rounded font-semibold text-pink-600 text-xs'>
                {product.category}
              </span>
              <h3 className='mt-2 mb-2 font-semibold text-lg'>
                {product.name}
              </h3>
              <div className='flex items-center mb-3'>
                <Star className='fill-yellow-400 text-yellow-400' size={16} />
                <span className='ml-1 text-gray-600 text-sm'>
                  {product.rating}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='font-bold text-gray-800 text-2xl'>
                  ${product.price}
                </span>

                {/* 2. Call addToCart directly here */}
                <button
                  onClick={() =>
                    handleAddToCart(product)
                  }
                  className='bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-lg text-white transition'
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },

  newsletter: ({ config }: any) => (
    <div className='bg-gradient-to-r from-indigo-600 to-pink-500 p-10 rounded-2xl text-white text-center'>
      <h2 className='mb-3 font-bold text-3xl'>Subscribe to Our Newsletter</h2>
      <p className='opacity-90 mb-6'>
        Get the latest deals and updates delivered to your inbox
      </p>
      <div className='flex gap-3 mx-auto max-w-md'>
        <input
          type='email'
          placeholder='Enter your email'
          className='flex-1 px-4 py-3 rounded-lg text-gray-800'
        />
        <button className='bg-white hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold text-indigo-600 transition'>
          Subscribe
        </button>
      </div>
    </div>
  )
}

export default ComponentRegistry
