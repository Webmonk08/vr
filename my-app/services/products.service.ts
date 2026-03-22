import { Product } from "@/types/product";

const host = "http://localhost:8080"


console.log("env", host)
export class ProductService {

  static async getAll(): Promise<Product[]> {
    console.log("Gonna Send Request for the Product Fetching")
    const response = await fetch(`${host}/api/products/getAll`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to fetch products");
    }
    return data;
  }

  static async create(product: Product): Promise<Product> {
    console.log("request recieved for updation ")
    console.log(product)
    const payload = {
      ...product,
      variants: product.variants.map(v => ({
        ...v,
        image: typeof v.image === 'string' ? [v.image] : v.image
      }))
    };
    const response = await fetch(`${host}/api/products/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to create product');
    }
    return data;
  }

  static async update(id: number, product: Product): Promise<Product> {
    console.log("Updation", product)
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
    const response = await fetch(`${host}/api/products/update/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to update product');
    }
    return data;
  }

  static async deleteProduct(id: number): Promise<void> {
    const response = await fetch(`${host}/api/products/delete/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || data.error || 'Failed to delete product');
    }
  }
}


