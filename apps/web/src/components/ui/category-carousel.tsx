import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CategoryCarouselItem {
  id: string
  name: string
  iconUrl: string
  iconAlt: string
  color?: string
}

export interface CategoryCarouselProps
  extends React.HTMLAttributes<HTMLDivElement> {
  categories: CategoryCarouselItem[]
  onCategoryClick: (category: CategoryCarouselItem) => void
}

const CategoryCarousel = React.forwardRef<
  HTMLDivElement,
  CategoryCarouselProps
>(({ className, categories, onCategoryClick, ...props }, ref) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)
  const imageRefs = React.useRef<(HTMLImageElement | null)[]>([])

  const checkScrollButtons = React.useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
  }, [])

  React.useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    checkScrollButtons()
    container.addEventListener("scroll", checkScrollButtons, { passive: true })

    const resizeObserver = new ResizeObserver(checkScrollButtons)
    resizeObserver.observe(container)

    return () => {
      container.removeEventListener("scroll", checkScrollButtons)
      resizeObserver.disconnect()
    }
  }, [checkScrollButtons, categories])

  const scroll = React.useCallback((direction: "left" | "right") => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = container.clientWidth * 0.75
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }, [])

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const img = entry.target as HTMLImageElement
          if (entry.isIntersecting && img.dataset.src) {
            img.src = img.dataset.src
            img.removeAttribute("data-src")
            observer.unobserve(img)
          }
        })
      },
      { root: scrollContainerRef.current, rootMargin: "50px" }
    )

    imageRefs.current.forEach((img) => {
      if (img && img.dataset.src) {
        observer.observe(img)
      }
    })

    return () => observer.disconnect()
  }, [categories])

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Category carousel"
      className={cn("relative w-full", className)}
      {...props}
    >
      <button
        type="button"
        aria-label="Scroll left"
        aria-disabled={!canScrollLeft}
        disabled={!canScrollLeft}
        onClick={() => scroll("left")}
        className={cn(
          "absolute left-0 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow-md backdrop-blur-sm transition-all hover:bg-background/95 disabled:pointer-events-none disabled:opacity-0"
        )}
      >
        <ChevronLeft className="size-5" />
      </button>

      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto scroll-smooth px-14 py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {categories.map((category, index) => (
          <button
            key={category.id}
            type="button"
            className="flex shrink-0 snap-start cursor-pointer flex-col items-center gap-2 rounded-lg p-3 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            style={{ scrollSnapAlign: "start" }}
            onClick={() => onCategoryClick(category)}
          >
            <div
              className={cn(
                "flex size-16 items-center justify-center rounded-full",
                category.color
                  ? "bg-opacity-20"
                  : "bg-primary/10"
              )}
              style={
                category.color
                  ? { backgroundColor: `${category.color}20` }
                  : undefined
              }
            >
              <img
                ref={(el) => {
                  imageRefs.current[index] = el
                }}
                data-src={category.iconUrl}
                alt={category.iconAlt}
                className="size-10 object-contain"
                loading="lazy"
              />
            </div>
            <span className="text-center text-sm font-medium text-foreground">
              {category.name}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        aria-label="Scroll right"
        aria-disabled={!canScrollRight}
        disabled={!canScrollRight}
        onClick={() => scroll("right")}
        className={cn(
          "absolute right-0 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow-md backdrop-blur-sm transition-all hover:bg-background/95 disabled:pointer-events-none disabled:opacity-0"
        )}
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  )
})
CategoryCarousel.displayName = "CategoryCarousel"

export { CategoryCarousel }
