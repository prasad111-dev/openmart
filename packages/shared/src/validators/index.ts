import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  password: z.string().min(8).max(100),
  role: z.enum(['CUSTOMER', 'SHOP_OWNER', 'DELIVERY_BOY']).default('CUSTOMER'),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const shopSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  address: z.string().min(5),
  pincode: z.string().min(6),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  category: z.string().default('General'),
})

export const productSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  price: z.number().positive(),
  category: z.string().min(1),
  stock: z.number().int().min(0),
  imageUrl: z.string().url().optional(),
})

export const orderSchema = z.object({
  deliveryAddressId: z.string().uuid(),
  specialInstructions: z.string().max(500).optional(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().min(1),
    }),
  ),
})

export const addressSchema = z.object({
  label: z.string().min(1).max(50),
  street: z.string().min(5),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(6),
  isDefault: z.boolean().default(false),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})
