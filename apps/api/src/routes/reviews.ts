import { Router } from 'express'
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js'
import prisma from '../lib/db.js'

const router = Router()

// Get reviews (with optional filters)
router.get('/', async (req, res) => {
  const { shopId, productId, rating, page = '1', limit = '20' } = req.query

  const where: any = {}
  if (shopId) where.shopId = shopId
  if (productId) where.productId = productId
  if (rating) where.rating = parseInt(rating as string)

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        shop: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, imageUrl: true } },
        order: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
    }),
    prisma.review.count({ where }),
  ])

  res.json({
    success: true,
    data: reviews,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      totalPages: Math.ceil(total / parseInt(limit as string)),
    },
  })
})

// Get review by ID
router.get('/:id', async (req, res) => {
  const review = await prisma.review.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      shop: { select: { id: true, name: true } },
      product: { select: { id: true, name: true, imageUrl: true } },
    },
  })

  if (!review) {
    return res.status(404).json({ success: false, error: 'Review not found' })
  }

  res.json({ success: true, data: review })
})

// Create review (customer only, after order delivery)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { shopId, productId, orderId, rating, comment, images } = req.body

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' })
  }

  if (!shopId && !productId) {
    return res.status(400).json({ success: false, error: 'Shop ID or Product ID is required' })
  }

  if (orderId) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId: req.user?.userId, status: 'DELIVERED' },
    })
    if (!order) {
      return res.status(400).json({ success: false, error: 'Order not found or not delivered' })
    }

    const existing = await prisma.review.findFirst({
      where: { orderId, userId: req.user?.userId },
    })
    if (existing) {
      return res.status(400).json({ success: false, error: 'Review already submitted for this order' })
    }
  }

  const review = await prisma.review.create({
    data: {
      userId: req.user?.userId || '',
      shopId: shopId || null,
      productId: productId || null,
      orderId: orderId || null,
      rating,
      comment: comment || null,
      images: images || null,
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  })

// Update shop rating
   if (shopId) {
     const shopReviews = await prisma.review.findMany({ where: { shopId } })
     const avgRating = shopReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / shopReviews.length
     await prisma.shop.update({
       where: { id: shopId },
       data: { rating: Math.round(avgRating * 10) / 10, reviewCount: shopReviews.length },
     })
   }

  res.status(201).json({ success: true, data: review })
})

// Update review (owner only)
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } })
  if (!review) {
    return res.status(404).json({ success: false, error: 'Review not found' })
  }
  if (review.userId !== req.user?.userId && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Not authorized' })
  }

  const { rating, comment } = req.body
  const updated = await prisma.review.update({
    where: { id: req.params.id },
    data: {
      ...(rating && { rating }),
      ...(comment !== undefined && { comment }),
    },
  })

  res.json({ success: true, data: updated })
})

// Delete review (owner or admin)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } })
  if (!review) {
    return res.status(404).json({ success: false, error: 'Review not found' })
  }
  if (review.userId !== req.user?.userId && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Not authorized' })
  }

  await prisma.review.delete({ where: { id: req.params.id } })

// Recalculate shop rating
   if (review.shopId) {
     const shopReviews = await prisma.review.findMany({ where: { shopId: review.shopId } })
     if (shopReviews.length > 0) {
       const avgRating = shopReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / shopReviews.length
       await prisma.shop.update({
         where: { id: review.shopId },
         data: { rating: Math.round(avgRating * 10) / 10, reviewCount: shopReviews.length },
       })
     } else {
       await prisma.shop.update({
         where: { id: review.shopId },
         data: { rating: 0, reviewCount: 0 },
       })
     }
   }

  res.json({ success: true, message: 'Review deleted' })
})

// Admin: get all reviews with moderation filters
router.get('/admin/all', authenticate, authorize('ADMIN'), async (req, res) => {
  const { page = '1', limit = '20', shopId, rating } = req.query

  const where: any = {}
  if (shopId) where.shopId = shopId
  if (rating) where.rating = parseInt(rating as string)

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        shop: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
    }),
    prisma.review.count({ where }),
  ])

  res.json({
    success: true,
    data: reviews,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      totalPages: Math.ceil(total / parseInt(limit as string)),
    },
  })
})

export const reviewRouter = router
