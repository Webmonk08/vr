'use client';

import { Search, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { ProductService } from '@/services/products.service';
import { CartService } from '@/services/cart.service';
import { Product } from '@/types/product';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingPage from '@/component/loadingPage';
import { ErrorPage } from '@/component/error-page';
import Link from 'next/link';

const products = () => {
  const { user, role } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: ProductService.getAll,
  });
  const products = data || [];

  const { mutate: addToCart } = useMutation({
    mutationFn: ({ productId, variantId, userId }: { productId: number; variantId: number; userId: string }) =>
      CartService.addItem(productId, variantId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  useEffect(() => {
    if (isError) {
      console.error(error);
    }
  }, [isError, error]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      Array.isArray(product.variants) &&
      product.variants.length > 0
  );

  const displayItems = filteredProducts.flatMap(product => 
    product.variants.map(variant => ({ product, variant }))
  );

  if (isLoading) return <LoadingPage />;
  if (isError) return <ErrorPage errorType="general" message={error?.message} />;

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero / Header Section */}
      <div className="bg-gradient-to-b from-green-50 to-white py-12">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

          {/* Title */}
          <div className="mb-8 text-center">
            <h2 className="mb-3 font-bold text-gray-900 text-3xl sm:text-4xl">
              Premium Rice Collection
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 text-base sm:text-lg">
              Discover our selection of the finest rice varieties from around the world
            </p>
          </div>

          {/* Search Bar + ADMIN Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 max-w-3xl mx-auto">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search for rice varieties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent shadow-sm bg-white"
              />
            </div>

            {/* Add Product — only for ADMIN/OWNER */}
            {(role === 'ADMIN' || role === 'OWNER') && (
              <Link
                href="/addproducts"
                className="flex-shrink-0 inline-flex items-center px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md whitespace-nowrap w-full sm:w-auto justify-center"
              >
                Add Product +
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-7xl">

        {/* Toolbar row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <p className="text-gray-600 text-sm sm:text-base">
            Showing <span className="font-semibold text-gray-900">{displayItems.length}</span>{' '}
            {displayItems.length === 1 ? 'product' : 'products'}
          </p>
          <select
            title="sort"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 text-sm bg-white"
          >
            <option>Sort by: Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Rating: High to Low</option>
          </select>
        </div>

        {/* Product Grid */}
        {displayItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayItems.map(({ product, variant }) => (
              <div
                key={`${product.id}-${variant.id}`}
                className="group flex flex-col bg-white shadow-sm hover:shadow-md rounded-xl transition overflow-hidden"
              >
                {/* Image area */}
                <div className="flex justify-center items-center bg-green-50 group-hover:bg-green-100 p-8 transition">
                  <img
                    src={variant.image}
                    alt={`${product.name} ${variant.weight}`}
                    className="h-36 w-auto object-contain"
                  />
                </div>

                {/* Card body */}
                <div className="flex flex-col flex-1 p-5 gap-2">
                  <h3 className="font-bold text-gray-900 text-base leading-snug">{product.name} - {variant.weight}</h3>
                  <p className="text-gray-500 text-sm flex-1 line-clamp-2">
                    {variant.description}
                  </p>

                  {/* Price + CTA */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <span className="font-bold text-gray-900 text-xl">
                        ${variant.price}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const userId = user ? user.id : 'guest';
                        addToCart({ productId: product.id, variantId: variant.id, userId });
                      }}
                      className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 active:scale-95 px-3 py-2 rounded-lg text-white text-sm font-medium transition"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center text-gray-500 gap-3">
            <Search className="w-10 h-10 text-gray-300" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm">Try adjusting your search query.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default products;