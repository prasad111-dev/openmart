import { Router } from 'express'
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js'
import prisma from '../lib/db.js'
import bcrypt from 'bcryptjs'

const router = Router()

router.get('/shops', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  const { status, category } = req.query
  
  const where: any = {}
  if (status === 'pending') where.isApproved = false
  else if (status === 'approved') where.isApproved = true
  if (category) where.category = String(category)

  const shops = await prisma.shop.findMany({
    where,
    include: { owner: { select: { name: true, phone: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ success: true, data: shops })
})

// Admin create shop with owner
router.post('/shops', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { ownerName, ownerEmail, ownerPhone, ownerPassword, shopName, shopDescription, shopAddress, shopPincode, shopPhone, shopCategory, shopEmail } = req.body

    if (!ownerName || !shopName || !shopAddress) {
      return res.status(400).json({ success: false, error: 'Owner name, shop name and address required' })
    }

    const tempPassword = ownerPassword || `temp_${Date.now()}`
    const hashedPassword = await bcrypt.hash(tempPassword, 10)
    
    const ownerEmailFinal = ownerEmail || `owner_${Date.now()}@shop.com`
    const ownerPhoneFinal = ownerPhone || `+919999999999`

    // Check if email already exists
    if (ownerEmail) {
      const existingUser = await prisma.user.findUnique({ where: { email: ownerEmail } })
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'Email already exists. Use a different email.' })
      }
    }

    // Check if phone already exists
    if (ownerPhone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone: ownerPhone } })
      if (existingPhone) {
        return res.status(400).json({ success: false, error: 'Phone number already exists.' })
      }
    }

    // Create user first
    const user = await prisma.user.create({
      data: {
        name: ownerName,
        email: ownerEmailFinal,
        phone: ownerPhoneFinal,
        password: hashedPassword,
        role: 'SHOP_OWNER',
        isVerified: true,
      },
    })

    // Create shop for the user
    const shop = await prisma.shop.create({
      data: {
        ownerId: user.id,
        name: shopName,
        description: shopDescription || '',
        address: shopAddress,
        pincode: shopPincode || '442105',
        phone: shopPhone || ownerPhone || '',
        email: shopEmail || ownerEmail || '',
        category: shopCategory || 'General',
        isApproved: true,
        isOpen: true,
      },
    })

    res.status(201).json({ 
      success: true, 
      data: { user, shop }, 
      message: `Shop created successfully!\nEmail: ${ownerEmailFinal}\nPassword: ${tempPassword}` 
    })
  } catch (error: any) {
    console.error('Create shop error:', error)
    res.status(500).json({ success: false, error: error.message || 'Failed to create shop' })
  }
})

router.put('/shops/:id/approve', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  const shop = await prisma.shop.findUnique({
    where: { id: req.params.id },
    include: { owner: true },
  })
  
  if (!shop) {
    return res.status(404).json({ success: false, error: 'Shop not found' })
  }

  const updated = await prisma.shop.update({
    where: { id: req.params.id },
    data: { isApproved: true, isOpen: true },
  })

  res.json({ success: true, data: updated, message: 'Shop approved successfully' })
})

router.put('/shops/:id/reject', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  const shop = await prisma.shop.findUnique({
    where: { id: req.params.id },
    include: { owner: true },
  })
  
  if (!shop) {
    return res.status(404).json({ success: false, error: 'Shop not found' })
  }

  const updated = await prisma.shop.update({
    where: { id: req.params.id },
    data: { isApproved: false, isOpen: false },
  })

  res.json({ success: true, data: updated, message: 'Shop rejected successfully' })
})

router.put('/shops/:id/toggle', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  const shop = await prisma.shop.findUnique({ where: { id: req.params.id } })
  
  if (!shop) {
    return res.status(404).json({ success: false, error: 'Shop not found' })
  }

  const updated = await prisma.shop.update({
    where: { id: req.params.id },
    data: { isOpen: !shop.isOpen },
  })

  res.json({ success: true, data: updated })
})

router.get('/users', authenticate, authorize('ADMIN'), async (_req: AuthRequest, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, phone: true, name: true, role: true, isVerified: true, isBlocked: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ success: true, data: users })
})

router.get('/delivery-boys', authenticate, authorize('ADMIN'), async (_req: AuthRequest, res) => {
  const deliveryBoys = await prisma.user.findMany({
    where: { role: 'DELIVERY_BOY', isBlocked: false, isVerified: true },
    select: { id: true, name: true, phone: true },
  })
  res.json({ success: true, data: deliveryBoys })
})

router.put('/users/:id/role', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  const { role } = req.body
  
  const user = await prisma.user.findUnique({ where: { id: req.params.id } })
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }

  const validRoles = ['CUSTOMER', 'SHOP_OWNER', 'DELIVERY_BOY', 'ADMIN']
  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, error: 'Invalid role' })
  }

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
  })

  res.json({ success: true, data: updated, message: `User role updated to ${role}` })
})

router.put('/users/:id/block', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } })
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { isBlocked: !user.isBlocked },
  })

  res.json({ success: true, data: { id: updated.id, isBlocked: updated.isBlocked }, message: updated.isBlocked ? 'User blocked' : 'User unblocked' })
})

router.get('/stats', authenticate, authorize('ADMIN'), async (_req: AuthRequest, res) => {
  const [totalUsers, totalShops, totalOrders, totalProducts] = await Promise.all([
    prisma.user.count(),
    prisma.shop.count(),
    prisma.order.count(),
    prisma.product.count(),
  ])

  const pendingShops = await prisma.shop.count({ where: { isApproved: false } })
  const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } })

  res.json({
    success: true,
    data: {
      totalUsers,
      totalShops,
      totalOrders,
      totalProducts,
      pendingShops,
      pendingOrders,
    },
  })
})

router.get('/orders', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  const { status, shopId, startDate, endDate } = req.query
  
  const where: any = {}
  if (status) where.status = String(status)
  if (shopId) where.shopId = String(shopId)
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(String(startDate))
    if (endDate) where.createdAt.lte = new Date(String(endDate))
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      shop: { select: { name: true } },
      customer: { select: { name: true, phone: true } },
      deliveryAddress: true,
      deliveryBoy: { select: { name: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  res.json({ success: true, data: orders })
})

// Get seller settlement summary
router.get('/seller-settlements', authenticate, authorize('ADMIN'), async (_req: AuthRequest, res) => {
  try {
    const shops = await prisma.shop.findMany({
      where: { isApproved: true },
      include: {
        owner: { select: { name: true, phone: true, email: true } },
        orders: {
          where: { status: { in: ['DELIVERED'] } },
          select: { totalAmount: true, createdAt: true }
        },
        payments: { select: { amount: true, paymentDate: true } }
      }
    })

    const settlements = shops.map((shop: any) => {
      const totalSales = shop.orders.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0)
      const commissionRate = shop.commissionRate || 10
      
      // Calculate earnings based on shop type
      let platformEarnings = 0
      if (shop.shopType === 'SUBSCRIPTION') {
        // Subscription shops pay monthly fee, no commission on orders
        platformEarnings = Number(shop.monthlySubscriptionFee) || 0
      } else {
        // Commission-based shops: 10% of order total + platform fee per order
        const totalCommission = totalSales * (commissionRate / 100)
        const platformFeePerOrder = 20 // per order platform fee
        const totalPlatformFees = shop.orders.length * platformFeePerOrder
        platformEarnings = totalCommission + totalPlatformFees
      }
      
      const totalPaid = shop.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0)
      const pendingAmount = platformEarnings - totalPaid

      return {
        shopId: shop.id,
        shopName: shop.name,
        shopType: shop.shopType,
        ownerName: shop.owner.name,
        ownerPhone: shop.owner.phone,
        ownerEmail: shop.owner.email,
        totalOrders: shop.orders.length,
        totalSales,
        commissionRate,
        monthlySubscriptionFee: Number(shop.monthlySubscriptionFee) || 0,
        platformEarnings,
        totalPaid,
        pendingAmount: pendingAmount > 0 ? pendingAmount : 0,
        hasPendingDues: pendingAmount > 0
      }
    })

    res.json({ success: true, data: settlements })
  } catch (error) {
    console.error('Error fetching seller settlements:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch settlements' })
  }
})

// Get seller detail with orders and payment history
router.get('/seller-settlements/:shopId', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { shopId } = req.params

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        owner: { select: { name: true, phone: true, email: true } },
      }
    })

    if (!shop) {
      return res.status(404).json({ success: false, error: 'Shop not found' })
    }

    // Get all orders for this shop
    const orders = await prisma.order.findMany({
      where: { shopId },
      include: {
        customer: { select: { name: true, phone: true } },
        items: { include: { product: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate commission per order
    const ordersWithCommission = orders.map((order: any) => {
      const commissionRate = shop.commissionRate || 10
      const commission = Number(order.totalAmount) * (commissionRate / 100)
      const platformFee = 20 // per order platform fee
      return {
        ...order,
        commissionRate,
        commission,
        platformFee
      }
    })

    // Get payment history
    const payments = await prisma.sellerPayment.findMany({
      where: { shopId },
      orderBy: { paymentDate: 'desc' }
    })

    // Calculate totals based on shop type
    const deliveredOrders = orders.filter((o: any) => o.status === 'DELIVERED' || o.status === 'COMPLETED')
    const totalSales = deliveredOrders.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0)
    const commissionRate = shop.commissionRate || 10
    
    let platformEarnings = 0
    if (shop.shopType === 'SUBSCRIPTION') {
      platformEarnings = Number(shop.monthlySubscriptionFee) || 0
    } else {
      const totalCommission = totalSales * (commissionRate / 100)
      const totalPlatformFees = deliveredOrders.length * 20
      platformEarnings = totalCommission + totalPlatformFees
    }
    
    const totalPaid = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0)
    const pendingAmount = platformEarnings - totalPaid

    res.json({
      success: true,
      data: {
        shop,
        orders: ordersWithCommission,
        payments,
        summary: {
          shopType: shop.shopType,
          monthlySubscriptionFee: Number(shop.monthlySubscriptionFee) || 0,
          totalOrders: orders.length,
          deliveredOrders: deliveredOrders.length,
          totalSales,
          commissionRate,
          platformFeePerOrder: 20,
          platformEarnings,
          totalPaid,
          pendingAmount: pendingAmount > 0 ? pendingAmount : 0
        }
      }
    })
  } catch (error) {
    console.error('Error fetching seller detail:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch seller detail' })
  }
})

// Record payment received from seller
router.post('/seller-payments', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { shopId, amount, note, paymentDate } = req.body

    if (!shopId || !amount) {
      return res.status(400).json({ success: false, error: 'Shop ID and amount required' })
    }

    const shop = await prisma.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return res.status(404).json({ success: false, error: 'Shop not found' })
    }

    const payment = await prisma.sellerPayment.create({
      data: {
        shopId,
        amount: Number(amount),
        note: note || null,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date()
      }
    })

    res.json({ success: true, data: payment })
  } catch (error) {
    console.error('Error recording payment:', error)
    res.status(500).json({ success: false, error: 'Failed to record payment' })
  }
})

// Get pending alerts - sellers with unpaid dues
router.get('/seller-alerts', authenticate, authorize('ADMIN'), async (_req: AuthRequest, res) => {
  try {
    const shops = await prisma.shop.findMany({
      where: { isApproved: true },
      include: {
        owner: { select: { name: true, phone: true } },
        orders: {
          where: { status: { in: ['DELIVERED'] } },
          select: { totalAmount: true }
        },
        payments: { select: { amount: true } }
      }
    })

    const alerts = shops.map((shop: any) => {
      const totalSales = shop.orders.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0)
      const commissionRate = shop.commissionRate || 10
      const totalCommission = totalSales * (commissionRate / 100)
      const totalPaid = shop.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0)
      const pendingAmount = totalCommission - totalPaid

      if (pendingAmount > 0) {
        return {
          shopId: shop.id,
          shopName: shop.name,
          ownerName: shop.owner.name,
          ownerPhone: shop.owner.phone,
          pendingAmount,
          daysOverdue: Math.floor(pendingAmount / 100) // Rough estimate
        }
      }
      return null
    }).filter(Boolean)

    res.json({ success: true, data: alerts })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch alerts' })
  }
})

// Get platform settings (public - used by checkout)
router.get('/settings', async (_req, res) => {
  try {
    let settings = await prisma.platformSettings.findUnique({ where: { id: 'default' } })
    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: { id: 'default' }
      })
    }
    res.json({ success: true, data: settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch settings' })
  }
})

// Update platform settings
router.put('/platform-settings', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { 
      platformFee, deliveryCharge, freeDeliveryThreshold, minimumOrderAmount,
      basicPlanPrice, basicPlanFeatures, standardPlanPrice, standardPlanFeatures,
      premiumPlanPrice, premiumPlanFeatures, defaultCommissionRate
    } = req.body
    
    const settings = await prisma.platformSettings.upsert({
      where: { id: 'default' },
      update: {
        platformFee: platformFee !== undefined ? Number(platformFee) : undefined,
        deliveryCharge: deliveryCharge !== undefined ? Number(deliveryCharge) : undefined,
        freeDeliveryThreshold: freeDeliveryThreshold !== undefined ? Number(freeDeliveryThreshold) : undefined,
        minimumOrderAmount: minimumOrderAmount !== undefined ? Number(minimumOrderAmount) : undefined,
        basicPlanPrice: basicPlanPrice !== undefined ? Number(basicPlanPrice) : undefined,
        basicPlanFeatures: basicPlanFeatures || undefined,
        standardPlanPrice: standardPlanPrice !== undefined ? Number(standardPlanPrice) : undefined,
        standardPlanFeatures: standardPlanFeatures || undefined,
        premiumPlanPrice: premiumPlanPrice !== undefined ? Number(premiumPlanPrice) : undefined,
        premiumPlanFeatures: premiumPlanFeatures || undefined,
        defaultCommissionRate: defaultCommissionRate !== undefined ? Number(defaultCommissionRate) : undefined,
      },
      create: {
        id: 'default',
        platformFee: platformFee || 20,
        deliveryCharge: deliveryCharge || 20,
        freeDeliveryThreshold: freeDeliveryThreshold || 150,
        minimumOrderAmount: minimumOrderAmount || 0,
        basicPlanPrice: basicPlanPrice || 499,
        basicPlanFeatures: basicPlanFeatures || "Basic listing,Standard support",
        standardPlanPrice: standardPlanPrice || 999,
        standardPlanFeatures: standardPlanFeatures || "Featured listing,Priority support,Analytics",
        premiumPlanPrice: premiumPlanPrice || 1999,
        premiumPlanFeatures: premiumPlanFeatures || "Top listing,24/7 support,Advanced analytics,Promotions",
        defaultCommissionRate: defaultCommissionRate || 10,
      }
    })
    
    res.json({ success: true, data: settings })
  } catch (error) {
    console.error('Error updating platform settings:', error)
    res.status(500).json({ success: false, error: 'Failed to update settings' })
  }
})

// Update user password (admin only)
router.put('/users/:id/password', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  const { password } = req.body
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' })
  }

  const bcrypt = await import('bcryptjs')
  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { id: req.params.id },
    data: { password: hashedPassword },
  })

  res.json({ success: true, message: 'Password updated' })
})

// Update delivery boy details (admin only)
router.put('/delivery-boys/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  const { name, phone, email } = req.body

  const user = await prisma.user.findFirst({
    where: { id: req.params.id, role: 'DELIVERY_BOY' },
  })
  if (!user) {
    return res.status(404).json({ success: false, error: 'Delivery boy not found' })
  }

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(email && { email }),
    },
    select: { id: true, name: true, phone: true, email: true, role: true },
  })

  res.json({ success: true, data: updated })
})

// Update shop details (admin only)
router.put('/shops/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  const { name, description, address, pincode, phone, email, category, commissionRate, shopType, monthlySubscriptionFee } = req.body

  const shop = await prisma.shop.findUnique({ where: { id: req.params.id } })
  if (!shop) {
    return res.status(404).json({ success: false, error: 'Shop not found' })
  }

  const updated = await prisma.shop.update({
    where: { id: req.params.id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(address && { address }),
      ...(pincode && { pincode }),
      ...(phone && { phone }),
      ...(email !== undefined && { email }),
      ...(category && { category }),
      ...(commissionRate !== undefined && { commissionRate }),
      ...(shopType && { shopType }),
      ...(monthlySubscriptionFee !== undefined && { monthlySubscriptionFee }),
    },
  })

  res.json({ success: true, data: updated })
})

// Admin force-cancel order (restores stock)
router.put('/orders/:id/force-cancel', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true },
  })
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' })
  }
  if (order.status === 'CANCELLED' || order.status === 'DELIVERED') {
    return res.status(400).json({ success: false, error: 'Cannot cancel an already cancelled or delivered order' })
  }

  // Restore stock
  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    })
  }

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: 'CANCELLED', cancelledAt: new Date(), cancelledBy: req.user?.userId },
  })

  res.json({ success: true, data: { ...updated, totalAmount: Number(updated.totalAmount) } })
})

// Handle order dispute (admin only)
router.post('/orders/:id/dispute', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  const { reason, resolution } = req.body
  if (!reason) {
    return res.status(400).json({ success: false, error: 'Dispute reason is required' })
  }

  const order = await prisma.order.findUnique({ where: { id: req.params.id } })
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' })
  }

  // Create notification for customer
  await prisma.notification.create({
    data: {
      userId: order.customerId,
      type: 'ORDER_STATUS_UPDATE',
      content: `Dispute on order #${order.id.slice(0, 8)}: ${resolution || 'Under review'}`,
    },
  })

  res.json({ success: true, message: 'Dispute recorded' })
})

export const adminRouter = router
