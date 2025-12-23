'use client'
import { useState, useEffect } from 'react'
import { ShoppingCart, User, Search, Settings } from 'lucide-react'
import ComponentRegistry from '@/component/componentsRegistry'
import { useCartStore } from '@/store/useCartStore'
import Link from 'next/link'

const serverConfig = {
  layout: 'grid',
  components: [
    { id: 'hero', type: 'hero', enabled: true, order: 1 },
    { id: 'featured', type: 'featured', enabled: true, order: 2 },
    { id: 'categories', type: 'categories', enabled: true, order: 3 },
    { id: 'products', type: 'products', enabled: true, order: 4 },
    { id: 'newsletter', type: 'newsletter', enabled: true, order: 5 }
  ],
  theme: {
    primary: '#6366f1',
    secondary: '#ec4899',
    background: '#ffffff'
  }
}

export default function EcommerceApp () {
  const [config, setConfig] = useState(serverConfig)
  const { cart } = useCartStore()
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    setConfig(serverConfig)
  }, [])

  // Sort components by order
  const sortedComponents = [...config.components]
    .filter(c => c.enabled)
    .sort((a, b) => a.order - b.order)

  const toggleComponent = (id: string) => {
    setConfig(prev => ({
      ...prev,
      components: prev.components.map(c =>
        c.id === id ? { ...c, enabled: !c.enabled } : c
      )
    }))
  }

  const reorderComponent = (id: string, direction: string) => {
    const idx = config.components.findIndex(c => c.id === id)
    if (
      (direction === 'up' && idx === 0) ||
      (direction === 'down' && idx === config.components.length - 1)
    )
      return

    const newComponents = [...config.components]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newComponents[idx], newComponents[swapIdx]] = [
      newComponents[swapIdx],
      newComponents[idx]
    ]

    setConfig(prev => ({ ...prev, components: newComponents }))
  }

  return (
    <div className='bg-gray-50 min-h-screen'>
      {/* Header */}
      <header className='top-0 z-50 sticky bg-white shadow-sm'>
        <div className='mx-auto px-6 py-4 max-w-7xl'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-3'>
              <ShoppingCart className='text-indigo-600' size={32} />
              <h1 className='font-bold text-gray-800 text-2xl'>ShopHub</h1>
            </div>

            <div className='flex items-center gap-6'>
              <div className='hidden md:flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg'>
                <Search size={20} className='text-gray-400' />
                <input
                  type='text'
                  placeholder='Search products...'
                  className='bg-transparent outline-none'
                />
              </div>

              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className='flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 px-4 py-2 rounded-lg text-indigo-600 transition'
              >
                <Settings size={20} />
                <span className='hidden md:inline'>Admin</span>
              </button>

              <div className='flex items-center gap-4'>
                <User
                  className='text-gray-600 hover:text-indigo-600 cursor-pointer'
                  size={24}
                />
                <Link href='/cart'>
                  {' '}
                  {/* 2. Wrap the container in Link */}
                  <div className='relative'>
                    <ShoppingCart
                      className='text-gray-600 hover:text-indigo-600 cursor-pointer'
                      size={24}
                    />
                    {cart.length > 0 && (
                      <span className='-top-2 -right-2 absolute flex justify-center items-center bg-pink-500 rounded-full w-5 h-5 text-white text-xs'>
                        {cart.length}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Panel */}
      {showAdmin && (
        <div className='bg-yellow-50 border-yellow-200 border-b'>
          <div className='mx-auto px-6 py-4 max-w-7xl'>
            <h3 className='mb-3 font-bold text-gray-800 text-lg'>
              Component Manager
            </h3>
            <div className='gap-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
              {config.components.map(component => (
                <div
                  key={component.id}
                  className='bg-white p-3 border border-gray-200 rounded-lg'
                >
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                      <input
                        type='checkbox'
                        checked={component.enabled}
                        onChange={() => toggleComponent(component.id)}
                        className='w-4 h-4'
                        title='checkbox'
                      />
                      <span className='font-semibold capitalize'>
                        {component.type}
                      </span>
                    </div>
                    <div className='flex gap-1'>
                      <button
                        onClick={() => reorderComponent(component.id, 'up')}
                        className='bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-sm'
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => reorderComponent(component.id, 'down')}
                        className='bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-sm'
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className='mt-3 text-gray-600 text-sm'>
              ✨ Components are rendered from server configuration. Toggle and
              reorder to see changes.
            </p>
          </div>
        </div>
      )}

      {/* Main Content - Server Rendered Components */}
      <main className='mx-auto px-6 py-8 max-w-7xl'>
        {sortedComponents.map(component => {
          const Component: any = ComponentRegistry[component.type]
          return Component ? (
            <div key={component.id}>
              <Component config={component} />
            </div>
          ) : null
        })}
      </main>

      {/* Footer */}
      <footer className='bg-gray-800 mt-12 py-8 text-white'>
        <div className='mx-auto px-6 max-w-7xl text-center'>
          <p className='mb-2'>© 2024 ShopHub. All rights reserved.</p>
          <p className='text-gray-400 text-sm'>
            Server-Rendered Dynamic E-commerce Platform
          </p>
        </div>
      </footer>
    </div>
  )
}
