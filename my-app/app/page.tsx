'use client'
import { Wheat, ShieldCheck, Truck, Clock, Award, Star, MapPin, Users, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function App() {
  const [activeSlide, setActiveSlide] = useState(0);



  // Home Page
  const features = [
    {
      icon: <Wheat className="w-12 h-12 text-green-700" />,
      title: "Premium Quality Rice",
      description: "Sourced from the finest rice paddies, our premium grains ensure exceptional taste and nutrition."
    },
    {
      icon: <ShieldCheck className="w-12 h-12 text-green-700" />,
      title: "Certified Organic",
      description: "100% organic certification guarantees pesticide-free, naturally grown rice for your health."
    },
    {
      icon: <Truck className="w-12 h-12 text-green-700" />,
      title: "Fast Delivery",
      description: "Same-day delivery available for all orders placed before noon in your local area."
    },
    {
      icon: <Clock className="w-12 h-12 text-green-700" />,
      title: "Always Fresh",
      description: "Fresh stocks delivered weekly, ensuring you always get the newest harvest available."
    },
    {
      icon: <Award className="w-12 h-12 text-green-700" />,
      title: "Award Winning",
      description: "Winner of multiple culinary awards for exceptional quality and authentic taste."
    },
    {
      icon: <Star className="w-12 h-12 text-green-700" />,
      title: "Highly Rated",
      description: "4.9-star rating from over 10,000 satisfied customers across the country."
    },
    {
      icon: <MapPin className="w-12 h-12 text-green-700" />,
      title: "Local Sourcing",
      description: "Supporting local farmers and sustainable agriculture practices in our community."
    },
    {
      icon: <Users className="w-12 h-12 text-green-700" />,
      title: "Family Owned",
      description: "Three generations of rice expertise, serving families with passion and dedication."
    }
  ];

  const products = [
    {
      image: "https://images.unsplash.com/photo-1625467149925-bdca3a30dc17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwYm93bCUyMGFzaWFufGVufDF8fHx8MTc2NjY1Njk4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      title: "Asian Jasmine Rice",
      description: "Fragrant long-grain jasmine rice with naturally sweet aroma and fluffy texture perfect for any meal."
    },
    {
      image: "https://images.unsplash.com/photo-1630914441934-a29bf360934c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllZCUyMHJpY2UlMjBkaXNofGVufDF8fHx8MTc2NjY1Njk4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      title: "Premium Basmati",
      description: "Authentic aged basmati rice with distinct aroma, perfect for biryani and pilaf dishes."
    },
    {
      image: "https://images.unsplash.com/photo-1633945274417-ab205ae69d10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ5YW5pJTIwcmljZXxlbnwxfHx8fDE3NjY1OTc5NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      title: "Brown Rice Blend",
      description: "Nutrient-rich whole grain brown rice, high in fiber and essential vitamins for healthy living."
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      {/* Hero Section */}
      <section className="bg-linear-to-br from-green-50 to-white py-16 md:py-24">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="items-center gap-12 grid md:grid-cols-2">
            <div>
              <p className="mb-4 text-green-700">Premium Rice Supplier</p>
              <h1 className="mb-6 text-gray-900 text-5xl md:text-6xl">
                Best Quality<br />
                <span className="text-green-700">Rice Selection</span>
              </h1>
              <p className="mb-8 text-gray-600 leading-relaxed">
                Discover the finest selection of premium rice varieties sourced directly from sustainable farms.
                From fragrant jasmine to authentic basmati, we bring nature's best grains to your table with
                guaranteed freshness and quality.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="bg-green-700 hover:bg-green-800 px-8 py-3 rounded-full text-white transition"
                >
                  Shop Now
                </Link>
                <button className="hover:bg-green-50 px-8 py-3 border-2 border-green-700 rounded-full text-green-700 transition">
                  Learn More
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="shadow-2xl rounded-3xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1686820740687-426a7b9b2043?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwZ3JhaW5zfGVufDF8fHx8MTc2NjYxODMwNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Premium rice grains"
                  className="w-full h-[500px] object-cover"
                />
              </div>

              {/* Carousel dots */}
              <div className="flex justify-center gap-2 mt-6">
                {[0, 1, 2, 3].map((index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`w-3 h-3 rounded-full transition ${activeSlide === index ? 'bg-green-700' : 'bg-gray-300'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-green-50 hover:bg-green-100 hover:shadow-lg p-8 rounded-2xl text-center transition"
              >
                <div className="flex justify-center mb-4 group-hover:scale-110 transition">
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-gray-900 text-4xl">Our Rice Selection</h2>
            <div className="flex justify-center gap-2">
              <div className="bg-green-700 rounded-full w-2 h-2"></div>
              <div className="bg-gray-300 rounded-full w-2 h-2"></div>
              <div className="bg-gray-300 rounded-full w-2 h-2"></div>
            </div>
          </div>

          <div className="gap-6 grid md:grid-cols-3">
            {products.map((product, index) => (
              <div key={index} className="group bg-white shadow-lg hover:shadow-xl rounded-2xl overflow-hidden transition">
                <div className="overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-gray-900">{product.title}</h3>
                  <p className="mb-4 text-gray-600 text-sm">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <Link
                      href="/products"
                      className="flex items-center gap-2 text-green-700 hover:text-green-800 transition"
                    >
                      Discover
                      <span className="text-xl">→</span>
                    </Link>
                    <Link
                      href="/products"
                      className="flex justify-center items-center bg-green-700 hover:bg-green-800 rounded-full w-10 h-10 transition"
                    >
                      <span className="text-white text-xl">+</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="bg-white py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="items-center gap-12 grid md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-gray-900 text-4xl">
                Sustainable farming<br />
                for premium quality
              </h2>
              <p className="mb-4 text-gray-600 leading-relaxed">
                Our rice is cultivated using traditional methods combined with modern sustainable
                farming practices. We work directly with local farmers who share our commitment to
                quality and environmental stewardship.
              </p>
              <p className="mb-6 text-gray-600 leading-relaxed">
                Every grain is carefully selected and processed to maintain its natural nutrients,
                flavor, and aroma. From our fields to your table, we ensure the highest standards
                at every step of the journey.
              </p>
              <button className="bg-green-700 hover:bg-green-800 px-8 py-3 rounded-full text-white transition">
                Learn More About Us
              </button>
            </div>

            <div className="shadow-2xl rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1701461497603-92d693136b00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwZmllbGQlMjBmYXJtfGVufDF8fHx8MTc2NjY1Njk4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Rice field farm"
                className="w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
