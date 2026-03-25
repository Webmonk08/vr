import { Product } from "@/types/product";
import { apiClient, ApiException } from "@/lib/api-client";

export class ProductService {

  static async getAll(): Promise<Product[]> {
    try {
      const data = await apiClient.get<Product[]>('/api/products/getAll');
      return data;
    } catch (error) {
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
      return data;
    } catch (error) {
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
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteProduct(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/products/delete/${id}`);
    } catch (error) {
      throw error;
    }
  }
}
