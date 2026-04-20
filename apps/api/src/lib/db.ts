import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default prisma

export async function seedDatabase() {
  try {
    const adminExists = await prisma.user.findUnique({ where: { email: 'admin@openmart.com' } })
    if (adminExists) return
  } catch {
    console.log('⚠️  Database not ready — skipping seed. Run `prisma db push` first.')
    return
  }

  const bcrypt = await import('bcryptjs')
  const hashedPassword = await bcrypt.default.hash('admin123', 10)

  await prisma.user.create({
    data: {
      email: 'admin@openmart.com',
      phone: '+917709889898',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      isVerified: true,
    },
  })

  const customer = await prisma.user.create({
    data: {
      email: 'demo@openmart.com',
      phone: '+919876543210',
      password: hashedPassword,
      name: 'Demo User',
      role: 'CUSTOMER',
      isVerified: true,
    },
  })

  await prisma.address.create({
    data: {
      userId: customer.id,
      label: 'Home',
      street: '123 Main Road, Sindhi Railway',
      city: 'Sindhi Railway',
      state: 'Maharashtra',
      pincode: '442105',
      isDefault: true,
    },
  })

  const productCategories = ['Grocery', 'Dairy', 'Fruits', 'Vegetables', 'Bakery', 'Beverages', 'Personal Care', 'Household', 'Snacks', 'Frozen Foods', 'Meat & Fish', 'Medicines']
  const shopCategories = ['Grocery', 'Dairy', 'Fruits & Vegetables', 'Bakery', 'General Store', 'Pharmacy', 'Meat Shop', 'Fish Shop', 'Pet Shop', 'Electronics']

  for (const name of productCategories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, type: 'PRODUCT', description: name }
    })
  }

  for (const name of shopCategories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, type: 'SHOP', description: name }
    })
  }

  console.log('Database seeded successfully!')
  console.log('Admin login: admin@openmart.com / admin123')
  console.log('Customer: demo@openmart.com / admin123')
}
