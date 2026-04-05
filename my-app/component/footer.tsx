'use client'
import { Wheat } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { useCategoryStore } from "@/store/useCategoryStore"

const Footer = () => {
  const { categories, fetchCategories } = useCategoryStore()

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Use the top 3 categories or default to placeholders if none found yet
  const displayCategories = categories.length > 0 ? categories.slice(0, 3) : ['Ponni Rice', 'Basmati Rice', 'Samba Rice'];

  return (
    <footer className="bg-green-900 mt-16 py-12 text-green-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="gap-8 grid grid-cols-1 md:grid-cols-4 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Wheat className="w-6 h-6 text-green-400" />
              <h3 className="font-medium text-white font-georama text-xl">Veerapathra Traders</h3>
            </div>
            <p className="text-sm">Premium rice varieties delivered to your doorstep with care and quality.</p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white transition">All Products</Link></li>
              {displayCategories.map((category) => (
                <li key={category}>
                  <Link href={`/products?category=${encodeURIComponent(category)}`} className="hover:text-white transition">
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Newsletter</h4>
            <p className="mb-4 text-sm">Subscribe for special offers and updates</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-l-lg focus:outline-none text-gray-900"
              />
              <button className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-r-lg text-white transition">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="pt-8 border-green-800 border-t text-sm text-center">
          <p>&copy; 2024 Veerapathra Traders. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
