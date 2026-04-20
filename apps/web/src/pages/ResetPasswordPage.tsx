import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field-group'
import { Field } from '@/components/ui/field'
import { FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Link, useSearchParams } from 'react-router-dom'
import { Lock } from 'lucide-react'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  if (!token) {
    return (
      <PageLayout>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Invalid Reset Link</CardTitle>
              <CardDescription>This password reset link is invalid or has expired.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/forgot-password">
                <Button className="w-full">Request New Link</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <Input id="password" type="password" placeholder="••••••••" />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm">Confirm Password</FieldLabel>
                <Input id="confirm" type="password" placeholder="••••••••" />
              </Field>
              <Button className="w-full">
                <Lock data-icon="inline-start" />
                Reset Password
              </Button>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
