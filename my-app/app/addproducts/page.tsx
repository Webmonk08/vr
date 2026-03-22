'use client'
import { useState } from 'react';
import { Package, Plus, Edit, ArrowLeft, Box, Trash2 } from 'lucide-react';
import { ProductForm } from '@/component/ProductForm';
import { ConfirmationModal } from '@/component/ConfirmationModal';
import withAuth from '@/component/withAuth';
import { Product } from '@/types/product';
import { ProductService } from '@/services/products.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingPage from '@/component/loadingPage';


interface FormData extends Product {
  // Combined product and variant data
}


function ADMINPage() {
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
                    {products.map((product) => {
                      const variants = product.variants || [];
                      return (
                      <div
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition cursor-pointer group"
                      >
                        {/* Product Image */}
                        <div className="h-48 overflow-hidden bg-gray-100">
                          <img
                            src={variants[0]?.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg text-gray-900 mb-1">{product.name}</h3>
                              <p className="text-sm text-gray-500">ID: {product.id}</p>
                            </div>
                            <Edit className="w-5 h-5 text-green-700 opacity-0 group-hover:opacity-100 transition" />
                          </div>

                          {/* Variants Info */}
                          <div className="flex items-center gap-2 mb-4">
                            <Box className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {variants.length} Variant{variants.length !== 1 ? 's' : ''}
                            </span>
                          </div>

                          {/* First Variant Details */}
                          {variants[0] && (
                            <div className="space-y-2 pt-4 border-t border-gray-100">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Weight:</span>
                                <span className="text-gray-900">{variants[0].weight}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Price:</span>
                                <span className="text-green-700 font-medium">${variants[0].price.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Stock:</span>
                                <span className="text-gray-900">{variants[0].stock} {variants[0].sku}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">SKU:</span>
                                <span className="text-gray-900 font-mono text-xs">{variants[0].sku}</span>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct(product);
                              }}
                              className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-2.5 rounded-full transition flex items-center justify-center gap-2 text-sm"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Product
                            </button>
                            <button
                              onClick={(e) => handleDeleteProduct(e, product.id)}
                              className="flex-shrink-0 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition flex items-center justify-center gap-2 text-sm"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                    })}
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


export default withAuth(ADMINPage, ['ADMIN', 'OWNER']);
