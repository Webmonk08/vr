'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductService } from '@/services/products.service';
import { CartService } from '@/services/cart.service';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { toast } from '@/store/useToastStore';
import LoadingPage from '@/component/loadingPage';
import { ErrorPage } from '@/component/error-page';
import { ProductPage } from '@/component/ProductDetailsPage';
import { Product, ProductVariant } from '@/types/product';

export default function ProductDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { addToCart: guestAddToCart } = useCartStore();

  const id = parseInt(params.id as string);
  const variantId = searchParams.get('variantId') ? parseInt(searchParams.get('variantId')!) : null;

  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => ProductService.getById(id),
    enabled: !!id,
  });

  const { mutate: addCartMutation } = useMutation({
    mutationFn: ({ productId, variantId, userId, quantity }: { productId: number; variantId: number; userId: string, quantity: number }) =>
      CartService.addItem(productId, variantId, userId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success("Successfully added to cart!");
    },
    onError: () => {
      toast.error("Failed to add to cart.");
    }
  });

  const handleAddToCart = (productParam: Product, variantParam: ProductVariant, quantity = 1) => {
    if (user) {
      addCartMutation({ productId: productParam.id, variantId: variantParam.id, userId: user.id, quantity });
    } else {
      guestAddToCart({ product: productParam, variant: variantParam, quantity, id: Date.now() } as any);
      toast.success("Successfully added to cart!");
    }
  };

  if (isLoading) return <LoadingPage />;
  if (isError) return <ErrorPage errorType="general" message={(error as any)?.message} />;
  if (!product) return <ErrorPage errorType="404" message="Product not found" />;

  const selectedVariant = variantId 
    ? product.variants.find(v => v.id === variantId) || product.variants[0]
    : product.variants.find(v => v.isdefault) || product.variants[0];

  return (
    <ProductPage 
      product={product} 
      selectedVariant={selectedVariant} 
      onNavigate={(page) => {
        if (page === 'products' || page === 'home') {
          router.push('/products');
        } else if (page === 'cart') {
          router.push('/cart');
        }
      }} 
      onAddToCart={(item: any) => {
        handleAddToCart(product, selectedVariant, item.quantity || 1);
      }} 
    />
  );
}
