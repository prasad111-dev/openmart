import * as React from "react"
import { CategoryTabs, type CategoryTabItem } from "@/components/ui/category-tabs"
import { CategoryCarousel, type CategoryCarouselItem } from "@/components/ui/category-carousel"

const groceryCategories: CategoryCarouselItem[] = [
  {
    id: "fruits",
    name: "Fresh Fruits",
    iconUrl: "/icons/categories/fruits.svg",
    iconAlt: "Fresh fruits icon",
    color: "#22c55e",
  },
  {
    id: "vegetables",
    name: "Vegetables",
    iconUrl: "/icons/categories/vegetables.svg",
    iconAlt: "Vegetables icon",
    color: "#16a34a",
  },
  {
    id: "dairy",
    name: "Dairy & Eggs",
    iconUrl: "/icons/categories/dairy.svg",
    iconAlt: "Dairy and eggs icon",
    color: "#3b82f6",
  },
  {
    id: "bakery",
    name: "Bakery",
    iconUrl: "/icons/categories/bakery.svg",
    iconAlt: "Bakery icon",
    color: "#f59e0b",
  },
  {
    id: "meat",
    name: "Meat & Fish",
    iconUrl: "/icons/categories/meat.svg",
    iconAlt: "Meat and fish icon",
    color: "#ef4444",
  },
  {
    id: "beverages",
    name: "Beverages",
    iconUrl: "/icons/categories/beverages.svg",
    iconAlt: "Beverages icon",
    color: "#06b6d4",
  },
  {
    id: "snacks",
    name: "Snacks",
    iconUrl: "/icons/categories/snacks.svg",
    iconAlt: "Snacks icon",
    color: "#f97316",
  },
  {
    id: "frozen",
    name: "Frozen Foods",
    iconUrl: "/icons/categories/frozen.svg",
    iconAlt: "Frozen foods icon",
    color: "#8b5cf6",
  },
  {
    id: "pantry",
    name: "Pantry",
    iconUrl: "/icons/categories/pantry.svg",
    iconAlt: "Pantry icon",
    color: "#a16207",
  },
  {
    id: "household",
    name: "Household",
    iconUrl: "/icons/categories/household.svg",
    iconAlt: "Household icon",
    color: "#64748b",
  },
]

const tabCategories: CategoryTabItem[] = groceryCategories.map((cat) => ({
  id: cat.id,
  name: cat.name,
}))

export function CategorySection() {
  const [selectedTab, setSelectedTab] = React.useState("fruits")

  const handleCarouselClick = React.useCallback(
    (category: CategoryCarouselItem) => {
      console.log("Category clicked:", category.name)
      setSelectedTab(category.id)
    },
    []
  )

  return (
    <section className="w-full space-y-6 py-6">
      <div className="container mx-auto px-4">
        <h2 className="mb-4 text-2xl font-bold text-foreground">
          Shop by Category
        </h2>

        <CategoryTabs
          categories={tabCategories}
          selectedTab={selectedTab}
          onTabSelect={setSelectedTab}
          className="mb-6"
        />

        <CategoryCarousel
          categories={groceryCategories}
          onCategoryClick={handleCarouselClick}
        />
      </div>
    </section>
  )
}
