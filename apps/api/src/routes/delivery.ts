import { Router } from 'express'
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js'
import prisma from '../lib/db.js'

const router = Router()

// In-memory storage for delivery boy locations
const deliveryBoyLocations: Record<string, { lat: number; lng: number; timestamp: number }> = {}

router.get('/assignments', authenticate, authorize('DELIVERY_BOY'), async (req: AuthRequest, res) => {
  const deliveries = await prisma.delivery.findMany({
    where: { deliveryBoyId: req.user?.userId },
    include: {
      order: {
        include: {
          deliveryAddress: true,
          shop: { select: { name: true, address: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      },
    },
  })
  res.json({ success: true, data: deliveries })
})

router.get('/shop-assignments', authenticate, authorize('SHOP_OWNER'), async (req: AuthRequest, res) => {
  const shops = await prisma.shop.findMany({ where: { ownerId: req.user?.userId }, select: { id: true } })
  const shopIds = shops.map((s: { id: string }) => s.id)

  const deliveries = await prisma.delivery.findMany({
    where: { shopId: { in: shopIds }, status: 'ASSIGNED' },
    include: {
      order: {
        include: {
          customer: { select: { name: true, phone: true } },
          deliveryAddress: true,
        },
      },
    },
  })
  res.json({ success: true, data: deliveries })
})

router.put('/:id/update-status', authenticate, authorize('DELIVERY_BOY'), async (req: AuthRequest, res) => {
  const { status } = req.body

  const delivery = await prisma.delivery.findFirst({
    where: { id: req.params.id, deliveryBoyId: req.user?.userId },
  })
  if (!delivery) {
    return res.status(404).json({ success: false, error: 'Delivery not found' })
  }

  const validStatuses = ['ASSIGNED', 'ACCEPTED', 'REJECTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' })
  }

  const updateData: any = { status }
  if (status === 'IN_TRANSIT' || status === 'PICKED_UP') {
    updateData.pickupTime = new Date()
  }
  if (status === 'DELIVERED') {
    updateData.deliveredTime = new Date()
  }

  const updated = await prisma.delivery.update({
    where: { id: req.params.id },
    data: updateData,
  })

  if (status === 'IN_TRANSIT') {
    await prisma.order.update({
      where: { id: delivery.orderId },
      data: { status: 'OUT_FOR_DELIVERY' },
    })
  }
  if (status === 'DELIVERED') {
    await prisma.order.update({
      where: { id: delivery.orderId },
      data: { status: 'DELIVERED', paymentStatus: 'COMPLETED' },
    })
  }

  res.json({ success: true, data: updated })
})

router.post('/:id/verify-otp', authenticate, authorize('DELIVERY_BOY'), async (req: AuthRequest, res) => {
  const { otp } = req.body

  const delivery = await prisma.delivery.findFirst({
    where: { id: req.params.id, deliveryBoyId: req.user?.userId },
  })
  if (!delivery) {
    return res.status(404).json({ success: false, error: 'Delivery not found' })
  }

  if (delivery.deliveryOtp && otp === delivery.deliveryOtp) {
    await prisma.delivery.update({
      where: { id: req.params.id },
      data: { otpVerified: true, status: 'DELIVERED', deliveredTime: new Date() },
    })

    await prisma.order.update({
      where: { id: delivery.orderId },
      data: { status: 'DELIVERED', paymentStatus: 'COMPLETED' },
    })

    res.json({ success: true, message: 'OTP verified successfully' })
  } else if (process.env.NODE_ENV === 'development' && otp === '123456') {
    // Dev-only: accept hardcoded OTP when no OTP is set (for testing without SMS/WhatsApp)
    await prisma.delivery.update({
      where: { id: req.params.id },
      data: { otpVerified: true, status: 'DELIVERED', deliveredTime: new Date() },
    })

    await prisma.order.update({
      where: { id: delivery.orderId },
      data: { status: 'DELIVERED', paymentStatus: 'COMPLETED' },
    })

    res.json({ success: true, message: 'OTP verified successfully (dev mode)' })
  } else {
    res.status(400).json({ success: false, error: 'Invalid OTP' })
  }
})

// Update delivery boy's live location
router.put('/location/update', authenticate, authorize('DELIVERY_BOY'), async (req: AuthRequest, res) => {
  const { lat, lng } = req.body
  const userId = req.user?.userId

  if (!lat || !lng) {
    return res.status(400).json({ success: false, error: 'Latitude and longitude required' })
  }

  deliveryBoyLocations[userId!] = { lat, lng, timestamp: Date.now() }
  res.json({ success: true, message: 'Location updated' })
})

// Get delivery boy's live location for a delivery
router.get('/:deliveryId/location', authenticate, async (req: AuthRequest, res) => {
  const delivery = await prisma.delivery.findUnique({
    where: { id: req.params.deliveryId },
    include: { order: { select: { customerId: true } } },
  })

  if (!delivery) {
    return res.status(404).json({ success: false, error: 'Delivery not found' })
  }

  // Only customer or delivery boy can access
  const userId = req.user?.userId
  if (delivery.deliveryBoyId !== userId && delivery.order.customerId !== userId && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Not authorized' })
  }

  const location = deliveryBoyLocations[delivery.deliveryBoyId]
  
  res.json({ 
    success: true, 
    data: location ? { lat: location.lat, lng: location.lng } : null 
  })
})

// Get delivery location for an order (customer facing)
router.get('/order/:orderId/location', authenticate, async (req: AuthRequest, res) => {
  const delivery = await prisma.delivery.findFirst({
    where: { orderId: req.params.orderId },
    include: { 
      order: { 
        select: { 
          customerId: true,
          deliveryAddress: true 
        } 
      } 
    },
  })

  if (!delivery) {
    return res.json({ success: true, data: null })
  }

  const location = deliveryBoyLocations[delivery.deliveryBoyId]
  
  res.json({ 
    success: true, 
    data: {
      deliveryBoyLocation: location ? { lat: location.lat, lng: location.lng } : null,
      customerLocation: delivery.order.deliveryAddress 
        ? { lat: delivery.order.deliveryAddress.latitude, lng: delivery.order.deliveryAddress.longitude }
        : null,
    }
  })
})

// Reschedule failed delivery (shop owner or admin)
router.post('/:id/reschedule', authenticate, async (req: AuthRequest, res) => {
  const delivery = await prisma.delivery.findUnique({
    where: { id: req.params.id },
    include: { order: true },
  })
  if (!delivery) {
    return res.status(404).json({ success: false, error: 'Delivery not found' })
  }

  // Only shop owner or admin can reschedule
  if (req.user?.role === 'CUSTOMER' || req.user?.role === 'DELIVERY_BOY') {
    return res.status(403).json({ success: false, error: 'Not authorized' })
  }

  if (req.user?.role === 'SHOP_OWNER') {
    const shop = await prisma.shop.findFirst({ where: { id: delivery.shopId, ownerId: req.user.userId } })
    if (!shop) {
      return res.status(403).json({ success: false, error: 'Not authorized' })
    }
  }

  // Reset delivery status to ASSIGNED
  await prisma.delivery.update({
    where: { id: req.params.id },
    data: { status: 'ASSIGNED', otpVerified: false, pickupTime: null, deliveredTime: null },
  })

  // Reset order status back to PREPARING
  await prisma.order.update({
    where: { id: delivery.orderId },
    data: { status: 'PREPARING' },
  })

  res.json({ success: true, message: 'Delivery rescheduled' })
})

export const deliveryRouter = router
