
import { X, CheckCircle, Package, Tag, Scale, DollarSign, Box } from 'lucide-react';

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

interface ConfirmationModalProps {
  formData: Product;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({ formData, onConfirm, onCancel }: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-green-700 to-green-800 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8" />
            <div>
              <h2 className="text-2xl">Confirm Product Details</h2>
              <p className="text-green-100 text-sm">Please review the information before submitting</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Product Information */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-green-100">
              <Package className="w-5 h-5 text-green-700" />
              <h3 className="text-lg text-gray-900">Product Information</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Product ID</p>
                <p className="text-gray-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-green-700" />
                  {formData.id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Product Name</p>
                <p className="text-gray-900">{formData.name}</p>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-green-100">
              <Box className="w-5 h-5 text-green-700" />
              <h3 className="text-lg text-gray-900">
                Product Variants ({formData.variants.length})
              </h3>
            </div>

            <div className="space-y-4">
              {formData.variants.map((variant, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-gray-900">Variant {index + 1}</h4>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <Scale className="w-3 h-3" />
                      {variant.weight}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Image Preview */}
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-2">Product Image</p>
                      <img
                        src={variant.image}
                        alt={formData.name}
                        className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Price</p>
                      <p className="text-2xl text-gray-900 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-700" />
                        {variant.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Stock */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Stock</p>
                      <p className="text-2xl text-gray-900 flex items-center gap-2">
                        <Box className="w-5 h-5 text-green-700" />
                        {variant.stock} {variant.stockUnit}
                      </p>
                    </div>

                    {/* Short Description */}
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Short Description</p>
                      <p className="text-gray-900 bg-white rounded-xl p-3">
                        {variant.shortDescription}
                      </p>
                    </div>

                    {/* Long Description */}
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Long Description</p>
                      <p className="text-gray-900 bg-white rounded-xl p-3 leading-relaxed">
                        {variant.longDescription}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 flex gap-3">
            <div className="text-yellow-600 mt-0.5">⚠️</div>
            <div>
              <p className="text-sm text-gray-900 mb-1">Please verify all information</p>
              <p className="text-xs text-gray-600">
                Make sure all product details, prices, and stock quantities are correct before submitting.
                This information will be visible to customers.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 py-3 rounded-full transition"
          >
            Cancel & Edit
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white py-3 rounded-full transition flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Confirm & Submit
          </button>
        </div>
      </div>
    </div>
  );
}
