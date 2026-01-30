
import { Wheat, AlertCircle, Home, ArrowLeft } from 'lucide-react';

interface ErrorPageProps {
  errorType?: '404' | 'general';
  message?: string;
  onNavigate?: (page: string) => void;
}

export function ErrorPage({
  errorType = '404',
  message,
  onNavigate
}: ErrorPageProps) {
  const defaultMessages = {
    '404': "Oops! We couldn't find the page you're looking for.",
    'general': "Something went wrong. Please try again later."
  };

  const displayMessage = message || defaultMessages[errorType];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Wheat className="w-12 h-12 text-green-700" />
          <span className="text-3xl text-gray-900">RiceHarvest</span>
        </div>

        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-green-700" />
          </div>
        </div>

        {/* Error Code */}
        {errorType === '404' && (
          <div className="mb-4">
            <h1 className="text-8xl text-green-700 mb-2">404</h1>
          </div>
        )}

        {/* Error Message */}
        <h2 className="text-3xl text-gray-900 mb-4">
          {errorType === '404' ? 'Page Not Found' : 'Oops! Something Went Wrong'}
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          {displayMessage}
        </p>

        {/* Rice-themed decoration */}
        <div className="flex justify-center gap-2 mb-8">
          <div className="w-3 h-3 rounded-full bg-green-700 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 rounded-full bg-green-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => onNavigate?.('home')}
            className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-full transition flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </button>
          <button
            onClick={() => window.history.back()}
            className="border-2 border-green-700 text-green-700 hover:bg-green-50 px-8 py-3 rounded-full transition flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Additional Help Text */}
        <div className="mt-12 pt-8 border-t border-green-200">
          <p className="text-sm text-gray-600 mb-4">
            Need help? Try one of these:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <button
              onClick={() => onNavigate?.('product')}
              className="text-green-700 hover:text-green-800 transition hover:underline"
            >
              Browse Products
            </button>
            <button
              onClick={() => onNavigate?.('cart')}
              className="text-green-700 hover:text-green-800 transition hover:underline"
            >
              View Cart
            </button>
            <button
              onClick={() => onNavigate?.('profile')}
              className="text-green-700 hover:text-green-800 transition hover:underline"
            >
              My Profile
            </button>
          </div>
        </div>

        {/* Decorative Rice Grains */}
        <div className="mt-8 flex justify-center gap-4 opacity-20">
          <Wheat className="w-8 h-8 text-green-700 rotate-12" />
          <Wheat className="w-8 h-8 text-green-700 -rotate-12" />
          <Wheat className="w-8 h-8 text-green-700 rotate-6" />
        </div>
      </div>
    </div>
  );
}
