
'use client';

import { useState } from 'react';
import { Product } from '@/types/product';

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: Product) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit }) => {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.variants[0]?.description || '');
  const [price, setPrice] = useState(product?.variants[0]?.price || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: product?.id || 0,
      name,
      category_id: product?.category_id || 0,
      variants: [
        {
          id: product?.variants[0]?.id || 0,
          name: product?.variants[0]?.name || '',
          price,
          stock: product?.variants[0]?.stock || 0,
          description,
          image: product?.variants[0]?.image || '',
        },
      ],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Product Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="description" className="text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="price" className="text-sm font-medium text-gray-700">
          Price
        </label>
        <input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        {product ? 'Update Product' : 'Add Product'}
      </button>
    </form>
  );
};

export default ProductForm;
