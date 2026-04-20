import { useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface Category {
  label: string
  image: string
  isNew?: boolean
}

const categories: Category[] = [
  { label: 'Cold Drinks & Juices', image: '/category-images/031c2a24-d40f-4272-8c71-8a566252495e.webp' },
  { label: 'Munchies', image: '/category-images/0937caed-95d8-4e6f-a300-b0d0f57ae4b0.webp' },
  { label: 'Biscuits & Cookies', image: '/category-images/0da227bf-f9c1-4688-b26a-8ee28dcdaa8e.webp' },
  { label: 'Apparel', image: '/category-images/1237afd6-40bf-4942-a266-25f23025e86c.webp' },
  { label: 'Jewellery', image: '/category-images/2b267097-f22b-4269-be34-1ea534ced3d4.webp', isNew: true },
  { label: 'Self Care Studio', image: '/category-images/366e5b7d-2028-4935-b9f1-75bfa085c3d7.webp' },
  { label: 'Skincare', image: '/category-images/38047553-95f3-47c6-a1ff-4794e1227d3a.webp' },
  { label: 'Makeup & Beauty', image: '/category-images/3b0ce887-3b38-4450-b7da-9da0ad8b799d.webp' },
  { label: 'Fragrance', image: '/category-images/474e6e58-1894-4378-86f1-168cc7266d1a.webp' },
  { label: 'Bath & Body', image: '/category-images/47e96dc9-e9e5-47d1-b5b3-c967bb8f963f.webp' },
  { label: 'Haircare', image: '/category-images/6d26710a-1dd8-4d53-9884-33bbaebc4bf4.webp' },
  { label: 'Snacks', image: '/category-images/8cc38a79-68a7-46bf-97e8-d0424aff0238.webp' },
  { label: 'Dairy Products', image: '/category-images/8d4d3977-5197-49d9-9867-8a670524e48b.webp' },
  { label: 'Fresh Fruits', image: '/category-images/8d4fb022-bae0-432d-92c8-2b12d97ee6cc.webp' },
  { label: 'Vegetables', image: '/category-images/90b2faee-1461-465a-a8c6-8c84716dd7dc.webp' },
  { label: 'Bakery', image: '/category-images/91b5ee91-38a4-4654-93db-ba948f6265ea.webp' },
  { label: 'Grocery Staples', image: '/category-images/99ab3c6f-c4fe-4b2a-8d9f-89ea8f550022.webp' },
  { label: 'Beverages', image: '/category-images/9b88fff5-73f5-46fd-999f-1622db4203d7.webp' },
  { label: 'Personal Care', image: '/category-images/ab241d87-da5b-4830-b38f-1a6cd30d0d41.webp' },
  { label: 'Household', image: '/category-images/acfa1279-d46b-408c-8f74-6fcd71bd89f9.webp' },
  { label: 'Baby Care', image: '/category-images/ae10877f-fbb9-41c7-be21-e74642532825.webp' },
  { label: 'Pet Supplies', image: '/category-images/b322b3db-e75e-45e5-a11d-7ee37561c426.webp' },
  { label: 'Frozen Foods', image: '/category-images/b5cfc944-9611-4f08-b4f9-a071d07b1aad.webp' },
  { label: 'Meat & Fish', image: '/category-images/c084c75c-82ca-497f-857c-5069c6723194.webp' },
  { label: 'Medicines', image: '/category-images/c42610fc-a94c-40f6-9e74-d30c4a1f5895.webp' },
  { label: 'Electronics', image: '/category-images/d731e4b5-bfd2-47a9-bc46-d2fea365a30f.webp' },
  { label: 'Mobiles', image: '/category-images/db346f5e-644f-426a-85af-92d707e086ac.webp' },
  { label: 'Home & Kitchen', image: '/category-images/dc4a299d-521f-4a64-8205-c5ba8e1d13e3.webp' },
  { label: 'Toys & Games', image: '/category-images/dc521fcb-3d99-4bff-967e-ff95dcdc0742.webp' },
  { label: 'Books & Stationery', image: '/category-images/e6336a1b-eead-42d5-9c4d-23e22e3ebf2d.webp' },
  { label: 'Sports & Fitness', image: '/category-images/ec7b14c6-2640-4165-b3ae-68c09a249ae0.webp' },
  { label: 'Fashion', image: '/category-images/f078a8dc-a9b6-41a6-9c6f-721d4892b8ee.webp' },
  { label: 'Beauty Tools', image: '/category-images/f4371151-d6ed-42d6-9338-8f7391d03fec.webp' },
  { label: 'Organic', image: '/category-images/f848db71-de7c-45a7-af32-cf08d8ebf4e1.webp' },
]

export default function CategoryCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }, [])

  return (
    <div className="relative py-3 sm:py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Left Arrow */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[#000000] items-center justify-center hover:bg-[#111827] hover:scale-105 transition-all duration-200 active:scale-95"
        aria-label="Scroll categories left"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[#000000] items-center justify-center hover:bg-[#111827] hover:scale-105 transition-all duration-200 active:scale-95"
        aria-label="Scroll categories right"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 lg:gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {categories.map((cat) => (
          <motion.div
            key={cat.label}
            className="flex flex-col items-center gap-1.5 sm:gap-2 cursor-pointer min-w-[75px] sm:min-w-[85px] md:min-w-[95px]"
            style={{ scrollSnapAlign: 'start' }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] md:w-[80px] md:h-[80px] rounded-2xl bg-[#F3F4F6] flex items-center justify-center overflow-hidden hover:bg-[#E5E7EB] transition-colors duration-200 active:scale-95">
              <img
                src={cat.image}
                alt={cat.label}
                className="w-[70%] h-[70%] object-contain"
                loading="lazy"
              />
              {cat.isNew && (
                <span className="absolute top-0 right-0 bg-[#6D28D9] text-white text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full">
                  NEW
                </span>
              )}
            </div>
            <span className="text-xs sm:text-sm font-medium text-foreground text-center leading-tight line-clamp-2 md:line-clamp-1">
              {cat.label}
            </span>
          </motion.div>
        ))}
      </div>
      </div>
    </div>
  )
}
