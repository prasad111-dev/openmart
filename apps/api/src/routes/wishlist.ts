import { Router } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import prisma from '../lib/db.js'

const router = Router()

// Get wishlist items for current user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.user?.userId },
    include: { product: { include: { shop: { select: { name: true, isOpen: true } } } } },
    orderBy: { createdAt: 'desc' },
  })

  res.json({ success: true, data: items })
})

// Add item to wishlist
router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { productId } = req.body
  if (!productId) {
    return res.status(400).json({ success: false, error: 'Product ID is required' })
  }

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' })
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: req.user?.userId || '', productId } },
  })
  if (existing) {
    return res.status(400).json({ success: false, error: 'Already in wishlist' })
  }

  const item = await prisma.wishlistItem.create({
    data: { userId: req.user?.userId || '', productId },
    include: { product: true },
  })

  res.status(201).json({ success: true, data: item })
})

// Remove item from wishlist
router.delete('/:productId', authenticate, async (req: AuthRequest, res) => {
  const item = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: req.user?.userId || '', productId: req.params.productId } },
  })
  if (!item) {
    return res.status(404).json({ success: false, error: 'Item not found in wishlist' })
  }

  await prisma.wishlistItem.delete({
    where: { userId_productId: { userId: req.user?.userId || '', productId: req.params.productId } },
  })

  res.json({ success: true, message: 'Removed from wishlist' })
})

export const wishlistRouter = router
