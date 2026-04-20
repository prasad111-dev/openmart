import { Router } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import prisma from '../lib/db.js'

const router = Router()

// Get notifications for current user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  const { page = '1', limit = '20', type, isRead } = req.query

  const where: any = { userId: req.user?.userId }
  if (type) where.type = type
  if (isRead !== undefined) where.isRead = isRead === 'true'

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId: req.user?.userId, isRead: false } }),
  ])

  res.json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      totalPages: Math.ceil(total / parseInt(limit as string)),
    },
  })
})

// Mark notification as read
router.put('/:id/mark-read', authenticate, async (req: AuthRequest, res) => {
  const notification = await prisma.notification.findFirst({
    where: { id: req.params.id, userId: req.user?.userId },
  })
  if (!notification) {
    return res.status(404).json({ success: false, error: 'Notification not found' })
  }

  const updated = await prisma.notification.update({
    where: { id: req.params.id },
    data: { isRead: true, readAt: new Date() },
  })

  res.json({ success: true, data: updated })
})

// Mark all notifications as read
router.put('/mark-all-read', authenticate, async (req: AuthRequest, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user?.userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  })

  res.json({ success: true, message: 'All notifications marked as read' })
})

// Delete notification
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  const notification = await prisma.notification.findFirst({
    where: { id: req.params.id, userId: req.user?.userId },
  })
  if (!notification) {
    return res.status(404).json({ success: false, error: 'Notification not found' })
  }

  await prisma.notification.delete({ where: { id: req.params.id } })
  res.json({ success: true, message: 'Notification deleted' })
})

// Admin: get failed notifications for retry
router.get('/admin/failed', authenticate, async (_req: AuthRequest, res) => {
  const failed = await prisma.notification.findMany({
    where: { status: 'FAILED' },
    include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  res.json({ success: true, data: failed })
})

export const notificationRouter = router
