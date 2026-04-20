import jwt from 'jsonwebtoken';
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is required');
    }
    return secret;
};
export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    try {
        const decoded = jwt.verify(token, getJwtSecret());
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }
        next();
    };
};
export const generateToken = (payload) => {
    return jwt.sign(payload, getJwtSecret(), { expiresIn: '15m' });
};
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, getJwtSecret() + '-refresh', { expiresIn: '7d' });
};
