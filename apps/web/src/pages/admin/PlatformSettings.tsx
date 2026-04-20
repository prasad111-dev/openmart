import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Truck, Save, Crown, Sparkles, Gem } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { adminApi } from '@/lib/api'
import { useAuthStore } from '@/store'

interface PlatformSettings {
  platformFee: number
  deliveryCharge: number
  freeDeliveryThreshold: number
  minimumOrderAmount: number
  basicPlanPrice: number
  basicPlanFeatures: string
  standardPlanPrice: number
  standardPlanFeatures: string
  premiumPlanPrice: number
  premiumPlanFeatures: string
  defaultCommissionRate: number
}

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    platformFee: 20,
    deliveryCharge: 20,
    freeDeliveryThreshold: 150,
    minimumOrderAmount: 0,
    basicPlanPrice: 499,
    basicPlanFeatures: "Basic listing,Standard support",
    standardPlanPrice: 999,
    standardPlanFeatures: "Featured listing,Priority support,Analytics",
    premiumPlanPrice: 1999,
    premiumPlanFeatures: "Top listing,24/7 support,Advanced analytics,Promotions",
    defaultCommissionRate: 10
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await adminApi.getPlatformSettings()
      if (res.data.data) {
        setSettings(res.data.data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminApi.updatePlatformSettings(settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Access denied. Admin access required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Platform Settings</h1>
          <p className="text-sm text-muted-foreground">Configure business rules, charges, and subscription plans</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Product Commission Settings
                  </CardTitle>
                  <CardDescription>
                    Commission rate for shops that don't have subscription (product-based sales)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <label className="w-48">Default Commission:</label>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={settings.defaultCommissionRate}
                          onChange={(e) => setSettings({ ...settings, defaultCommissionRate: Number(e.target.value) })}
                          className="w-24"
                          min={0}
                          max={100}
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="w-48">Platform Fee (per order):</label>
                      <div className="flex items-center gap-1">
                        <span className="text-lg">₹</span>
                        <Input
                          type="number"
                          value={settings.platformFee}
                          onChange={(e) => setSettings({ ...settings, platformFee: Number(e.target.value) })}
                          className="w-24"
                          min={0}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                      <strong>Example:</strong> ₹1000 order = ₹{settings.defaultCommissionRate} commission ({(settings.defaultCommissionRate/100)*1000}) + ₹{settings.platformFee} platform fee = <strong>₹{((settings.defaultCommissionRate/100)*1000) + settings.platformFee} total platform earning</strong>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" />
                    Delivery Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <label className="w-48">Delivery Charge:</label>
                    <div className="flex items-center gap-1">
                      <span className="text-lg">₹</span>
                      <Input
                        type="number"
                        value={settings.deliveryCharge}
                        onChange={(e) => setSettings({ ...settings, deliveryCharge: Number(e.target.value) })}
                        className="w-24"
                        min={0}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-48">Free Delivery Above:</label>
                    <div className="flex items-center gap-1">
                      <span className="text-lg">₹</span>
                      <Input
                        type="number"
                        value={settings.freeDeliveryThreshold}
                        onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
                        className="w-24"
                        min={0}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-48">Minimum Order:</label>
                    <div className="flex items-center gap-1">
                      <span className="text-lg">₹</span>
                      <Input
                        type="number"
                        value={settings.minimumOrderAmount}
                        onChange={(e) => setSettings({ ...settings, minimumOrderAmount: Number(e.target.value) })}
                        className="w-24"
                        min={0}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    Monthly Subscription Plans
                  </CardTitle>
                  <CardDescription>
                    Shops with subscription don't pay commission on orders - they pay monthly fee instead
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span className="font-medium">Basic</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-2xl font-bold">₹</span>
                        <Input
                          type="number"
                          value={settings.basicPlanPrice}
                          onChange={(e) => setSettings({ ...settings, basicPlanPrice: Number(e.target.value) })}
                          className="w-24"
                          min={0}
                        />
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <Input
                        value={settings.basicPlanFeatures}
                        onChange={(e) => setSettings({ ...settings, basicPlanFeatures: e.target.value })}
                        placeholder="Features (comma separated)"
                        className="text-sm"
                      />
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50 border border-primary/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-4 h-4 text-purple-400" />
                        <span className="font-medium">Standard</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-2xl font-bold">₹</span>
                        <Input
                          type="number"
                          value={settings.standardPlanPrice}
                          onChange={(e) => setSettings({ ...settings, standardPlanPrice: Number(e.target.value) })}
                          className="w-24"
                          min={0}
                        />
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <Input
                        value={settings.standardPlanFeatures}
                        onChange={(e) => setSettings({ ...settings, standardPlanFeatures: e.target.value })}
                        placeholder="Features (comma separated)"
                        className="text-sm"
                      />
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50 border border-yellow-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Gem className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium">Premium</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-2xl font-bold">₹</span>
                        <Input
                          type="number"
                          value={settings.premiumPlanPrice}
                          onChange={(e) => setSettings({ ...settings, premiumPlanPrice: Number(e.target.value) })}
                          className="w-24"
                          min={0}
                        />
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <Input
                        value={settings.premiumPlanFeatures}
                        onChange={(e) => setSettings({ ...settings, premiumPlanFeatures: e.target.value })}
                        placeholder="Features (comma separated)"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="flex items-center justify-between pt-4">
              <div>
                {saved && (
                  <span className="text-green-400 text-sm">Settings saved successfully!</span>
                )}
              </div>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save All Settings'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}