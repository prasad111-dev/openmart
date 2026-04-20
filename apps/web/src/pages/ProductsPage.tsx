import { PageLayout } from '@/components/layout/PageLayout'
import { Empty, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty'
import { Package } from 'lucide-react'

export default function ProductsPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground">Products</h1>
        <Empty className="mt-8">
          <EmptyMedia>
            <Package className="size-12 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>No products found</EmptyTitle>
          <EmptyDescription>Browse shops to discover products.</EmptyDescription>
        </Empty>
      </div>
    </PageLayout>
  )
}
