import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field-group'
import { Field } from '@/components/ui/field'
import { FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useSearchParams } from 'react-router-dom'
import { Save } from 'lucide-react'

export default function AddressFormPage() {
  const [searchParams] = useSearchParams()
  const isEdit = searchParams.has('edit')

  return (
    <PageLayout>
      <div className="container mx-auto max-w-xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground">
          {isEdit ? 'Edit Address' : 'Add New Address'}
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>Address Details</CardTitle>
            <CardDescription>Fill in the address information below.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="label">Label</FieldLabel>
                <Input id="label" placeholder="Home, Work, etc." />
              </Field>
              <Field>
                <FieldLabel htmlFor="street">Street Address</FieldLabel>
                <Input id="street" placeholder="123 Main Road" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="city">City</FieldLabel>
                  <Input id="city" placeholder="Sindhi Railway" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="state">State</FieldLabel>
                  <Input id="state" placeholder="Maharashtra" />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="pincode">Pincode</FieldLabel>
                <Input id="pincode" placeholder="442105" />
              </Field>
              <Field>
                <FieldLabel htmlFor="landmark">Landmark (optional)</FieldLabel>
                <Textarea id="landmark" placeholder="Near the temple" />
              </Field>
              <div className="flex items-center gap-3">
                <Switch id="default" />
                <FieldLabel htmlFor="default">Set as default address</FieldLabel>
              </div>
              <Button className="w-fit">
                <Save data-icon="inline-start" />
                {isEdit ? 'Update Address' : 'Save Address'}
              </Button>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
