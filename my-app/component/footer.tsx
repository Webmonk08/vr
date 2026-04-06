'use client'
import { Wheat, Phone, Mail, MapPin } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { useCategoryStore } from "@/store/useCategoryStore"

const Footer = () => {
  const { categories, fetchCategories } = useCategoryStore()

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const displayCategories = categories.length > 0 ? categories.slice(0, 3) : ['Ponni Rice', 'Basmati Rice', 'Samba Rice'];

  return (
    <footer className="bg-green-900 mt-16 py-12 text-green-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1.5fr] gap-12 mb-12">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center space-x-2 mb-6">
              <Wheat className="w-8 h-8 text-green-400" />
              <h3 className="font-bold text-white font-georama text-2xl tracking-tight">
                Veerapathra Traders
              </h3>
            </div>
            <p className="text-sm leading-relaxed">
              Premium rice varieties delivered to your doorstep with care and quality. Sourced directly from local farmers to ensure the best taste and nutrition.
            </p>
          </div>

          {/* Shop Section */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="mb-6 font-bold text-white uppercase tracking-wider text-sm">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/products" className="hover:text-white transition-colors duration-200">All Products</Link></li>
              {displayCategories.map((category) => (
                <li key={category}>
                  <Link href={`/products?category=${encodeURIComponent(category)}`} className="hover:text-white transition-colors duration-200">
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="mb-6 font-bold text-white uppercase tracking-wider text-sm">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 justify-center md:justify-start">
                <Phone className="w-5 h-5 text-green-400 shrink-0" />
                <span>+91 7010300660</span>
              </li>
              <li className="flex items-start gap-3 justify-center md:justify-start">
                <Mail className="w-5 h-5 text-green-400 shrink-0" />
                <span className="break-all">veerapathratraders@gmail.com</span>
              </li>
              <li className="flex items-start gap-3 justify-center md:justify-start">
                <MapPin className="w-5 h-5 text-green-400 shrink-0" />
                <span>Konduraja Line, Theni, Tamil Nadu 625531</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-green-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} Veerapathra Traders. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer