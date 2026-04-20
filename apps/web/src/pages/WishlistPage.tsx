import { PageLayout } from '@/components/layout/PageLayout'
import { Empty, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty'
import { Heart } from 'lucide-react'

export default function WishlistPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground">My Wishlist</h1>
        <Empty>
          <EmptyMedia>
            <Heart className="size-12 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>Your wishlist is empty</EmptyTitle>
          <EmptyDescription>Save products you love to your wishlist.</EmptyDescription>
        </Empty>
      </div>
    </PageLayout>
  )
}
