'use client'
import { useState } from 'react';
import { Package, Plus, Edit, ArrowLeft, Box, Trash2 } from 'lucide-react';
import { ProductForm } from '@/component/ProductForm';
import { ProductCard } from '@/component/ProductCard';
import { ConfirmationModal } from '@/component/ConfirmationModal';
import withAuth from '@/component/withAuth';
import { Product } from '@/types/product';
import { ProductService } from '@/services/products.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingPage from '@/component/loadingPage';


interface FormData extends Product {
  // Combined product and variant data
}


const ProductManagement = () => {
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: ProductService.getAll,
  });
  const products = data || [];

  const createProductMutation = useMutation({
    mutationFn: ProductService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowConfirmModal(false);
      setPendingFormData(null);
      setSelectedProduct(null);
      alert('Product saved successfully!');
    },
    onError: (error) => {
      console.error(error);
      alert('Failed to save product');
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: (data: { id: number; product: Product }) => ProductService.update(data.id, data.product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowConfirmModal(false);
      setPendingFormData(null);
      setSelectedProduct(null);
      alert('Product updated successfully!');
    },
    onError: (error) => {
      console.error(error);
      alert('Failed to update product');
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: ProductService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      alert('Product deleted successfully!');
    },
    onError: (error) => {
      console.error(error);
      alert('Failed to delete product');
    }
  });

  const handleDeleteProduct = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleFormSubmit = (formData: Product) => {
    // Check for duplicate product name (case-insensitive) using already-fetched products
    const duplicate = products.find(
      (p) => p.name.toLowerCase() === formData.name.toLowerCase() && p.id !== formData.id
    );
    if (duplicate) {
      alert('A product with this name already exists. Please use a different name.');
      return;
    }

    setPendingFormData(formData);
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    if (pendingFormData) {
      // Check if updating existing product or adding new
      const existingProduct = products.find(p => p.id == pendingFormData.id);

      if (existingProduct) {
        // Update existing product
        updateProductMutation.mutate({ id: pendingFormData.id, product: pendingFormData });
      } else {
        // Add new product
        createProductMutation.mutate(pendingFormData);
      }
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }
  console.log(products)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ADMIN Header */}
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
            onClick={() => setActiveTab(activeTab == 'add' ? 'manage' : 'add')}
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
          <div>
            {/* If a product is selected for editing */}
            {selectedProduct ? (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex items-center gap-2 text-gray-600 hover:text-green-700 mb-6 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Products
                </button>
                <h2 className="text-2xl mb-6 text-gray-900 flex items-center gap-2">
                  <Edit className="w-6 h-6 text-green-700" />
                  Edit Product: {selectedProduct.name}
                </h2>
                <ProductForm
                  product={selectedProduct}
                  onSubmit={handleFormSubmit}
                />
              </div>
            ) : (
              /* Product Cards Grid */
              <div>
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
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={setSelectedProduct}
                        onDelete={handleDeleteProduct}
                      />
                    ))}
                  </div>
                )}
              </div>
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


export default withAuth(ProductManagement, ['ADMIN', 'OWNER', 'MANAGER']);
