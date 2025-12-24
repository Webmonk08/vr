
'use client'
import CategoryFilter from '@/component/CategoryFilter';
import Header from '@/component/header';
import ProductCard from '@/component/productCard';
import { Tables } from '@/store/useCartStore';
import { useEffect, useState } from 'react';


const mockCategories: Tables<'categories'>[] = [
  { id: 1, name: 'Electronics', slug: 'electronics', image_url: null },
  { id: 2, name: 'Clothing', slug: 'clothing', image_url: null },
  { id: 3, name: 'Home & Garden', slug: 'home-garden', image_url: null },
  { id: 4, name: 'Sports', slug: 'sports', image_url: null },
];

const mockProducts: (Tables<'products'> & { variant: Tables<'product_variants'> })[] = [
  {
    id: 1,
    name: 'Wireless Headphones',
    category_id: 1,
    variant: {
      id: 1,
      product_id: 1,
      price: 79.99,
      sku: 'WH-001',
      stock_quantity: 50,
      weight_value: 250,
      weight_unit: 'g',
      is_default: true,
    },
  },
  {
    id: 2,
    name: 'Smart Watch',
    category_id: 1,
    variant: {
      id: 2,
      product_id: 2,
      price: 199.99,
      sku: 'SW-001',
      stock_quantity: 30,
      weight_value: 45,
      weight_unit: 'g',
      is_default: true,
    },
  },
  {
    id: 3,
    name: 'Running Shoes',
    category_id: 4, variant: {
      id: 3,
      product_id: 3,
      price: 89.99,
      sku: 'RS-001',
      stock_quantity: 100,
      weight_value: 400,
      weight_unit: 'g',
      is_default: true,
    },
  },
  {
    id: 4,
    name: 'Cotton T-Shirt',
    category_id: 2,
    variant: {
      id: 4,
      product_id: 4,
      price: 24.99,
      sku: 'TS-001',
      stock_quantity: 200,
      weight_value: 150,
      weight_unit: 'g',
      is_default: true,
    },
  },
  {
    id: 5,
    name: 'LED Desk Lamp',
    category_id: 3,
    variant: {
      id: 5,
      product_id: 5,
      price: 45.99,
      sku: 'DL-001',
      stock_quantity: 75,
      weight_value: 800,
      weight_unit: 'g',
      is_default: true,
    },
  },
  {
    id: 6,
    name: 'Yoga Mat',
    category_id: 4,
    variant: {
      id: 6,
      product_id: 6,
      price: 34.99,
      sku: 'YM-001',
      stock_quantity: 60,
      weight_value: 1200,
      weight_unit: 'g',
      is_default: true,
    },
  },
];




export default function EcommercePlatform() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);

  useEffect(() => {
    if (selectedCategory === null) {
      setFilteredProducts(mockProducts);
    } else {
      setFilteredProducts(
        mockProducts.filter((p) => p.category_id === selectedCategory)
      );
    }
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 shrink-0">
            <CategoryFilter
              categories={mockCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </aside>

          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory === null
                  ? 'All Products'
                  : mockCategories.find((c) => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-gray-600 mt-1">{filteredProducts.length} products found</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
