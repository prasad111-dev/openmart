import { PageLayout } from '@/components/layout/PageLayout'
import { Empty, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty'
import { Store } from 'lucide-react'

export default function CategoryPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Category</h1>
        <Empty>
          <EmptyMedia>
            <Store className="size-12 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>No products in this category</EmptyTitle>
          <EmptyDescription>Check back later for new products.</EmptyDescription>
        </Empty>
      </div>
    </PageLayout>
  )
}
