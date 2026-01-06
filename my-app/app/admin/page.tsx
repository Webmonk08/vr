'use client'
import { useState } from 'react';
import { Wheat, Package, Plus, Edit, ShoppingBag, User, AlertCircle } from 'lucide-react';
import { ProductForm } from '@/component/ProductForm';
import { ConfirmationModal } from '@/component/ConfirmationModal';

interface Product {
  id: string;
  name: string;
  variants: ProductVariant[];
}

interface ProductVariant {
  weight: '5kg' | '10kg' | '25kg';
  shortDescription: string;
  longDescription: string;
  image: string;
  stock: number;
  stockUnit: string;
  price: number;
}

interface FormData extends Product {
  // Combined product and variant data
}

interface AdminPageProps {
  onNavigate: (page: string) => void;
}

export default function AdminPage({ onNavigate }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [products, setProducts] = useState<Product[]>([
    {
      id: 'PROD-001',
      name: 'Premium Jasmine Rice',
      variants: [
        {
          weight: '5kg',
          shortDescription: 'Fragrant long-grain jasmine rice',
          longDescription: 'Premium Thai jasmine rice with naturally sweet aroma and fluffy texture. Perfect for any meal.',
          image: 'https://images.unsplash.com/photo-1686820740687-426a7b9b2043',
          stock: 150,
          stockUnit: 'bags',
          price: 24.99
        }
      ]
    },
    {
      id: 'PROD-002',
      name: 'Premium Basmati Rice',
      variants: [
        {
          weight: '5kg',
          shortDescription: 'Authentic aged basmati rice',
          longDescription: 'Authentic aged basmati rice with distinct aroma, perfect for biryani and pilaf dishes.',
          image: 'https://images.unsplash.com/photo-1633945274417-ab205ae69d10',
          stock: 200,
          stockUnit: 'bags',
          price: 29.99
        }
      ]
    }
  ]);

  const handleFormSubmit = (formData: FormData) => {
    setPendingFormData(formData);
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    if (pendingFormData) {
      // Check if updating existing product or adding new
      const existingIndex = products.findIndex(p => p.id === pendingFormData.id);

      if (existingIndex >= 0) {
        // Update existing product
        const updatedProducts = [...products];
        updatedProducts[existingIndex] = pendingFormData;
        setProducts(updatedProducts);
      } else {
        // Add new product
        setProducts([...products, pendingFormData]);
      }

      setShowConfirmModal(false);
      setPendingFormData(null);
      alert('Product saved successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Admin Header */}
        <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-3xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-2">
            <Package className="w-10 h-10" />
            <h1 className="text-3xl">Product Management</h1>
          </div>
          <p className="text-green-100">Manage your rice product inventory and variants</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition ${activeTab === 'manage'
              ? 'bg-green-700 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Edit className="w-5 h-5" />
            Manage Products ({products.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'add' ? (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl mb-6 text-gray-900 flex items-center gap-2">
              <Plus className="w-6 h-6 text-green-700" />
              Add New Product
            </h2>
            <ProductForm onSubmit={handleFormSubmit} />
          </div>
        ) : (
          <div className="space-y-6">
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl text-gray-900 mb-2">No Products Yet</h3>
                <p className="text-gray-600 mb-6">Start by adding your first product</p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-full transition"
                >
                  Add Product
                </button>
              </div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-green-700" />
                      {product.name} ({product.id})
                    </h3>
                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">
                      {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <ProductForm
                    product={product}
                    onSubmit={handleFormSubmit}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && pendingFormData && (
        <ConfirmationModal
          formData={pendingFormData}
          onConfirm={handleConfirmSubmit}
          onCancel={() => {
            setShowConfirmModal(false);
            setPendingFormData(null);
          }}
        />
      )}
    </div>
  );
}
