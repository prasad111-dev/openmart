import { Grid, Coffee, Home, Puzzle, Leaf, Headphones, Smartphone, Sparkles, Shirt } from 'lucide-react'

interface CategoryItem {
  label: string
  icon: any
}

const categories: CategoryItem[] = [
  { label: 'All', icon: Grid },
  { label: 'Cafe', icon: Coffee },
  { label: 'Home', icon: Home },
  { label: 'Toys', icon: Puzzle },
  { label: 'Fresh', icon: Leaf },
  { label: 'Electronics', icon: Headphones },
  { label: 'Mobiles', icon: Smartphone },
  { label: 'Beauty', icon: Sparkles },
  { label: 'Fashion', icon: Shirt },
]

interface CategoryBarProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export default function CategoryBar({ activeCategory, onCategoryChange }: CategoryBarProps) {
  return (
    <div className="sticky top-16 z-40 h-14 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 h-full overflow-x-auto scrollbar-hide">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.label
            return (
              <button
                key={cat.label}
                onClick={() => onCategoryChange(cat.label)}
                className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-full transition-all duration-200 ease-in-out active:scale-95 whitespace-nowrap ${
                  isActive
                    ? 'text-[#64c1a4] bg-[#64c1a4]/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
                aria-label={`Filter by ${cat.label}`}
                role="tab"
                aria-selected={isActive}
              >
                <cat.icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isActive ? 'text-[#64c1a4]' : ''}`} />
                <span className="text-sm sm:text-base font-medium">{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
