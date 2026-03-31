'use client'
import { X, Edit2, Trash2, Plus, Save, Package, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface StorageUnit {
  id: string;
  name: string;
  location: string;
  products: {
    productId: string;
    productName: string;
    variant: string;
    quantity: number;
    image: string;
  }[];
}

interface ManageStorageModalProps {
  storage: StorageUnit;
  onClose: () => void;
  onUpdate: (storage: StorageUnit) => void;
  onDelete: (storageId: string) => void;
  availableProducts: {
    id: string;
    name: string;
    variants: string[];
    image: string;
  }[];
}

export default function ManageStorageModal({ 
  storage, 
  onClose, 
  onUpdate, 
  onDelete,
  availableProducts 
}: ManageStorageModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'products' | 'delete'>('details');
  const [editedStorage, setEditedStorage] = useState<StorageUnit>(storage);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Add Product Form State
  const [newProduct, setNewProduct] = useState({
    productId: '',
    productName: '',
    variant: '',
    quantity: 0,
    image: ''
  });

  const handleUpdateStorage = () => {
    onUpdate(editedStorage);
    setIsEditing(false);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if product already exists
    const existingProductIndex = editedStorage.products.findIndex(
      p => p.productId === newProduct.productId && p.variant === newProduct.variant
    );

    if (existingProductIndex >= 0) {
      // Update quantity if product exists
      const updatedProducts = [...editedStorage.products];
      updatedProducts[existingProductIndex].quantity += newProduct.quantity;
      setEditedStorage({ ...editedStorage, products: updatedProducts });
    } else {
      // Add new product
      setEditedStorage({
        ...editedStorage,
        products: [...editedStorage.products, newProduct]
      });
    }

    // Reset form
    setNewProduct({
      productId: '',
      productName: '',
      variant: '',
      quantity: 0,
      image: ''
    });
    setShowAddProduct(false);
    onUpdate({
      ...editedStorage,
      products: existingProductIndex >= 0 
        ? editedStorage.products.map((p, i) => 
            i === existingProductIndex 
              ? { ...p, quantity: p.quantity + newProduct.quantity }
              : p
          )
        : [...editedStorage.products, newProduct]
    });
  };

  const handleUpdateProductQuantity = (index: number, quantity: number) => {
    const updatedProducts = [...editedStorage.products];
    updatedProducts[index].quantity = quantity;
    setEditedStorage({ ...editedStorage, products: updatedProducts });
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = editedStorage.products.filter((_, i) => i !== index);
    setEditedStorage({ ...editedStorage, products: updatedProducts });
    onUpdate({ ...editedStorage, products: updatedProducts });
  };

  const handleDeleteStorage = () => {
    onDelete(storage.id);
    onClose();
  };

  const handleProductSelect = (productId: string) => {
    const selectedProduct = availableProducts.find(p => p.id === productId);
    if (selectedProduct) {
      setNewProduct({
        ...newProduct,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        image: selectedProduct.image,
        variant: selectedProduct.variants[0] || ''
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl text-gray-900">Manage Storage</h2>
              <p className="text-sm text-gray-600 mt-1">{storage.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                activeTab === 'details'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Edit2 className="w-4 h-4" />
              Details
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                activeTab === 'products'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Package className="w-4 h-4" />
              Products ({editedStorage.products.length})
            </button>
            <button
              onClick={() => setActiveTab('delete')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                activeTab === 'delete'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-green-700 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-800">
                  Update storage unit details including name and location. Changes will be saved immediately.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-gray-900">Storage Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editedStorage.name}
                      onChange={(e) => {
                        setEditedStorage({ ...editedStorage, name: e.target.value });
                        setIsEditing(true);
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                      placeholder="e.g., Main Warehouse"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-gray-900">Location *</label>
                  <input
                    type="text"
                    value={editedStorage.location}
                    onChange={(e) => {
                      setEditedStorage({ ...editedStorage, location: e.target.value });
                      setIsEditing(true);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                    placeholder="e.g., Building A, Section 1"
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <h4 className="text-sm text-gray-600">Storage Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Storage ID</p>
                      <p className="text-gray-900 font-medium">{storage.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Products</p>
                      <p className="text-gray-900 font-medium">{editedStorage.products.length} items</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Stock</p>
                      <p className="text-gray-900 font-medium">
                        {editedStorage.products.reduce((sum, p) => sum + p.quantity, 0)} units
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <p className="text-green-700 font-medium">Active</p>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <button
                    onClick={handleUpdateStorage}
                    className="w-full bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-full transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg text-gray-900">Products in Storage</h3>
                  <p className="text-sm text-gray-600">Manage products and quantities</p>
                </div>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-full transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>

              {/* Products List */}
              <div className="space-y-3">
                {editedStorage.products.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No products in this storage</p>
                    <button
                      onClick={() => setShowAddProduct(true)}
                      className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-full transition"
                    >
                      Add First Product
                    </button>
                  </div>
                ) : (
                  editedStorage.products.map((product, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.image}
                          alt={product.productName}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-gray-900 mb-1">{product.productName}</h4>
                          <p className="text-sm text-gray-500 mb-2">Variant: {product.variant}</p>
                          <div className="flex items-center gap-3">
                            <label className="text-sm text-gray-600">Quantity:</label>
                            <input
                              type="number"
                              min="0"
                              value={product.quantity}
                              onChange={(e) => {
                                handleUpdateProductQuantity(index, parseInt(e.target.value) || 0);
                                setIsEditing(true);
                              }}
                              className="w-24 px-3 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                            />
                            <span className="text-sm text-gray-500">units</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveProduct(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Remove Product"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {isEditing && editedStorage.products.length > 0 && (
                <button
                  onClick={handleUpdateStorage}
                  className="w-full bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-full transition flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save All Changes
                </button>
              )}

              {/* Add Product Modal */}
              {showAddProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl text-gray-900">Add Product to Storage</h3>
                        <button
                          onClick={() => setShowAddProduct(false)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <X className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>

                      <form onSubmit={handleAddProduct} className="space-y-4">
                        <div>
                          <label className="block mb-2 text-gray-900">Select Product *</label>
                          <select
                            value={newProduct.productId}
                            onChange={(e) => handleProductSelect(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                          >
                            <option value="">Choose a product</option>
                            {availableProducts.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {newProduct.productId && (
                          <>
                            <div>
                              <label className="block mb-2 text-gray-900">Variant *</label>
                              <select
                                value={newProduct.variant}
                                onChange={(e) => setNewProduct({ ...newProduct, variant: e.target.value })}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                              >
                                <option value="">Choose a variant</option>
                                {availableProducts
                                  .find(p => p.id === newProduct.productId)
                                  ?.variants.map(variant => (
                                    <option key={variant} value={variant}>
                                      {variant}
                                    </option>
                                  ))}
                              </select>
                            </div>

                            <div>
                              <label className="block mb-2 text-gray-900">Quantity *</label>
                              <input
                                type="number"
                                min="1"
                                value={newProduct.quantity || ''}
                                onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                                placeholder="Enter quantity"
                              />
                            </div>
                          </>
                        )}

                        <div className="flex gap-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowAddProduct(false)}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-full transition"
                          >
                            Add Product
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delete Tab */}
          {activeTab === 'delete' && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-700 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-800 font-medium mb-1">Warning: Permanent Action</p>
                  <p className="text-sm text-red-700">
                    Deleting this storage unit will permanently remove all associated data. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h4 className="text-gray-900">Storage to be deleted:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Storage Name:</span>
                    <span className="text-gray-900 font-medium">{storage.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="text-gray-900 font-medium">{storage.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Products:</span>
                    <span className="text-gray-900 font-medium">{storage.products.length} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Stock:</span>
                    <span className="text-gray-900 font-medium">
                      {storage.products.reduce((sum, p) => sum + p.quantity, 0)} units
                    </span>
                  </div>
                </div>
              </div>

              {storage.products.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-700 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    This storage contains {storage.products.length} product{storage.products.length !== 1 ? 's' : ''}. 
                    Consider transferring them to another storage before deleting.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Storage Unit
                </button>
                <button
                  onClick={onClose}
                  className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-full transition"
                >
                  Cancel
                </button>
              </div>

              {/* Delete Confirmation Modal */}
              {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <Trash2 className="w-8 h-8 text-red-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl text-center text-gray-900 mb-2">Confirm Deletion</h3>
                    <p className="text-center text-gray-600 mb-6">
                      Are you absolutely sure you want to delete <strong>{storage.name}</strong>? 
                      This will permanently remove the storage unit and all its data.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteStorage}
                        className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition"
                      >
                        Yes, Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
