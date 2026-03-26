'use client'
import { ShoppingBag, Warehouse, User2, ShoppingBagIcon } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import UserManagementPage from '@/component/user-management'
import ProductManagement from '@/component/product-management';
import withAuth from '@/component/withAuth';
import OrdersManagement from '@/component/orders-management';
import StorageManagement from '@/component/storage-management';

interface OrderManagementPageProps {
  onNavigate?: (page: string) => void;
}

function OrderManagementPage({ onNavigate }: OrderManagementPageProps) {
  const [activeSection, setActiveSection] = useState<'orders' | 'storage' | 'users'|'product'>('orders');
  const { role } = useAuthStore()

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

        {/* Sections */}
        {activeSection === 'orders' && <OrdersManagement />}
        {activeSection === 'storage' && <StorageManagement />}
        {activeSection === 'users' && role === 'OWNER' && <UserManagementPage />}
        {activeSection === 'product' && <ProductManagement />}
      </div>
    </div>
  );
}

export default withAuth(OrderManagementPage, ['ADMIN', 'OWNER', 'MANAGER'])
