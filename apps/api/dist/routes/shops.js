import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import prisma from '../lib/db.js';
const router = Router();
router.get('/', async (req, res) => {
    const { pincode, category, search } = req.query;
    const searchStr = search ? String(search).toLowerCase() : null;
    const categoryStr = category && category !== 'All' ? String(category).toLowerCase() : null;
    let shops = await prisma.shop.findMany({
        where: { isApproved: true }
    });
    if (pincode) {
        shops = shops.filter((s) => s.pincode === String(pincode));
    }
    if (categoryStr) {
        shops = shops.filter((s) => s.category.toLowerCase() === categoryStr);
    }
    if (searchStr) {
        shops = shops.filter((s) => s.name.toLowerCase().includes(searchStr) ||
            (s.description && s.description.toLowerCase().includes(searchStr)));
    }
    const defaultImages = {
        'Grocery': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop',
        'Dairy': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
        'Fruits': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
        'Vegetables': 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop',
        'Bakery': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop',
    };
    const shopsWithImages = shops.map((shop) => ({
        ...shop,
        imageUrl: shop.imageUrl || defaultImages[shop.category] || defaultImages['Grocery'],
    }));
    res.json({ success: true, data: shopsWithImages });
});
router.get('/categories', async (_req, res) => {
    const categories = await prisma.category.findMany({
        where: { isActive: true, type: 'SHOP' },
        orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: categories.map((c) => c.name) });
});
router.get('/:id', async (req, res) => {
    const shop = await prisma.shop.findUnique({ where: { id: req.params.id } });
    if (!shop) {
        return res.status(404).json({ success: false, error: 'Shop not found' });
    }
    res.json({ success: true, data: shop });
});
router.post('/', authenticate, authorize('SHOP_OWNER'), async (req, res) => {
    const { deliveryRadius, ...rest } = req.body;
    const shopData = {
        ownerId: req.user?.userId || '',
        ...rest,
        isApproved: false,
        isOpen: false,
    };
    if (deliveryRadius) {
        shopData.deliveryRadius = parseInt(deliveryRadius) || deliveryRadius;
    }
    const newShop = await prisma.shop.create({
        data: shopData,
    });
    res.status(201).json({ success: true, data: newShop });
});
router.put('/:id', authenticate, async (req, res) => {
    const shop = await prisma.shop.findUnique({ where: { id: req.params.id } });
    if (!shop) {
        return res.status(404).json({ success: false, error: 'Shop not found' });
    }
    if (shop.ownerId !== req.user?.userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    // Whitelist allowed fields — prevent escalation
    const { name, description, address, pincode, phone, email, category, isOpen, deliveryRadius } = req.body;
    const updateData = {};
    if (name)
        updateData.name = name;
    if (description !== undefined)
        updateData.description = description;
    if (address)
        updateData.address = address;
    if (pincode)
        updateData.pincode = pincode;
    if (phone)
        updateData.phone = phone;
    if (email !== undefined)
        updateData.email = email;
    if (category)
        updateData.category = category;
    if (isOpen !== undefined)
        updateData.isOpen = isOpen;
    if (deliveryRadius !== undefined)
        updateData.deliveryRadius = parseInt(deliveryRadius) || deliveryRadius;
    const updated = await prisma.shop.update({
        where: { id: req.params.id },
        data: updateData,
    });
    res.json({ success: true, data: updated });
});
router.get('/:id/products', async (req, res) => {
    const products = await prisma.product.findMany({
        where: { shopId: req.params.id, isActive: true },
    });
    res.json({ success: true, data: products });
});
router.post('/:id/products', authenticate, authorize('SHOP_OWNER'), async (req, res) => {
    const shop = await prisma.shop.findUnique({ where: { id: req.params.id } });
    if (!shop) {
        return res.status(404).json({ success: false, error: 'Shop not found' });
    }
    if (shop.ownerId !== req.user?.userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    const newProduct = await prisma.product.create({
        data: {
            shopId: req.params.id,
            ...req.body,
            isActive: true,
        },
    });
    res.status(201).json({ success: true, data: newProduct });
});
router.put('/:id/products/:productId', authenticate, authorize('SHOP_OWNER'), async (req, res) => {
    const product = await prisma.product.findFirst({
        where: { id: req.params.productId, shopId: req.params.id },
    });
    if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
    }
    const shop = await prisma.shop.findUnique({ where: { id: req.params.id } });
    if (shop?.ownerId !== req.user?.userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    const updated = await prisma.product.update({
        where: { id: req.params.productId },
        data: req.body,
    });
    res.json({ success: true, data: updated });
});
router.delete('/:id/products/:productId', authenticate, authorize('SHOP_OWNER'), async (req, res) => {
    const product = await prisma.product.findFirst({
        where: { id: req.params.productId, shopId: req.params.id },
    });
    if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
    }
    const shop = await prisma.shop.findUnique({ where: { id: req.params.id } });
    if (shop?.ownerId !== req.user?.userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    await prisma.product.delete({ where: { id: req.params.productId } });
    res.json({ success: true, message: 'Product deleted' });
});
router.get('/:id/orders', authenticate, authorize('SHOP_OWNER', 'ADMIN'), async (req, res) => {
    const shop = await prisma.shop.findUnique({ where: { id: req.params.id } });
    if (!shop) {
        return res.status(404).json({ success: false, error: 'Shop not found' });
    }
    if (shop.ownerId !== req.user?.userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    const orders = await prisma.order.findMany({
        where: { shopId: req.params.id },
        include: {
            customer: { select: { name: true, phone: true } },
            deliveryAddress: true,
            deliveryBoy: { select: { name: true, phone: true } },
            items: {
                include: { product: { select: { name: true } } },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    const formatted = orders.map((order) => ({
        id: order.id,
        customerId: order.customerId,
        customerName: order.customer.name,
        customerPhone: order.customer.phone,
        shopId: order.shopId,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        deliveryAddress: order.deliveryAddress.street,
        createdAt: order.createdAt,
        deliveryBoyId: order.deliveryBoyId,
        deliveryBoyName: order.deliveryBoy?.name,
        deliveryBoyPhone: order.deliveryBoy?.phone,
        items: order.items.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: Number(item.price),
        })),
    }));
    res.json({ success: true, data: formatted });
});
router.put('/:id/toggle-open', authenticate, authorize('SHOP_OWNER'), async (req, res) => {
    const shop = await prisma.shop.findUnique({ where: { id: req.params.id } });
    if (!shop) {
        return res.status(404).json({ success: false, error: 'Shop not found' });
    }
    if (shop.ownerId !== req.user?.userId) {
        return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    const updated = await prisma.shop.update({
        where: { id: req.params.id },
        data: { isOpen: !shop.isOpen },
    });
    res.json({ success: true, data: updated });
});
router.put('/:id/approve', authenticate, authorize('ADMIN'), async (req, res) => {
    const shop = await prisma.shop.findUnique({ where: { id: req.params.id } });
    if (!shop) {
        return res.status(404).json({ success: false, error: 'Shop not found' });
    }
    const updated = await prisma.shop.update({
        where: { id: req.params.id },
        data: { isApproved: true },
    });
    res.json({ success: true, data: updated });
});
// Get delivery boys available for this shop (shop owner only)
router.get('/:id/delivery-boys', authenticate, async (req, res) => {
    const shop = await prisma.shop.findUnique({ where: { id: req.params.id } });
    if (!shop) {
        return res.status(404).json({ success: false, error: 'Shop not found' });
    }
    if (shop.ownerId !== req.user?.userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    const deliveryBoys = await prisma.user.findMany({
        where: { role: 'DELIVERY_BOY', isBlocked: false, isVerified: true },
        select: { id: true, name: true, phone: true },
        orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: deliveryBoys });
});
export const shopRouter = router;
