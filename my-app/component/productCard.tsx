import { Package } from 'lucide-react'; import {
  Tables, useCartStore,
  CartItemWithProduct
} from '@/store/useCartStore';

const ProductCard = ({ product }: {
  product: Tables<'products'> & {
    variant:
    Tables<'product_variants'>
  }
}) => {
  const { addToCart } =
    useCartStore();

  const handleAddToCart = () => {
    const cartItem: CartItemWithProduct =
    {
      id: Math.random(), cart_id: 'temp-cart', product_id: product.variant.id,
      quantity: 1, created_at: new Date().toISOString(), product: product,
    };
    addToCart(cartItem);
  };

  return (<div className="bg-white rounded-lg shadow-md overflow-hidden
    hover:shadow-lg transition"> <div className="h-48 bg-gray-200 flex
      items-center justify-center"> <Package className="w-20 h-20
        text-gray-400" /> </div> <div className="p-4"> <h3
      className="font-semibold text-lg mb-2">{product.name}</h3> <div
        className="flex items-center justify-between mb-2"> <span
          className="text-2xl font-bold text-blue-600">
          ${product.variant.price.toFixed(2)} </span> <span
            className="text-sm text-gray-500"> {product.variant.stock_quantity}
          in stock </span> </div>
      <p className="text-xs text-gray-500 mb-3">
        SKU: {product.variant.sku} | {product.variant.weight_value}{product.variant.weight_unit}
      </p>
      <button
        onClick={handleAddToCart}
        disabled={product.variant.stock_quantity === 0}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {product.variant.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </div>
  </div>
  );
};

export default ProductCard
