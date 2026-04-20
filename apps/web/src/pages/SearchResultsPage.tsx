import { PageLayout } from '@/components/layout/PageLayout'
import { Empty, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty'
import { Search } from 'lucide-react'

export default function SearchResultsPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground">Search Results</h1>
        <Empty className="mt-8">
          <EmptyMedia>
            <Search className="size-12 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>Search for products and shops</EmptyTitle>
          <EmptyDescription>Enter a search term to find what you're looking for.</EmptyDescription>
        </Empty>
      </div>
    </PageLayout>
  )
}
