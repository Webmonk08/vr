import { useState } from 'react';
import { Star, ShoppingCart, Minus, Plus, Truck, ShieldCheck, Award, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/services/products.service';

import { Product, ProductVariant } from '@/types/product';

const ImageWithFallback = ({ src, alt, className }: any) => {
  return (
    <img src={src} alt={alt} className={className} onError={(e: any) => {
      e.target.src = 'https://images.unsplash.com/photo-1686820740687-426a7b9b2043?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwZ3JhaW5zfGVufDF8fHx8MTc2NjYxODMwNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';
    }} />
  );
};

interface ProductPageProps {
  product: Product;
  selectedVariant: ProductVariant;
  onNavigate: (page: string) => void;
  onAddToCart: (item: any) => void;
}

export function ProductPage({ product: productItem, selectedVariant, onNavigate, onAddToCart }: ProductPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: relatedVariants, isLoading: isLoadingRelated } = useQuery({
    queryKey: ['related-products', selectedVariant.id],
    queryFn: () => ProductService.getRelated(selectedVariant.id),
  });

  const product = {
    id: productItem.id,
    name: productItem.name,
    price: selectedVariant.price,
    originalPrice: selectedVariant.originalPrice,
    rating: 4.8,
    reviews: 124,
    description: selectedVariant.shortDescription,
    longDescription: selectedVariant.description,
    images: selectedVariant.image && selectedVariant.image.length > 0 ? selectedVariant.image : ['https://images.unsplash.com/photo-1686820740687-426a7b9b2043?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwZ3JhaW5zfGVufDF8fHx8MTc2NjYxODMwNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
    category: selectedVariant.category || "General",
    weight: selectedVariant.weight,
    features: selectedVariant.features && selectedVariant.features.length > 0 ? selectedVariant.features : ["Premium Quality", "100% Authentic"],
    inStock: selectedVariant.stock > 0
  };

  const handleAddToCart = () => {
    onAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images[0]
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div className="rounded-2xl overflow-hidden bg-white shadow-lg mb-4">
              <ImageWithFallback 
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-[500px] object-cover"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-xl overflow-hidden ${
                    selectedImage === index ? 'ring-4 ring-green-700' : ''
                  }`}
                >
                  <ImageWithFallback 
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm mb-4">
              {product.category}
            </div>
            
            <h1 className="text-4xl mb-4 text-gray-900">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl text-gray-900">${product.price}</span>
              {product.originalPrice && product.originalPrice !== product.price && (
                <span className="text-xl text-gray-400 line-through">${product.originalPrice}</span>
              )}
              {product.originalPrice && product.originalPrice !== product.price && (
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm">
                  Save ${(product.originalPrice - product.price).toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {product.longDescription}
            </p>

            {/* Product Specifications */}
            <div className="bg-green-50 rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Weight</p>
                  <p className="text-gray-900">{product.weight}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stock Status</p>
                  <p className="text-green-700 font-medium">
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm mb-2 text-gray-700">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-l-full transition"
                  >
                    <Minus className="w-4 h-4 text-gray-700" />
                  </button>
                  <span className="w-16 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-r-full transition"
                  >
                    <Plus className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
                <span className="text-gray-600">
                  Total: <span className="text-gray-900">${(product.price * quantity).toFixed(2)}</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-green-700 hover:bg-green-800 text-white py-4 rounded-full transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button className="border-2 border-green-700 text-green-700 hover:bg-green-50 px-8 py-4 rounded-full transition">
                Buy Now
              </button>
            </div>

            {/* Features */}
            <div className="border-t pt-6">
              <h3 className="mb-4 text-gray-900">Product Features</h3>
              <div className="grid grid-cols-2 gap-3">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-700 rounded-full"></div>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t">
              <div className="text-center">
                <Truck className="w-8 h-8 text-green-700 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Free Shipping</p>
              </div>
              <div className="text-center">
                <ShieldCheck className="w-8 h-8 text-green-700 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Quality Guarantee</p>
              </div>
              <div className="text-center">
                <Award className="w-8 h-8 text-green-700 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Award Winning</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl text-gray-900">You May Also Like</h2>
            <button 
              onClick={() => onNavigate('products')}
              className="text-green-700 hover:text-green-800 font-medium flex items-center gap-2"
            >
              Show More
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {isLoadingRelated ? (
            <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-green-700" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {relatedVariants?.map((variant, idx) => (
                <div 
                  key={`${variant.id}-${idx}`} 
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition group cursor-pointer"
                  onClick={() => onNavigate('products')} 
                >
                  <div className="overflow-hidden">
                    <ImageWithFallback 
                      src={Array.isArray(variant.image) ? variant.image[0] : variant.image}
                      alt={variant.shortDescription}
                      className="w-full h-64 object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="mb-2 text-gray-900">{variant.category} - {variant.weight}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">4.5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl text-gray-900">${variant.price}</span>
                      <button className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-full transition">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
