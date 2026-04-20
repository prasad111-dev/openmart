import * as React from "react"

import { cn } from "@/lib/utils"

export interface CategoryCardData {
  name: string
  iconUrl: string
  iconAlt: string
  color?: string
}

export interface CategoryCardProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "data" | "onClick"> {
  category: CategoryCardData
  onClick: (category: CategoryCardData) => void
}

const CategoryCard = React.forwardRef<HTMLButtonElement, CategoryCardProps>(
  ({ className, category, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex w-[120px] flex-col items-center gap-2 rounded-lg p-3 shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        onClick={() => onClick(category)}
        {...props}
      >
        <div
          className="flex size-16 items-center justify-center rounded-full"
          style={
            category.color
              ? { backgroundColor: `${category.color}20` }
              : undefined
          }
        >
          <img
            src={category.iconUrl}
            alt={category.iconAlt}
            className="size-10 object-contain"
            loading="lazy"
          />
        </div>
        <span className="text-center text-sm font-medium text-foreground">
          {category.name}
        </span>
      </button>
    )
  }
)
CategoryCard.displayName = "CategoryCard"

export { CategoryCard }
