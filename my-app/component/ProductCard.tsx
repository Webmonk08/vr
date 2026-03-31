import React from 'react';
import { Edit, Box, Trash2 } from 'lucide-react';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onDelete: (e: React.MouseEvent, id: number) => void;
}

export function ProductCard({ product, onSelect, onDelete }: ProductCardProps) {
  const variants = product.variants || [];

  return (
    <div
      onClick={() => onSelect(product)}
      className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition cursor-pointer group"
    >
      {/* Product Image */}
      <div className="h-48 overflow-hidden bg-gray-100">
        <img
          src={Array.isArray(variants[0]?.image) ? variants[0].image[0] : (variants[0]?.image || '')}
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
              <span className="text-gray-900">{variants[0].stock}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-2.5 rounded-full transition flex items-center justify-center gap-2 text-sm"
          >
            <Edit className="w-4 h-4" />
            Edit Product
          </button>
          <button
            onClick={(e) => onDelete(e, product.id)}
            className="flex-shrink-0 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition flex items-center justify-center gap-2 text-sm"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
