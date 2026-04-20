import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import prisma from '../lib/db.js';
const router = Router();
router.get('/', authenticate, async (req, res) => {
    const addresses = await prisma.address.findMany({
        where: { userId: req.user?.userId },
        orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: addresses });
});
router.post('/', authenticate, async (req, res) => {
    const { label, street, city, state, pincode, isDefault } = req.body;
    if (isDefault) {
        await prisma.address.updateMany({
            where: { userId: req.user?.userId },
            data: { isDefault: false },
        });
    }
    const newAddress = await prisma.address.create({
        data: {
            userId: req.user?.userId || '',
            label,
            street,
            city,
            state,
            pincode,
            isDefault: isDefault || false,
        },
    });
    res.status(201).json({ success: true, data: newAddress });
});
router.put('/:id', authenticate, async (req, res) => {
    const address = await prisma.address.findFirst({
        where: { id: req.params.id, userId: req.user?.userId },
    });
    if (!address) {
        return res.status(404).json({ success: false, error: 'Address not found' });
    }
    const { isDefault, ...rest } = req.body;
    if (isDefault) {
        await prisma.address.updateMany({
            where: { userId: req.user?.userId },
            data: { isDefault: false },
        });
    }
    const updated = await prisma.address.update({
        where: { id: req.params.id },
        data: { ...rest, isDefault: isDefault ?? address.isDefault },
    });
    res.json({ success: true, data: updated });
});
router.delete('/:id', authenticate, async (req, res) => {
    const address = await prisma.address.findFirst({
        where: { id: req.params.id, userId: req.user?.userId },
    });
    if (!address) {
        return res.status(404).json({ success: false, error: 'Address not found' });
    }
    await prisma.address.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Address deleted' });
});
export const addressRouter = router;
