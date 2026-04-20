import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <PageLayout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
              <Lock className="size-8 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page. Please contact an administrator if you believe this is an error.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline">Go to Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
