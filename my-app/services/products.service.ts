import { Product } from "@/types/product";

const host = "http://localhost:8080"


console.log("env", host)
export class ProductService {

  static async getAll(): Promise<Product[]> {
    console.log("Gonna Send Request for the Product Fetching")
    const response = await fetch(`${host}/api/products/getAll`);
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    return response.json();
  }

  static async create(product: Product): Promise<Product> {
    console.log("request recieved for updation ")
    console.log(product)
    const response = await fetch(`${host}/api/products/create`, {
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
    console.log("Updation", product)
    const response = await fetch(`${host}/api/products/update/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
        data: product,
      })
      ,
    });
    if (!response.ok) {
      throw new Error('Failed to update product');
    }
    return response.json();
  }
}


