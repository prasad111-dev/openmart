import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Empty, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty'
import { MapPin, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AddressesPage() {
  const addresses: any[] = []

  if (addresses.length === 0) {
    return (
      <PageLayout>
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">My Addresses</h1>
            <Link to="/addresses/new">
              <Button>
                <Plus data-icon="inline-start" />
                Add Address
              </Button>
            </Link>
          </div>
          <Empty>
            <EmptyMedia>
              <MapPin className="size-12 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No addresses saved</EmptyTitle>
            <EmptyDescription>Add an address for faster checkout.</EmptyDescription>
          </Empty>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">My Addresses</h1>
          <Link to="/addresses/new">
            <Button>
              <Plus data-icon="inline-start" />
              Add Address
            </Button>
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{addr.label}</CardTitle>
                {addr.isDefault && <Badge variant="secondary">Default</Badge>}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{addr.street}</p>
                <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.pincode}</p>
                <Separator className="my-3" />
                <div className="flex gap-2">
                  <Link to={`/addresses/${addr.id}/edit`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
