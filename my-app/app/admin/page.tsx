
'use client';

import withAuth from '@/component/withAuth';
import ProductForm from '@/component/productForm';
import { ProductService } from '@/services/products.service';
import { Product } from '@/types/product';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const AdminPage = () => {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, isError, error } = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: ProductService.getAll,
  });

  const { mutate: addProduct } = useMutation({
    mutationFn: (product: Product) => ProductService.create(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const { mutate: updateProduct } = useMutation({
    mutationFn: (product: Product) => ProductService.update(product.id, product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Admin Page</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Add Product</h2>
          <ProductForm onSubmit={addProduct} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Update Product</h2>
          {products.map((product) => (
            <div key={product.id} className="mb-4">
              <ProductForm product={product} onSubmit={updateProduct} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default withAuth(AdminPage, ['admin']);
