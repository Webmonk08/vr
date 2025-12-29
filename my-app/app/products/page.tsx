
'use client';

import { Heart, Search, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { ProductService } from '@/services/products.service';
import { CartService } from '@/services/cart.service';
import { Product, ProductVariant } from '@/types/product';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const products = () => {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, isError, error } = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: ProductService.getAll,
  });

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

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    throw error;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-b from-green-50 to-white py-12">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-8 text-center">
            <h2 className="mb-4 font-bold text-gray-900 text-4xl">Premium Rice Collection</h2>
            <p className="mx-auto max-w-2xl text-gray-600 text-lg">
              Discover our selection of the finest rice varieties from around the world
            </p>
          </div>

          {/* Search Bar */}
          <div className="mx-auto max-w-xl">
            <div className="relative">
              <Search className="top-1/2 left-4 absolute w-5 h-5 text-gray-600 -translate-y-1/2 transform" />
              <input
                type="text"
                placeholder="Search for rice varieties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-3 pr-4 pl-12 border border-gray-300 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="flex lg:flex-row flex-col gap-8">
          {/* Sidebar - Categories removed */}
          <aside className="flex-shrink-0 lg:w-64">
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
              </p>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating: High to Low</option>
              </select>
            </div>

            <div className="gap-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
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
                      <button className="text-gray-600 hover:text-green-700 transition">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="mb-3 text-gray-600 text-sm">{product.variants[0].description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-gray-900 text-2xl">${product.variants[0].price}</span>
                        <span className="ml-2 text-gray-600 text-sm">/ {product.variants[0].name}</span>
                      </div>
                      <button
                        onClick={() => {
                          const userId = user ? user.id : 'guest';
                          addToCart({ productId: product.id, variantId: product.variants[0].id, userId });
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

    </div>
  );
}

export default products;
