import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import rateLimit from 'express-rate-limit'
import { authenticate, authorize, generateToken, generateRefreshToken, AuthRequest } from '../middleware/auth.js'
import prisma from '../lib/db.js'

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

const router = Router()

router.post('/register', authLimiter, async (req, res) => {
  try {
    const registerSchema = z.object({
      name: z.string().min(1, 'Name required'),
      email: z.string().email('Valid email required'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      phone: z.string().optional(),
      role: z.enum(['CUSTOMER', 'SHOP_OWNER', 'DELIVERY_BOY']).default('CUSTOMER'),
    })

    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.errors[0].message })
    }

    const { name, email, password, phone, role } = parsed.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    const userData: any = {
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: true,
    }
    if (phone) userData.phone = phone

    const newUser = await prisma.user.create({
      data: userData,
    })

    const token = generateToken({ userId: newUser.id, email: newUser.email, role: newUser.role })
    const refreshToken = generateRefreshToken({ userId: newUser.id })

    // Save refresh token to database (best-effort)
    try {
      await prisma.refreshToken.create({
        data: { userId: newUser.id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      })
    } catch (dbError) {
      console.warn('Failed to save refresh token:', dbError)
    }

    const { password: _, ...userWithoutPassword } = newUser
    res.status(201).json({ success: true, data: { token, refreshToken, user: userWithoutPassword } })
  } catch (error: any) {
    console.error('Registration error:', error)
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'User with this email already exists' })
    }
    res.status(500).json({ success: false, error: error.message || 'Internal server error' })
  }
})

router.post('/admin-login', authLimiter, async (req, res) => {
  try {
    const loginSchema = z.object({
      email: z.string().email('Valid email required'),
      password: z.string().min(1, 'Password required'),
    })

    const { email, password } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { email },
    })
    
    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({ success: false, error: 'Invalid admin credentials' })
    }

    let isValidPassword = false
    
    if (user.password.startsWith('$2a$')) {
      isValidPassword = await bcrypt.compare(password, user.password)
    } else {
      isValidPassword = password === user.password
      if (isValidPassword) {
        const hashedPassword = await bcrypt.hash(password, 10)
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        })
      }
    }
    
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid admin password' })
    }

    if (user.isBlocked) {
      return res.status(401).json({ success: false, error: 'Account is blocked' })
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role })
    const refreshToken = generateRefreshToken({ userId: user.id })

    const { password: _, ...userWithoutPassword } = user
    res.json({ success: true, data: { token, refreshToken, user: userWithoutPassword } })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors[0].message })
    }
    res.status(401).json({ success: false, error: 'Admin login failed' })
  }
})

// Social login (placeholder - returns user or creates one)
router.post('/social', async (req, res) => {
  try {
    const { provider, providerId, email, name, avatar } = req.body

    if (!provider || !providerId) {
      return res.status(400).json({ success: false, error: 'Provider and providerId required' })
    }

    // Try to find existing user by email
    let user = email ? await prisma.user.findUnique({ where: { email } }) : null

    if (!user && name && email) {
      // Create new user from social login
      const bcrypt = await import('bcryptjs')
      const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10)
      user = await prisma.user.create({
        data: {
          name,
          email,
          phone: '',
          password: randomPassword,
          role: 'CUSTOMER',
          isVerified: true,
          avatar: avatar || null,
        },
      })
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'No account found. Please register first.' })
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role })
    const refreshToken = generateRefreshToken({ userId: user.id })
    const { password: _, ...userWithoutPassword } = user

    res.json({ success: true, data: { token, refreshToken, user: userWithoutPassword } })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
      
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' })
    }

    let isValidPassword = false
    
    if (user.password.startsWith('$2a$')) {
      isValidPassword = await bcrypt.compare(password, user.password)
    } else {
      isValidPassword = password === user.password
      if (isValidPassword) {
        const hashedPassword = await bcrypt.hash(password, 10)
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        })
      }
    }
    
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid password' })
    }

    if (user.isBlocked) {
      return res.status(401).json({ success: false, error: 'Account is blocked' })
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role })
    const refreshToken = generateRefreshToken({ userId: user.id })

    const { password: _, ...userWithoutPassword } = user
    return res.json({ success: true, data: { token, refreshToken, user: userWithoutPassword } })
  } catch (error: any) {
    console.error('Login error:', error)
    res.status(401).json({ success: false, error: error.message || 'Login failed' })
  }
})

// Send OTP to registered phone number
router.post('/otp/send', authLimiter, async (req, res) => {
  try {
    const { phone } = req.body
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number required' })
    }

    const user = await prisma.user.findFirst({ where: { phone } })
    if (!user) {
      return res.status(404).json({ success: false, error: 'No account found with this phone number. Please register first.' })
    }

    if (user.isBlocked) {
      return res.status(401).json({ success: false, error: 'Account is blocked' })
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpires },
    })

    // Send OTP via Twilio SMS
    try {
      const twilio = await import('twilio')
      const client = twilio.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      await client.messages.create({
        body: `Your OpenMart OTP is: ${otpCode}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone.startsWith('+') ? phone : `+91${phone}`,
      })
      console.log(`OTP sent to ${phone}`)
    } catch (smsError: any) {
      console.warn('Failed to send SMS (OTP still valid):', smsError.message)
      // In development, log OTP to console
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] OTP for ${phone}: ${otpCode}`)
      }
    }

    res.json({ success: true, message: 'OTP sent to your phone' })
  } catch (error: any) {
    console.error('OTP send error:', error)
    res.status(500).json({ success: false, error: error.message || 'Failed to send OTP' })
  }
})

// Verify OTP and login
router.post('/otp/verify', authLimiter, async (req, res) => {
  try {
    const { phone, otp } = req.body
    if (!phone || !otp) {
      return res.status(400).json({ success: false, error: 'Phone and OTP required' })
    }

    const user = await prisma.user.findFirst({
      where: { phone, otpCode: otp, otpExpires: { gt: new Date() } },
    })

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' })
    }

    // Clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: null, otpExpires: null, lastLoginAt: new Date() },
    })

    const token = generateToken({ userId: user.id, email: user.email, role: user.role })
    const refreshToken = generateRefreshToken({ userId: user.id })

    // Save refresh token
    try {
      await prisma.refreshToken.create({
        data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      })
    } catch { /* best-effort */ }

    const { password: _, ...userWithoutPassword } = user
    res.json({ success: true, data: { token, refreshToken, user: userWithoutPassword } })
  } catch (error: any) {
    console.error('OTP verify error:', error)
    res.status(500).json({ success: false, error: error.message || 'OTP verification failed' })
  }
})

router.post('/admin/register-user', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Access denied' })
  }

  const { name, phone, email, role, password } = req.body

  if (!name || !role) {
    return res.status(400).json({ success: false, error: 'Name and role required' })
  }

  if (!['ADMIN', 'SHOP_OWNER', 'DELIVERY_BOY'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Invalid role' })
  }

  if (phone) {
    const existing = await prisma.user.findFirst({ where: { phone } })
    if (existing) {
      return res.status(400).json({ success: false, error: 'Phone already registered' })
    }
  }

  const tempPassword = password || `temp_${Date.now()}`
  const hashedPassword = await bcrypt.hash(tempPassword, 10)

  const newUser = await prisma.user.create({
    data: {
      name,
      phone: phone || '',
      email: email || '',
      password: hashedPassword,
      role,
      isVerified: true,
    },
    select: { id: true, name: true, email: true, phone: true, role: true, isVerified: true, createdAt: true },
  })

  res.status(201).json({ success: true, data: newUser, message: `${role} registered successfully. Password: ${tempPassword}` })
})

router.get('/admin/users', authenticate, async (req: AuthRequest, res) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Access denied' })
  }

  const users = await prisma.user.findMany({
    select: { id: true, email: true, phone: true, name: true, role: true, isVerified: true, isBlocked: true, createdAt: true },
  })
  res.json({ success: true, data: users })
})

router.put('/admin/users/:id/block', authenticate, async (req: AuthRequest, res) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Access denied' })
  }

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

router.get('/admin/users/:id/addresses', authenticate, async (req: AuthRequest, res) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Access denied' })
  }

  const userAddresses = await prisma.address.findMany({ where: { userId: req.params.id } })
  res.json({ success: true, data: userAddresses })
})

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user?.userId } })
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }
  const { password: _, ...userWithoutPassword } = user
  res.json({ success: true, data: userWithoutPassword })
})

router.post('/logout', authenticate, async (req: AuthRequest, res) => {
  // Invalidate all refresh tokens for this user
  await prisma.refreshToken.updateMany({
    where: { userId: req.user?.userId, revoked: false },
    data: { revoked: true },
  })
  res.json({ success: true, message: 'Logged out successfully' })
})

// Refresh access token using refresh token
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) {
    return res.status(400).json({ success: false, error: 'Refresh token is required' })
  }

  try {
    const jwt = await import('jsonwebtoken')
    const JWT_SECRET = process.env.JWT_SECRET
    if (!JWT_SECRET) throw new Error('JWT_SECRET not set')
    const decoded = jwt.verify(refreshToken, JWT_SECRET + '-refresh') as { userId: string }

    const token = await prisma.refreshToken.findFirst({
      where: { token: refreshToken, revoked: false, expiresAt: { gt: new Date() } },
    })
    if (!token) {
      return res.status(401).json({ success: false, error: 'Invalid or expired refresh token' })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    })
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' })
    }

    const newAccessToken = generateToken({ userId: user.id, email: user.email, role: user.role })
    const newRefreshToken = generateRefreshToken({ userId: user.id })

    await prisma.refreshToken.update({
      where: { id: token.id },
      data: { revoked: true },
    })
    await prisma.refreshToken.create({
      data: { userId: user.id, token: newRefreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    })

    res.json({ success: true, data: { token: newAccessToken, refreshToken: newRefreshToken } })
  } catch {
    res.status(401).json({ success: false, error: 'Invalid refresh token' })
  }
})

// Forgot password - generate reset token
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    // Don't reveal if user exists
    return res.json({ success: true, message: 'If the email exists, a reset link has been sent' })
  }

  const crypto = await import('crypto')
  const resetToken = crypto.randomBytes(32).toString('hex')
  const resetExpires = new Date(Date.now() + 3600000) // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: resetToken, passwordResetExpires: resetExpires },
  })

  // In production, send email with reset link: ${CLIENT_URL}/reset-password?token=${resetToken}
  res.json({ success: true, message: 'If the email exists, a reset link has been sent' })
})

// Reset password - use reset token
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body
  if (!token || !password) {
    return res.status(400).json({ success: false, error: 'Token and password are required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' })
  }

  const user = await prisma.user.findFirst({
    where: { passwordResetToken: token, passwordResetExpires: { gt: new Date() } },
  })
  if (!user) {
    return res.status(400).json({ success: false, error: 'Invalid or expired reset token' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, passwordResetToken: null, passwordResetExpires: null },
  })

  res.json({ success: true, message: 'Password reset successfully' })
})

// Verify email
router.post('/verify-email', async (req, res) => {
  const { token } = req.body
  if (!token) {
    return res.status(400).json({ success: false, error: 'Token is required' })
  }

  const user = await prisma.user.findFirst({
    where: { otpCode: token, otpExpires: { gt: new Date() } },
  })
  if (!user) {
    return res.status(400).json({ success: false, error: 'Invalid or expired verification token' })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, otpCode: null, otpExpires: null },
  })

  res.json({ success: true, message: 'Email verified successfully' })
})

// Resend verification email
router.post('/resend-verification', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user?.userId } })
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }
  if (user.isVerified) {
    return res.status(400).json({ success: false, error: 'Email already verified' })
  }

  const crypto = await import('crypto')
  const otpCode = crypto.randomInt(100000, 999999).toString()
  const otpExpires = new Date(Date.now() + 600000) // 10 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode, otpExpires },
  })

  res.json({ success: true, message: 'Verification code sent' })
})

router.put('/me', authenticate, async (req: AuthRequest, res) => {
  const { name, email, phone, avatar } = req.body

  const updateData: any = {}
  if (name) updateData.name = name
  if (email) updateData.email = email
  if (phone) updateData.phone = phone
  if (avatar !== undefined) updateData.avatar = avatar

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ success: false, error: 'At least one field is required' })
  }

  const updated = await prisma.user.update({
    where: { id: req.user?.userId },
    data: updateData,
    select: { id: true, name: true, email: true, phone: true, avatar: true, role: true, isVerified: true, isBlocked: true, createdAt: true, updatedAt: true },
  })
  
  res.json({ success: true, data: updated })
})

// Send OTP for login
router.post('/otp/send', async (req, res) => {
  const { phone } = req.body
  if (!phone) {
    return res.status(400).json({ success: false, error: 'Phone number is required' })
  }

  const user = await prisma.user.findFirst({ where: { phone } })
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' })
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
  const otpExpires = new Date(Date.now() + 600000) // 10 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode, otpExpires },
  })

  // In production: send OTP via SMS/WhatsApp
  console.log(`[OTP] ${phone} -> ${otpCode}`)

  res.json({ success: true, message: 'OTP sent' })
})

// Verify OTP for login
router.post('/otp/verify', async (req, res) => {
  const { phone, otp } = req.body
  if (!phone || !otp) {
    return res.status(400).json({ success: false, error: 'Phone and OTP are required' })
  }

  const user = await prisma.user.findFirst({
    where: { phone, otpCode: otp, otpExpires: { gt: new Date() } },
  })
  if (!user) {
    return res.status(400).json({ success: false, error: 'Invalid or expired OTP' })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: null, otpExpires: null, lastLoginAt: new Date() },
  })

  const token = generateToken({ userId: user.id, email: user.email, role: user.role })
  const refreshToken = generateRefreshToken({ userId: user.id })

  await prisma.refreshToken.create({
    data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  })

  const { password: _, ...userWithoutPassword } = user
  res.json({ success: true, data: { token, refreshToken, user: userWithoutPassword } })
})

export const authRouter = router
