import { useState, useEffect } from 'react'
import { Package, Tag, FileText, Image as ImageIcon, Box, DollarSign, Hash, Scale, Upload, Loader2, X } from 'lucide-react';
import { Product, ProductVariant } from '@/types/product';
import { ProductService } from '@/services/products.service';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: Product) => void;
}
export function ProductForm({ product, onSubmit }: ProductFormProps) {
  const [isUploading, setIsUploading] = useState<{ [key: number]: boolean }>({});

  const formatVariants = (variants?: ProductVariant[] | any[]) => {
    if (!variants || variants.length === 0) {
      return [{
        id: 0,
        weight: '5kg',
        shortDescription: '',
        description: '',
        image: '',
        storageUnitId: null,
        stock: 0,
        price: 0,
        isdefault: false
      }];
    }
    return variants.map(v => ({
      ...v,
      weight: typeof v.weight === 'string' ? v.weight.replace(/\s+/g, '') : v.weight,
      image: Array.isArray(v.image) ? v.image[0] || '' : v.image
    }));
  };

  const [formData, setFormData] = useState<Product>({
    id: product?.id || 0,
    name: product?.name || '',
    variants: formatVariants(product?.variants)
  });



  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        variants: formatVariants(product.variants)
      });
    }
  }, [product]);

  const handleProductChange = (field: keyof Product, value: string) => {
    if (field === 'id') {
      setFormData({ ...formData, [field]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    
    const updatedVariants = formData.variants.map((v, i) =>
      i === index ? { ...v, [field]: value } : v
    );
    setFormData(prev => ({ ...prev, variants: updatedVariants }));
    (formData['variants'])
  };

  const handleImageUpload = async (index: number, file: File) => {
    try {
      setIsUploading(prev => ({ ...prev, [index]: true }));
      const imageUrl = await ProductService.uploadImage(file);
      handleVariantChange(index, 'image', imageUrl);
    } catch (error) {
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(prev => ({ ...prev, [index]: false }));
    }
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          id: 0,
          weight: '5kg',
          shortDescription: '',
          description: '',
          image: '',
          stock: 0,
          price: 0,
          isdefault: false
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
      if (!variant.shortDescription || !variant.description || !variant.image || variant.stock <= 0 || variant.price <= 0) {
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
                      value={variant.description}
                      onChange={(e) => handleVariantChange(index, 'description', e.target.value)}
                      placeholder="Detailed description of the product..."
                      rows={4}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-green-700 focus:outline-none resize-none"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-4">
                    {variant.description.length} characters
                  </p>
                </div>
                {/* Is Default */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={variant.isdefault}
                      onChange={(e) => handleVariantChange(index, 'isdefault', e.target.checked)}
                      className="w-5 h-5 rounded-sm border-gray-300 text-green-700 focus:ring-green-700"
                    />
                    Set as Default
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-4">
                    If this product is given default then it will appear in the home page
                  </p>
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">
                    Product Image <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col gap-4">
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(index, file);
                        }}
                        className="hidden"
                        id={`image-upload-${index}`}
                        disabled={isUploading[index]}
                      />
                      <label
                        htmlFor={`image-upload-${index}`}
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all
                          ${isUploading[index] ? 'bg-gray-50 border-gray-300' : 'bg-gray-50 border-gray-300 hover:border-green-500 hover:bg-green-50'}`}
                      >
                        {isUploading[index] ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 text-green-700 animate-spin" />
                            <span className="text-sm text-gray-500">Uploading...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="w-8 h-8 text-gray-400 group-hover:text-green-600" />
                            <span className="text-sm text-gray-500">Click to upload or drag and drop</span>
                            <span className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</span>
                          </div>
                        )}
                      </label>
                    </div>

                    {variant.image && (
                      <div className="relative w-32 h-32">
                        <img
                          src={variant.image}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleVariantChange(index, 'image', '')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock Information Container */}
                <div className="md:col-span-2">
                  <div className="bg-white rounded-2xl p-4 border-2 border-green-100">
                    <label className="block text-sm text-gray-700 mb-3">
                      <Box className="w-4 h-4 inline mr-2 text-green-700" />
                      Stock Information <span className="text-red-500">*</span>
                    </label>

                    <div className="grid grid-cols-1 gap-4">


                      {/* Stock Quantity */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-2">
                          Quantity
                        </label>
                        <div className="relative">
                          <Hash className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="number"
                            min="0"
                            value={variant.stock}
                            onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value))}
                            placeholder="0"
                            className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-full focus:border-green-700 focus:outline-none text-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>
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
                id: 0,
                name: '',
                variants: [
                  {
                    id: 0,
                    weight: '5kg',
                    shortDescription: '',
                    description: '',
                    image: '',
                    stock: 0,
                    price: 0,
                    isdefault: false
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
