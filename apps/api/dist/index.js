import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRouter } from './routes/auth.js';
import { shopRouter } from './routes/shops.js';
import { productRouter } from './routes/products.js';
import { cartRouter } from './routes/cart.js';
import { orderRouter } from './routes/orders.js';
import { addressRouter } from './routes/addresses.js';
import { deliveryRouter } from './routes/delivery.js';
import { adminRouter } from './routes/admin.js';
import { categoryRouter } from './routes/categories.js';
import { wishlistRouter } from './routes/wishlist.js';
import { reviewRouter } from './routes/reviews.js';
import { notificationRouter } from './routes/notifications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet({
    hsts: false,
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));

app.use(cors({
    origin: process.env.CLIENT_URL
        ? process.env.CLIENT_URL.split(',')
        : [],
    credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/shops', shopRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/addresses', addressRouter);
app.use('/api/delivery', deliveryRouter);
app.use('/api/admin', adminRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/notifications', notificationRouter);

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend static files only in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../web/dist')));
    app.get('*', (_req, res) => {
        res.sendFile(path.join(__dirname, '../../web/dist/index.html'));
    });
}

// Global error handler (must be last)
app.use((err, _req, res, _next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
});

// ✅ ONLY run locally - NOT on Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    });
}

export default app;
