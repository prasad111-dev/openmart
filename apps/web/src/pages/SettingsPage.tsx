import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field-group'
import { Field } from '@/components/ui/field'
import { FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Bell, Moon, Shield } from 'lucide-react'

export default function SettingsPage() {
  return (
    <PageLayout>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Settings</h1>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Get notified about order updates</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">WhatsApp Updates</p>
                    <p className="text-xs text-muted-foreground">Receive updates via WhatsApp</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Use dark theme</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your security settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="current">Current Password</FieldLabel>
                  <Input id="current" type="password" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="new">New Password</FieldLabel>
                  <Input id="new" type="password" />
                </Field>
                <Button className="w-fit">
                  <Shield data-icon="inline-start" />
                  Update Password
                </Button>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
