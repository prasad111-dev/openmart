import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import prisma from '../lib/db.js';
import { z } from 'zod';
const router = Router();
router.get('/', async (req, res) => {
    const { type } = req.query;
    const where = { isActive: true };
    if (type)
        where.type = String(type);
    const categories = await prisma.category.findMany({ where, orderBy: { name: 'asc' } });
    res.json({ success: true, data: categories });
});
router.get('/all', async (_req, res) => {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data: categories });
});
router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        const schema = z.object({
            name: z.string().min(1, 'Name required'),
            description: z.string().optional(),
            imageUrl: z.string().optional(),
            type: z.enum(['PRODUCT', 'SHOP']).default('PRODUCT'),
        });
        const data = schema.parse(req.body);
        const existing = await prisma.category.findUnique({ where: { name: data.name } });
        if (existing) {
            return res.status(400).json({ success: false, error: 'Category already exists' });
        }
        const category = await prisma.category.create({ data });
        res.status(201).json({ success: true, data: category });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: error.errors[0].message });
        }
        res.status(400).json({ success: false, error: error.message });
    }
});
router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const schema = z.object({
            name: z.string().min(1).optional(),
            description: z.string().optional(),
            imageUrl: z.string().optional(),
            isActive: z.boolean().optional(),
        });
        const data = schema.parse(req.body);
        const category = await prisma.category.update({
            where: { id },
            data,
        });
        res.json({ success: true, data: category });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: error.errors[0].message });
        }
        res.status(400).json({ success: false, error: error.message });
    }
});
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.category.delete({ where: { id } });
        res.json({ success: true, message: 'Category deleted' });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
export const categoryRouter = router;
