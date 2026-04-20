import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import prisma from '../lib/db.js';
const router = Router();
router.get('/', authenticate, async (req, res) => {
    const userId = req.user?.userId;
    const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: { select: { id: true, name: true, price: true, shopId: true } } },
    });
    // Collect unique shop IDs
    const shopIds = [...new Set(cartItems.map((item) => item.product?.shopId).filter((id) => id !== null && id !== undefined))];
    // Fetch all shops in a single query
    const shops = await prisma.shop.findMany({
        where: { id: { in: shopIds } },
        select: { id: true, name: true, isOpen: true, category: true },
    });
    const shopMap = Object.fromEntries(shops.map((s) => [s.id, s]));
    // Group by shop
    const byShop = {};
    for (const item of cartItems) {
        const shopId = item.product?.shopId || 'unknown';
        if (!byShop[shopId]) {
            const shop = shopMap[shopId];
            byShop[shopId] = {
                shopId,
                shopName: shop?.name || 'Unknown Shop',
                shopCategory: shop?.category || 'General',
                shopIsOpen: shop?.isOpen ?? true,
                items: [],
                total: 0
            };
        }
        byShop[shopId].items.push({
            productId: item.productId,
            quantity: item.quantity,
            price: Number(item.price),
            name: item.product?.name,
        });
        byShop[shopId].total += Number(item.price) * item.quantity;
    }
    res.json({ success: true, data: Object.values(byShop) });
});
router.post('/add', authenticate, async (req, res) => {
    const { shopId: _shopId, productId, quantity } = req.body;
    const userId = req.user?.userId;
    // Fetch price from DB — never trust client price
    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { price: true, shopId: true, name: true, stock: true },
    });
    if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
    }
    if (product.stock < quantity) {
        return res.status(400).json({ success: false, error: 'Insufficient stock' });
    }
    const existing = await prisma.cartItem.findFirst({
        where: { userId, productId },
    });
    if (existing) {
        await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + quantity, price: product.price },
        });
    }
    else {
        await prisma.cartItem.create({
            data: { userId, productId, quantity, price: product.price },
        });
    }
    res.json({ success: true, message: 'Added to cart' });
});
router.put('/update', authenticate, async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user?.userId;
    if (quantity <= 0) {
        await prisma.cartItem.deleteMany({
            where: { userId, productId },
        });
    }
    else {
        await prisma.cartItem.updateMany({
            where: { userId, productId },
            data: { quantity },
        });
    }
    res.json({ success: true, message: 'Updated' });
});
router.delete('/remove', authenticate, async (req, res) => {
    const { productId } = req.query;
    const userId = req.user?.userId;
    await prisma.cartItem.deleteMany({
        where: { userId, productId: productId },
    });
    res.json({ success: true, message: 'Removed' });
});
router.delete('/clear', authenticate, async (req, res) => {
    const userId = req.user?.userId;
    await prisma.cartItem.deleteMany({ where: { userId } });
    res.json({ success: true, message: 'Cart cleared' });
});
// Validate cart items (check stock, prices, availability)
router.post('/validate', authenticate, async (req, res) => {
    const userId = req.user?.userId;
    const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: { select: { id: true, name: true, price: true, stock: true, isActive: true } } },
    });
    const issues = [];
    for (const item of cartItems) {
        if (!item.product) {
            issues.push({ productId: item.productId, name: 'Unknown', issue: 'Product not found' });
        }
        else if (!item.product.isActive) {
            issues.push({ productId: item.productId, name: item.product.name, issue: 'Product no longer available' });
        }
        else if (item.product.stock < item.quantity) {
            issues.push({ productId: item.productId, name: item.product.name, issue: `Only ${item.product.stock} in stock` });
        }
        else if (Number(item.product.price) !== Number(item.price)) {
            issues.push({ productId: item.productId, name: item.product.name, issue: 'Price has changed' });
            // Update cart item price
            await prisma.cartItem.update({
                where: { id: item.id },
                data: { price: item.product.price },
            });
        }
    }
    res.json({
        success: true,
        data: {
            valid: issues.length === 0,
            issues,
            itemCount: cartItems.length,
        },
    });
});
export const cartRouter = router;
