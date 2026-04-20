import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const success = !!token

  return (
    <PageLayout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            {success ? (
              <>
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle2 className="size-8 text-success" />
                </div>
                <CardTitle className="text-center">Email Verified</CardTitle>
                <CardDescription className="text-center">Your email has been verified successfully.</CardDescription>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
                  <XCircle className="size-8 text-destructive" />
                </div>
                <CardTitle className="text-center">Verification Failed</CardTitle>
                <CardDescription className="text-center">This verification link is invalid or has expired.</CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link to="/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
