import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const categoryTabVariants = cva(
  "inline-flex items-center gap-2 shrink-0 whitespace-nowrap rounded-t-lg px-4 py-2.5 text-base font-medium transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      state: {
        active:
          "text-primary border-b-2 border-primary bg-transparent",
        inactive:
          "text-muted-foreground border-b-2 border-transparent hover:text-foreground hover:bg-muted/50",
      },
    },
    defaultVariants: {
      state: "inactive",
    },
  }
)

export interface CategoryTabItem {
  id: string
  name: string
  icon?: React.ReactNode
  active?: boolean
}

export interface CategoryTabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  categories: CategoryTabItem[]
  selectedTab: string
  onTabSelect: (tabId: string) => void
}

const CategoryTabs = React.forwardRef<HTMLDivElement, CategoryTabsProps>(
  ({ className, categories, selectedTab, onTabSelect, ...props }, ref) => {
    const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([])

    const handleKeyDown = (
      event: React.KeyboardEvent<HTMLButtonElement>,
      currentIndex: number
    ) => {
      const total = categories.length
      let newIndex: number

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault()
          newIndex = (currentIndex - 1 + total) % total
          break
        case "ArrowRight":
          event.preventDefault()
          newIndex = (currentIndex + 1) % total
          break
        case "Home":
          event.preventDefault()
          newIndex = 0
          break
        case "End":
          event.preventDefault()
          newIndex = total - 1
          break
        case "Enter":
        case " ":
          event.preventDefault()
          onTabSelect(categories[currentIndex].id)
          return
        default:
          return
      }

      tabRefs.current[newIndex]?.focus()
    }

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation="horizontal"
        className={cn(
          "flex w-full overflow-x-auto scrollbar-hide border-b border-border",
          className
        )}
        {...props}
      >
        {categories.map((category, index) => (
          <button
            key={category.id}
            ref={(el) => {
              tabRefs.current[index] = el
            }}
            role="tab"
            type="button"
            aria-selected={selectedTab === category.id}
            aria-controls={`tabpanel-${category.id}`}
            tabIndex={selectedTab === category.id ? 0 : -1}
            data-state={selectedTab === category.id ? "active" : "inactive"}
            className={cn(
              categoryTabVariants({
                state: selectedTab === category.id ? "active" : "inactive",
              })
            )}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onClick={() => onTabSelect(category.id)}
          >
            {category.icon && (
              <span className="size-5 shrink-0">{category.icon}</span>
            )}
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    )
  }
)
CategoryTabs.displayName = "CategoryTabs"

export { CategoryTabs, categoryTabVariants }
