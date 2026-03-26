'use client'
import { useState, useEffect } from 'react';
import { Warehouse, Box, Package, Plus, ArrowRight, Edit2, X, RefreshCw } from 'lucide-react';
import { ProductService } from '@/services/products.service';
import { StorageUnit, SKUProduct } from '@/types/product';

interface StorageUnitWithProducts extends StorageUnit {
  products: SKUProduct[];
}

export default function StorageManagement() {
  const [storageUnits, setStorageUnits] = useState<StorageUnitWithProducts[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showAddStorage, setShowAddStorage] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState<StorageUnitWithProducts | null>(null);
  const [newStorageName, setNewStorageName] = useState('');
  const [newStorageLocation, setNewStorageLocation] = useState('');

  const [transferData, setTransferData] = useState({
    fromStorage: '',
    toStorage: '',
    productId: '',
    quantity: 0
  });

  useEffect(() => {
    fetchStorageData();
  }, []);

  const fetchStorageData = async () => {
    setIsLoading(true);
    try {
      const units = await ProductService.getStorageUnits();
      
      const unitsWithProducts = await Promise.all(
        units.map(async (unit) => {
          try {
            const products = await ProductService.getProductsBySKU(unit.id);
            return { ...unit, products: products || [] };
          } catch(e) {
            console.error(`Failed to fetch products for sku ${unit.id}`, e);
            return { ...unit, products: [] };
          }
        })
      );
      
      setStorageUnits(unitsWithProducts);
    } catch (error) {
      console.error('Error fetching storage units:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStorage = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API
    const newStorage: StorageUnitWithProducts = {
      id: `STR-${String(storageUnits.length + 1).padStart(3, '0')}`,
      name: newStorageName,
      products: []
    };
    setStorageUnits([...storageUnits, newStorage]);
    setNewStorageName('');
    setNewStorageLocation('');
    setShowAddStorage(false);
  };

  const handleTransferProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferData.productId || transferData.quantity <= 0) {
      alert("Please select a product and valid quantity");
      return;
    }

    try {
      await ProductService.transferProduct({
        variant_id: parseInt(transferData.productId),
        from_sku: transferData.fromStorage,
        to_sku: transferData.toStorage,
        quantity: transferData.quantity
      });
      alert('Product transferred successfully!');
      setShowTransfer(false);
      setTransferData({ fromStorage: '', toStorage: '', productId: '', quantity: 0 });
      fetchStorageData();
    } catch (error) {
        console.error(error);
        alert('Failed to transfer product. Please check if you have sufficient stock.');
    }
  };

  const getImageUrl = (image: string | string[] | null) => {
    if (!image) return 'https://images.unsplash.com/photo-1686820740687-426a7b9b2043?w=300';
    if (typeof image === 'string') return image;
    return image[0] || 'https://images.unsplash.com/photo-1686820740687-426a7b9b2043?w=300';
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Storage Units</p>
              <h3 className="text-3xl text-gray-900">{isLoading ? '-' : storageUnits.length}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Warehouse className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Products Types</p>
              <h3 className="text-3xl text-gray-900">
                {isLoading ? '-' : storageUnits.reduce((sum, unit) => sum + unit.products.length, 0)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Box className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Stock</p>
              <h3 className="text-3xl text-gray-900">
                {isLoading ? '-' : storageUnits.reduce((sum, unit) => sum + unit.products.reduce((pSum, p) => pSum + p.stock_quantity, 0), 0)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShowAddStorage(true)}
          className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-full transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Storage Unit
        </button>
        <button
          onClick={() => setShowTransfer(true)}
          className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-full transition flex items-center gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          Transfer Products
        </button>
        <button
          onClick={fetchStorageData}
          disabled={isLoading}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-full transition flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="w-8 h-8 text-green-700 animate-spin" />
        </div>
      ) : (
        /* Storage Units Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storageUnits.map((storage) => (
            <div key={storage.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="bg-gradient-to-br from-green-700 to-green-800 p-6 text-white">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl mb-1">{storage.name}</h3>
                    <p className="text-sm text-green-100">ID: {storage.id}</p>
                  </div>
                  <Warehouse className="w-8 h-8" />
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm text-gray-600">Products in Storage</h4>
                  <span className="text-sm text-green-700 font-medium">{storage.products.length} items</span>
                </div>

                <div className="space-y-3 mb-4 flex-1">
                  {storage.products.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No products yet</p>
                  ) : (
                    storage.products.slice(0, 3).map((product, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.product_name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 line-clamp-1">{product.product_name}</p>
                          <p className="text-xs text-gray-500">{product.weight_value} {product.weight_unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900 font-medium">{product.stock_quantity}</p>
                          <p className="text-xs text-gray-500">units</p>
                        </div>
                      </div>
                    ))
                  )}
                  {storage.products.length > 3 && (
                    <p className="text-xs text-center text-gray-500 mt-2">+{storage.products.length - 3} more products</p>
                  )}
                </div>

                <button
                  onClick={() => setSelectedStorage(storage)}
                  className="w-full bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-full transition flex items-center justify-center gap-2 mt-auto"
                >
                  <Edit2 className="w-4 h-4" />
                  Manage Storage
                </button>
              </div>
            </div>
          ))}
          {storageUnits.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-sm">
              <Warehouse className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl text-gray-900 mb-2">No Storage Units</h3>
              <p className="text-gray-500">Add a new storage unit to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Add Storage Modal */}
      {showAddStorage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-gray-900">Add Storage Unit</h2>
                <button
                  onClick={() => setShowAddStorage(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleAddStorage} className="space-y-4">
                <div>
                  <label className="block mb-2 text-gray-900">Storage Name *</label>
                  <input
                    type="text"
                    value={newStorageName}
                    onChange={(e) => setNewStorageName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                    placeholder="e.g., East Warehouse"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-gray-900">Location *</label>
                  <input
                    type="text"
                    value={newStorageLocation}
                    onChange={(e) => setNewStorageLocation(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                    placeholder="e.g., Building D, Section 3"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddStorage(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-full transition"
                  >
                    Add Storage
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Product Modal */}
      {showTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-gray-900">Transfer Product</h2>
                <button
                  onClick={() => setShowTransfer(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleTransferProduct} className="space-y-4">
                <div>
                  <label className="block mb-2 text-gray-900">From Storage *</label>
                  <select
                    value={transferData.fromStorage}
                    onChange={(e) => setTransferData({ ...transferData, fromStorage: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                  >
                    <option value="">Select storage</option>
                    {storageUnits.map(storage => (
                      <option key={storage.id} value={storage.id}>{storage.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-gray-900">To Storage *</label>
                  <select
                    value={transferData.toStorage}
                    onChange={(e) => setTransferData({ ...transferData, toStorage: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                  >
                    <option value="">Select storage</option>
                    {storageUnits.map(storage => (
                      <option key={storage.id} value={storage.id}>{storage.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-gray-900">Product *</label>
                  <select
                    value={transferData.productId}
                    onChange={(e) => setTransferData({ ...transferData, productId: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                  >
                    <option value="">Select product</option>
                    {transferData.fromStorage && storageUnits.find(s => s.id === transferData.fromStorage)?.products.map((product, idx) => (
                      <option key={idx} value={product.variant_id}>
                        {product.product_name} - {product.weight_value} {product.weight_unit} (Available: {product.stock_quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-gray-900">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={transferData.quantity || ''}
                    onChange={(e) => setTransferData({ ...transferData, quantity: parseInt(e.target.value) || 0 })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                    placeholder="Enter quantity"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTransfer(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-full transition"
                  >
                    Transfer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
