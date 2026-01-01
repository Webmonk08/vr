import { Product } from "@/types/product";

const host = "http://localhost:8080"


console.log("env" , host)
export class ProductService {

  static async getAll(): Promise<Product[]> {
    const response = await fetch(`${host}/api/products`);
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    return response.json();
  }

  static async create(product: Product): Promise<Product> {
    const response = await fetch(`${host}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    if (!response.ok) {
      throw new Error('Failed to create product');
    }
    return response.json();
  }

  static async update(id: number, product: Product): Promise<Product> {
    const response = await fetch(`${host}/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    if (!response.ok) {
      throw new Error('Failed to update product');
    }
    return response.json();
  }
}


