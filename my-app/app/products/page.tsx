'use client';

import { Heart, Search, ShoppingCart } from 'lucide-react';
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

  const { data: products = [], isLoading, isError, error } = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: ProductService.getAll,
  });
  console.log("Products Aquired")
  const { mutate: addToCart } = useMutation({
    mutationFn: ({ productId, variantId, userId }: { productId: number; variantId: number; userId: string; }) =>
      CartService.addItem(productId, variantId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
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
  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError) {
    return <ErrorPage errorType="general" message={error?.message} />;
  }
  console.log("File", filteredProducts)
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-b from-green-50 to-white py-12">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h2 className="mb-4 font-bold text-gray-900 text-4xl text-center">
              Premium Rice Collection
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 text-lg text-center">
              Discover our selection of the finest rice varieties from around the world
            </p>
          </div>

          {/* Search Bar and Add Button */}
          <div className="flex items-center justify-around gap-4 mt-8">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for rice varieties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent shadow-sm"
                />
              </div>
            </div>

            {/* Add Product Button */}
            {role === 'admin' || role === 'owner' && (
              <div className="flex-shrink-0">
                <Link
                  href="/addproducts"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md whitespace-nowrap"
                >
                  Add Product +
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>     {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="flex lg:flex-row flex-col gap-8">
          {/* Sidebar - Categories removed */}
          <aside className="lg:w-64 shrink-0">
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
              </p>
              <select title={"sort"} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating: High to Low</option>
              </select>
            </div>

            <div className="gap-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.length > 0 && filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white shadow-sm hover:shadow-md rounded-lg transition"
                >
                  <div className="flex justify-center items-center bg-green-50 group-hover:bg-green-100 p-8 rounded-t-lg transition">
                    <img src={product.variants[0].image} alt={product.name} className="h-40 object-contain" />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>

                    </div>
                    <p className="mb-3 text-gray-600 text-sm">{product.variants[0]?.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-gray-900 text-2xl">${product.variants[0]?.price}</span>
                        <span className="ml-2 text-gray-600 text-sm">/ {product.name}</span>
                      </div>
                      <button
                        onClick={() => {
                          const userId = user ? user.id : 'guest';
                          addToCart({ productId: product.id, variantId: product.variants[0]?.id, userId });
                        }}
                        className="flex items-center space-x-2 bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg text-white transition"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

    </div >
  );
}

export default products;
