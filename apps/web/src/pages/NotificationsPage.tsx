import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty'
import { Bell, CheckCheck } from 'lucide-react'

export default function NotificationsPage() {
  const notifications: any[] = []

  if (notifications.length === 0) {
    return (
      <PageLayout>
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <Button variant="outline" size="sm">
              <CheckCheck data-icon="inline-start" />
              Mark all read
            </Button>
          </div>
          <Empty>
            <EmptyMedia>
              <Bell className="size-12 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No notifications</EmptyTitle>
            <EmptyDescription>You're all caught up!</EmptyDescription>
          </Empty>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <Button variant="outline" size="sm">
            <CheckCheck data-icon="inline-start" />
            Mark all read
          </Button>
        </div>
        <Card>
          <CardContent className="divide-y">
            {notifications.map((n: any) => (
              <div key={n.id} className="flex items-start gap-3 py-4">
                <Bell className="mt-0.5 size-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{n.content}</p>
                  <p className="text-xs text-muted-foreground">{n.createdAt}</p>
                </div>
                {!n.isRead && <Badge variant="secondary">New</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
