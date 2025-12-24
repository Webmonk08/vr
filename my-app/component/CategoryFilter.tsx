import { Tables } from '@/store/useCartStore';

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }: {
  categories: Tables<'categories'>[];
  selectedCategory: number | null;
  onSelectCategory: (id: number | null) => void;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="font-semibold text-lg mb-4">Categories</h2>
      <div className="space-y-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full text-left px-4 py-2 rounded-lg transition ${selectedCategory === null ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
            }`}
        >
          All Products
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`w-full text-left px-4 py-2 rounded-lg transition ${selectedCategory === category.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
              }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

// Main App Component
export default CategoryFilter
