'use client'
import { useState, useEffect } from 'react';
import { Wheat, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { CartService } from '@/services/cart.service';

const Header = () => {
  const { user, role } = useAuthStore()
  const { getTotalItems } = useCartStore();
  const guestItemCount = getTotalItems();

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const { data: userCart } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: () => CartService.getCart(user?.id),
    enabled: isHydrated && !!user,
  });

  const totalItems = user ? (userCart?.reduce((acc: number, item: any) => acc + 1, 0) || 0) : guestItemCount;

  const currPath = usePathname()

  const isNotCustomer = user && role && role.toLowerCase() !== 'customer'

  if (isNotCustomer) {
    return null
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Wheat className="w-8 h-8 text-green-700" />
            <span className="font-medium text-xl font-georama text-gray-900">Veerapathra Traders</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-700 hover:text-green-700 transition">Home</Link>
            {isHydrated && (role === 'OWNER' || role === "ADMIN") ? <Link href="/addproducts" className="text-gray-700 hover:text-green-700 transition">Add Products</Link>
              : <></>
            }
            <Link href="/products" className="text-gray-700 hover:text-green-700 transition">Products</Link>
            <Link href="/contact" className="text-gray-700 hover:text-green-700 transition">Contact</Link>
          </nav>
          <div className='flex items-center justify-center gap-2'>

  {/* Cart button */}
  <Link
    href="/cart"
    className="bg-green-700 hover:bg-green-800 text-white 
               px-3 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-base
               rounded-full transition relative flex items-center gap-1.5"
  >
    <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
    <span className="hidden sm:inline">Cart</span>
    <span className="inline sm:hidden text-xs">Cart</span>
    {isHydrated && totalItems > 0 && (
      <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px]">
        {totalItems}
      </span>
    )}
  </Link>

  {/* Auth button */}
  {isHydrated ? (
    (!user && currPath !== '/login' && currPath !== '/signup') ? (
      <Link
        href="/login"
        className="bg-green-700 hover:bg-green-800 text-white 
                   px-3 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-base
                   rounded-full transition flex items-center gap-1.5 whitespace-nowrap"
      >
        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Log In</span>
      </Link>
    ) : (
      user && currPath !== '/profile' && (
        <Link
          href='/profile'
          className="w-7 h-7 sm:w-10 sm:h-10 bg-green-100 hover:bg-green-200 
                     rounded-full flex items-center justify-center transition"
          title="My Profile"
        >
          <User className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-green-700" />
        </Link>
      )
    )
  ) : (
    <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gray-100 rounded-full animate-pulse" />
  )}

</div>
        </div>
      </div>
    </header >
  );
};

export default Header;
