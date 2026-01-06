
import { useState, useEffect } from 'react';
import { Package, Tag, FileText, Image as ImageIcon, Box, DollarSign, Hash, Scale } from 'lucide-react';

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

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: Product) => void;
}

export function ProductForm({ product, onSubmit }: ProductFormProps) {
  const [formData, setFormData] = useState<Product>({
    id: product?.id || '',
    name: product?.name || '',
    variants: product?.variants || [
      {
        weight: '5kg',
        shortDescription: '',
        longDescription: '',
        image: '',
        stock: 0,
        stockUnit: 'bags',
        price: 0
      }
    ]
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleProductChange = (field: keyof Product, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setFormData({ ...formData, variants: updatedVariants });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          weight: '5kg',
          shortDescription: '',
          longDescription: '',
          image: '',
          stock: 0,
          stockUnit: 'bags',
          price: 0
        }
      ]
    });
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      const updatedVariants = formData.variants.filter((_, i) => i !== index);
      setFormData({ ...formData, variants: updatedVariants });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.id || !formData.name) {
      alert('Please fill in Product ID and Name');
      return;
    }

    for (let i = 0; i < formData.variants.length; i++) {
      const variant = formData.variants[i];
      if (!variant.shortDescription || !variant.longDescription || !variant.image || variant.stock <= 0 || variant.price <= 0) {
        alert(`Please complete all fields for variant ${i + 1}`);
        return;
      }
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Product Information Section */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-green-100">
          <Package className="w-5 h-5 text-green-700" />
          <h3 className="text-lg text-gray-900">Product Information</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Product ID */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Product ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.id}
                onChange={(e) => handleProductChange('id', e.target.value)}
                placeholder="e.g., PROD-001"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:border-green-700 focus:outline-none"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-4">Unique identifier for the product</p>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleProductChange('name', e.target.value)}
                placeholder="e.g., Premium Jasmine Rice"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:border-green-700 focus:outline-none"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-4">Display name for the product</p>
          </div>
        </div>
      </div>

      {/* Product Variants Section */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-green-100">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-green-700" />
            <h3 className="text-lg text-gray-900">Product Variants</h3>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-full transition"
          >
            + Add Variant
          </button>
        </div>

        <div className="space-y-6">
          {formData.variants.map((variant, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-6 relative">
              {formData.variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="absolute top-4 right-4 text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}

              <h4 className="mb-4 text-gray-900">Variant {index + 1}</h4>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Weight */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Weight <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Scale className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <select
                      value={variant.weight}
                      onChange={(e) => handleVariantChange(index, 'weight', e.target.value as '5kg' | '10kg' | '25kg')}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:border-green-700 focus:outline-none appearance-none bg-white"
                      required
                    >
                      <option value="5kg">5 kg</option>
                      <option value="10kg">10 kg</option>
                      <option value="25kg">25 kg</option>
                    </select>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={variant.price}
                      onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value))}
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:border-green-700 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">
                    Short Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-gray-400 absolute left-4 top-4" />
                    <input
                      type="text"
                      value={variant.shortDescription}
                      onChange={(e) => handleVariantChange(index, 'shortDescription', e.target.value)}
                      placeholder="Brief description of the product (max 100 characters)"
                      maxLength={100}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-green-700 focus:outline-none"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-4">
                    {variant.shortDescription.length}/100 characters
                  </p>
                </div>

                {/* Long Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">
                    Long Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-gray-400 absolute left-4 top-4" />
                    <textarea
                      value={variant.longDescription}
                      onChange={(e) => handleVariantChange(index, 'longDescription', e.target.value)}
                      placeholder="Detailed description of the product..."
                      rows={4}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-green-700 focus:outline-none resize-none"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-4">
                    {variant.longDescription.length} characters
                  </p>
                </div>

                {/* Image URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">
                    Image URL <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <ImageIcon className="w-4 h-4 text-gray-400 absolute left-4 top-4" />
                    <input
                      type="url"
                      value={variant.image}
                      onChange={(e) => handleVariantChange(index, 'image', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-green-700 focus:outline-none"
                      required
                    />
                  </div>
                  {variant.image && (
                    <div className="mt-3 ml-4">
                      <img
                        src={variant.image}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Box className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value))}
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:border-green-700 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Stock Unit */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Stock Unit <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <select
                      value={variant.stockUnit}
                      onChange={(e) => handleVariantChange(index, 'stockUnit', e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:border-green-700 focus:outline-none appearance-none bg-white"
                      required
                    >
                      <option value="bags">Bags</option>
                      <option value="boxes">Boxes</option>
                      <option value="units">Units</option>
                      <option value="pallets">Pallets</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="flex-1 bg-green-700 hover:bg-green-800 text-white py-4 rounded-full transition flex items-center justify-center gap-2"
        >
          <Package className="w-5 h-5" />
          {product ? 'Update Product' : 'Add Product'}
        </button>
        {!product && (
          <button
            type="button"
            onClick={() => {
              setFormData({
                id: '',
                name: '',
                variants: [
                  {
                    weight: '5kg',
                    shortDescription: '',
                    longDescription: '',
                    image: '',
                    stock: 0,
                    stockUnit: 'bags',
                    price: 0
                  }
                ]
              });
            }}
            className="px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-4 rounded-full transition"
          >
            Reset
          </button>
        )}
      </div>
    </form>
  );
}
