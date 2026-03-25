import { Product } from "@/types/product";
import { apiClient, ApiException } from "@/lib/api-client";
import { toast } from "@/store/useToastStore";

export class ProductService {

  static async getAll(): Promise<Product[]> {
    try {
      const data = await apiClient.get<Product[]>('/api/products/getAll');
      return data;
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.getUserMessage());
      } else {
        toast.error('Failed to fetch products');
      }
      throw error;
    }
  }

  static async create(product: Product): Promise<Product> {
    try {
      const payload = {
        ...product,
        variants: product.variants.map(v => ({
          ...v,
          image: typeof v.image === 'string' ? [v.image] : v.image
        }))
      };
      const data = await apiClient.post<Product>('/api/products/create', payload);
      toast.success('Product created successfully');
      return data;
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.getUserMessage());
      } else {
        toast.error('Failed to create product');
      }
      throw error;
    }
  }

  static async update(id: number, product: Product): Promise<Product> {
    try {
      const payload = {
        id: id,
        data: {
          ...product,
          variants: product.variants.map(v => ({
            ...v,
            image: typeof v.image === 'string' ? [v.image] : v.image
          }))
        }
      };
      const data = await apiClient.post<Product>(`/api/products/update/${id}`, payload);
      toast.success('Product updated successfully');
      return data;
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.getUserMessage());
      } else {
        toast.error('Failed to update product');
      }
      throw error;
    }
  }

  static async deleteProduct(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/products/delete/${id}`);
      toast.success('Product deleted successfully');
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.getUserMessage());
      } else {
        toast.error('Failed to delete product');
      }
      throw error;
    }
  }
}
