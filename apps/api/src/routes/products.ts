import { Router } from 'express'
import prisma from '../lib/db.js'

const router = Router()

router.get('/', async (req, res) => {
  const { search, category, shopId, pincode } = req.query
  
  const searchStr = search ? String(search).toLowerCase() : null
  const categoryStr = category && category !== 'All' ? String(category).toLowerCase() : null
  
  let products = await prisma.product.findMany({ 
    where: { isActive: true },
    include: { shop: { select: { name: true, isOpen: true, pincode: true } } }
  })
  
  products = products.filter((p: any) => p.shop && p.shop.isOpen)
  
  if (shopId) {
    products = products.filter((p: any) => p.shopId === String(shopId))
  }
  
  if (categoryStr) {
    products = products.filter((p: any) => p.category.toLowerCase() === categoryStr)
  }
  
  if (searchStr) {
    products = products.filter((p: any) => 
      p.name.toLowerCase().includes(searchStr) ||
      (p.description && p.description.toLowerCase().includes(searchStr)) ||
      p.category.toLowerCase().includes(searchStr)
    )
  }
  
  if (pincode) {
    products = products.filter((p: any) => p.shop.pincode === String(pincode))
  }

  res.json({ success: true, data: products })
})

router.get('/categories', async (_req, res) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true, type: 'PRODUCT' },
    orderBy: { name: 'asc' },
  })
  res.json({ success: true, data: categories })
})

router.get('/:id', async (req, res) => {
  const product = await prisma.product.findUnique({ 
    where: { id: req.params.id },
    include: { shop: true }
  })
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' })
  }
  res.json({ success: true, data: product })
})

export const productRouter = router
