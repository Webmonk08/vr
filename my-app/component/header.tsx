'use client'
import { Wheat, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';

const Header = () => {
    const { getTotalItems } = useCartStore();
    const totalItems = getTotalItems();

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center gap-2 cursor-pointer">
                        <Wheat className="w-8 h-8 text-green-700" />
                        <span className="font-bold text-xl text-gray-900">RiceHarvest</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-gray-700 hover:text-green-700 transition">Home</Link>
                        <Link href="/about" className="text-gray-700 hover:text-green-700 transition">About</Link>
                        <Link href="/products" className="text-gray-700 hover:text-green-700 transition">Products</Link>
                        <Link href="/contact" className="text-gray-700 hover:text-green-700 transition">Contact</Link>
                    </nav>

                    <Link href="/cart" className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-full transition relative flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        Cart
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                {totalItems}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;