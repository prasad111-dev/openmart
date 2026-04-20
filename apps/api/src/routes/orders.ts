import { Router } from 'express'
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js'
import prisma from '../lib/db.js'
import { z } from 'zod'

const router = Router()

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const userId = req.user?.userId
  const role = req.user?.role

  let where: any = {}

  if (role === 'CUSTOMER') {
    where.customerId = userId
  } else if (role === 'SHOP_OWNER') {
    const shops = await prisma.shop.findMany({ where: { ownerId: userId }, select: { id: true } })
    const shopIds = shops.map((s: { id: string }) => s.id)
    where.shopId = { in: shopIds }
  } else if (role === 'DELIVERY_BOY') {
    where.deliveryBoyId = userId
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      shop: { select: { name: true } },
      deliveryAddress: true,
      deliveryBoy: { select: { name: true, phone: true } },
      items: { include: { product: { select: { name: true, imageUrl: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const formatted = orders.map((order: any) => ({
    id: order.id,
    shopName: order.shop.name,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    totalAmount: Number(order.totalAmount),
    deliveryAddress: order.deliveryAddress.street,
    createdAt: order.createdAt,
    deliveryBoyName: order.deliveryBoy?.name,
    deliveryBoyPhone: order.deliveryBoy?.phone,
    items: order.items.map((item: any) => ({
      productId: item.productId,
      name: item.product.name,
      imageUrl: item.product.imageUrl,
      quantity: item.quantity,
      price: Number(item.price),
    })),
  }))

  res.json({ success: true, data: formatted })
})

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      shop: true,
      customer: { select: { name: true, phone: true } },
      deliveryAddress: true,
      deliveryBoy: { select: { name: true, phone: true } },
      items: { include: { product: true } },
    },
  })

  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' })
  }

  const userId = req.user?.userId
  const role = req.user?.role

  if (role === 'CUSTOMER' && order.customerId !== userId) {
    return res.status(403).json({ success: false, error: 'Not authorized' })
  }

  if (role === 'SHOP_OWNER') {
    const shop = await prisma.shop.findFirst({
      where: { id: order.shopId, ownerId: userId },
    })
    if (!shop) {
      return res.status(403).json({ success: false, error: 'Not authorized' })
    }
  }

  const formatted = {
    ...order,
    totalAmount: Number(order.totalAmount),
    items: order.items.map((item: any) => ({
      ...item,
      price: Number(item.price),
    })),
  }

  res.json({ success: true, data: formatted })
})

router.post('/', authenticate, authorize('CUSTOMER'), async (req: AuthRequest, res) => {
  const schema = z.object({
    shopId: z.string(),
    deliveryAddressId: z.string(),
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number().min(1),
    })),
    specialInstructions: z.string().optional(),
    paymentMethod: z.enum(['COD']).default('COD'),
  })

  const data = schema.parse(req.body)

  const address = await prisma.address.findFirst({
    where: { id: data.deliveryAddressId, userId: req.user?.userId },
  })
  if (!address) {
    return res.status(400).json({ success: false, error: 'Invalid address' })
  }

  const products = await prisma.product.findMany({
    where: { id: { in: data.items.map(i => i.productId) } },
  })

  if (products.length !== data.items.length) {
    return res.status(400).json({ success: false, error: 'Some products not found' })
  }

  let totalAmount = 0
  for (const item of data.items) {
    const product = products.find((p: any) => p.id === item.productId)
    if (!product) {
      return res.status(400).json({ success: false, error: `Product not found: ${item.productId}` })
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ success: false, error: `Insufficient stock for ${product.name}` })
    }
    totalAmount += Number(product.price) * item.quantity
  }

  const newOrder = await prisma.order.create({
    data: {
      customerId: req.user?.userId || '',
      shopId: data.shopId,
      deliveryAddressId: data.deliveryAddressId,
      specialInstructions: data.specialInstructions,
      paymentMethod: data.paymentMethod,
      totalAmount,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      items: {
        create: data.items.map(item => {
          const product = products.find((p: any) => p.id === item.productId)!
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          }
        }),
      },
    },
    include: {
      items: { include: { product: true } },
    },
  })

  for (const item of data.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    })
  }

  // Clear the customer's cart after order
  await prisma.cartItem.deleteMany({
    where: { userId: req.user?.userId },
  })

  const formatted = {
    ...newOrder,
    totalAmount: Number(newOrder.totalAmount),
    items: newOrder.items.map((item: any) => ({
      ...item,
      price: Number(item.price),
    })),
  }

  res.status(201).json({ success: true, data: formatted })
})

router.put('/:id/status', authenticate, authorize('SHOP_OWNER', 'ADMIN'), async (req: AuthRequest, res) => {
  const { status } = req.body

  const order = await prisma.order.findUnique({ where: { id: req.params.id } })
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' })
  }

  if (req.user?.role === 'SHOP_OWNER') {
    const shop = await prisma.shop.findFirst({
      where: { id: order.shopId, ownerId: req.user.userId },
    })
    if (!shop) {
      return res.status(403).json({ success: false, error: 'Not authorized' })
    }
  }

  const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'FAILED']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' })
  }

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
  })

  await prisma.orderStatusHistory.create({
    data: {
      orderId: req.params.id,
      fromStatus: order.status as any,
      toStatus: status as any,
      changedBy: req.user?.userId || null,
    },
  })

  res.json({ success: true, data: { ...updated, totalAmount: Number(updated.totalAmount) } })
})

router.put('/:id/cancel', authenticate, async (req: AuthRequest, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } })
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' })
  }

  if (order.customerId !== req.user?.userId && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Not authorized' })
  }

  if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
    return res.status(400).json({ success: false, error: 'Cannot cancel order after it has been accepted' })
  }

  const items = await prisma.orderItem.findMany({ where: { orderId: req.params.id } })
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    })
  }

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancelledBy: req.user?.userId || null,
      updatedAt: new Date(),
    },
  })

  res.json({ success: true, data: { ...updated, totalAmount: Number(updated.totalAmount) } })
})

router.post('/:id/assign-delivery', authenticate, authorize('SHOP_OWNER'), async (req: AuthRequest, res) => {
  const { deliveryBoyId } = req.body

  const order = await prisma.order.findUnique({ where: { id: req.params.id } })
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' })
  }

  const shop = await prisma.shop.findFirst({
    where: { id: order.shopId, ownerId: req.user?.userId },
  })
  if (!shop) {
    return res.status(403).json({ success: false, error: 'Not authorized' })
  }

  const deliveryBoy = await prisma.user.findFirst({
    where: { id: deliveryBoyId, role: 'DELIVERY_BOY', isVerified: true, isBlocked: false },
  })
  if (!deliveryBoy) {
    return res.status(400).json({ success: false, error: 'Invalid delivery boy' })
  }

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: { deliveryBoyId, status: 'READY_FOR_PICKUP', updatedAt: new Date() },
  })

  await prisma.delivery.create({
    data: {
      orderId: order.id,
      deliveryBoyId,
      shopId: order.shopId,
      status: 'ASSIGNED',
    },
  })

  await prisma.orderStatusHistory.create({
    data: {
      orderId: req.params.id,
      fromStatus: order.status as any,
      toStatus: 'READY_FOR_PICKUP' as any,
      changedBy: req.user?.userId || null,
    },
  })

  res.json({ success: true, data: updated })
})

router.put('/:id/deliver', authenticate, authorize('DELIVERY_BOY', 'ADMIN'), async (req: AuthRequest, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } })
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' })
  }

  if (req.user?.role === 'DELIVERY_BOY' && order.deliveryBoyId !== req.user.userId) {
    return res.status(403).json({ success: false, error: 'Not authorized' })
  }

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: 'DELIVERED', paymentStatus: 'COMPLETED', updatedAt: new Date() },
  })

  // Update delivery record if it exists
  const delivery = await prisma.delivery.findUnique({ where: { orderId: order.id } })
  if (delivery) {
    await prisma.delivery.update({
      where: { orderId: order.id },
      data: { status: 'DELIVERED', deliveredTime: new Date() },
    })
  }

  res.json({ success: true, data: { ...updated, totalAmount: Number(updated.totalAmount) } })
})

// Update payment status (for future online payment integration)
router.put('/:id/payment-status', authenticate, async (req: AuthRequest, res) => {
  const { paymentStatus } = req.body
  const validStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']
  if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
    return res.status(400).json({ success: false, error: 'Valid payment status is required' })
  }

  const order = await prisma.order.findUnique({ where: { id: req.params.id } })
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' })
  }

  // Only shop owner, admin, or delivery boy can update payment status
  if (req.user?.role === 'CUSTOMER') {
    return res.status(403).json({ success: false, error: 'Not authorized' })
  }

  if (req.user?.role === 'SHOP_OWNER') {
    const shop = await prisma.shop.findFirst({ where: { id: order.shopId, ownerId: req.user.userId } })
    if (!shop) {
      return res.status(403).json({ success: false, error: 'Not authorized' })
    }
  }

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: { paymentStatus },
  })

  res.json({ success: true, data: { ...updated, totalAmount: Number(updated.totalAmount) } })
})

export const orderRouter = router
