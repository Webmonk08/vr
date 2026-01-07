import { Wheat } from 'lucide-react';

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Wheat className="w-12 h-12 text-green-700" />
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 border-4 border-green-100 border-t-green-700 rounded-full animate-spin"></div>
        </div>

        {/* Loading Text */}
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  );
}
