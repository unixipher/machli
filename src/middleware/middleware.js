import { prisma } from '../helper/prisma.js';

const error = (err, res) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
};

const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
};

const authenticateManager = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'No token provided'
            });
        }
        const token = authHeader.substring(7);
        const manager = await prisma.manager.findUnique({
            where: { token }
        });
        if (!manager) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid token'
            });
        }
        req.manager = manager;
        next();
    } catch (err) {
        error(err, res);
    }
};

const authenticateDriver = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'No token provided'
            });
        }
        const token = authHeader.substring(7);
        const driver = await prisma.driver.findUnique({
            where: { token }
        });
        if (!driver) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid token'
            });
        }
        req.driver = driver;
        next();
    } catch (err) {
        error(err, res);
    }
};

const authenticateShopOwner = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'No token provided'
            });
        }
        const token = authHeader.substring(7);
        const shopOwner = await prisma.shopOwner.findUnique({
            where: { token }
        });
        if (!shopOwner) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid token'
            });
        }
        req.shopOwner = shopOwner;
        next();
    } catch (err) {
        error(err, res);
    }
};


export {
    error,
    notFound,
    authenticateManager,
    authenticateDriver,
    authenticateShopOwner
};