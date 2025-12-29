import { Product } from "@/types/page-specific";

export class ProductService {


  static async getAll(): Promise<Product[]> {
    const response = await fetch("/api/products/getAll");
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    return response.json();
  }

  static async insertProduct(image: File, data: Product): Promise<Product[]> {
    const formData = new FormData();

    formData.append('image', image)
    formData.append('product', JSON.stringify(data))

    const res = await fetch("/api/insertProduct", {
      method: "POST",
      body: formData
    })

    return res.json()
  }
}


