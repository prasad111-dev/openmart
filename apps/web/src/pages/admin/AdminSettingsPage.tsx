import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field-group'
import { Field } from '@/components/ui/field'
import { FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Settings } from 'lucide-react'
import { adminApi } from '@/lib/api'

export default function AdminSettingsPage() {
  const [platformFee, setPlatformFee] = useState('')
  const [deliveryCharge, setDeliveryCharge] = useState('')
  const [freeThreshold, setFreeThreshold] = useState('')
  const [commission, setCommission] = useState('')
  const [maintenance, setMaintenance] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    adminApi.getPlatformSettings()
      .then((res) => {
        const data = res.data.data || res.data
        setPlatformFee(data.platformFee ?? '')
        setDeliveryCharge(data.deliveryCharge ?? '')
        setFreeThreshold(data.freeDeliveryThreshold ?? '')
        setCommission(data.commissionRate ?? data.minimumOrderAmount ?? '')
        setMaintenance(data.maintenanceMode ?? false)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load settings')
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    setError(null)
    try {
      await adminApi.updatePlatformSettings({
        platformFee: Number(platformFee) || 0,
        deliveryCharge: Number(deliveryCharge) || 0,
        freeDeliveryThreshold: Number(freeThreshold) || 0,
        minimumOrderAmount: Number(commission) || 0,
      })
      setSuccess(true)
    } catch {
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <DashboardLayout role="admin"><p>Loading...</p></DashboardLayout>

  return (
    <DashboardLayout role="admin">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-foreground">Platform Settings</h1>
        {error && <p className="text-destructive">{error}</p>}
        {success && <p className="text-green-600">Settings saved successfully!</p>}
        <Card>
          <CardHeader>
            <CardTitle>Platform Configuration</CardTitle>
            <CardDescription>Manage platform-wide settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="platformFee">Platform Fee</FieldLabel>
                <Input id="platformFee" type="number" placeholder="20" value={platformFee} onChange={(e) => setPlatformFee(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="deliveryCharge">Delivery Charge</FieldLabel>
                <Input id="deliveryCharge" type="number" placeholder="20" value={deliveryCharge} onChange={(e) => setDeliveryCharge(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="freeThreshold">Free Delivery Threshold</FieldLabel>
                <Input id="freeThreshold" type="number" placeholder="150" value={freeThreshold} onChange={(e) => setFreeThreshold(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="commission">Default Commission Rate (%)</FieldLabel>
                <Input id="commission" type="number" placeholder="10" value={commission} onChange={(e) => setCommission(e.target.value)} />
              </Field>
              <div className="flex items-center gap-3">
                <Switch id="maintenance" checked={maintenance} onCheckedChange={setMaintenance} />
                <FieldLabel htmlFor="maintenance">Maintenance Mode</FieldLabel>
              </div>
              <Button className="w-fit" onClick={handleSave} disabled={saving}>
                <Settings data-icon="inline-start" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
