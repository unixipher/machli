import { drizzle } from '../drizzle/index.js';
import { driverManager, hubManager } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

const error = (err, res, status = 500) => {
    res.status(status).json({
        success: false,
        error: err,
    });
};

const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
};

const authenticateIntermediateHubManager = async (req, res, next) => {
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
        const [manager] = await drizzle
            .select()
            .from(hubManager)
            .where(eq(hubManager.token, token))
            .limit(1);
        if (!manager) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid token'
            });
        }
        if (manager.hubmanagerCategory !== 'intermediate') {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Access restricted to intermediate hub managers'
            });
        }
        req.manager = manager;
        next();
    } catch (err) {
        error(err, res);
    }
};
const authenticateMainHubManager = async (req, res, next) => {
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
        const [manager] = await drizzle
            .select()
            .from(hubManager)
            .where(eq(hubManager.token, token))
            .limit(1);
        if (!manager) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid token'
            });
        }
        if (manager.hubmanagerCategory !== 'main') {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Access restricted to main hub managers'
            });
        }
        req.manager = manager;
        next();
    } catch (err) {
        error(err, res);
    }
};

const authenticateIntermediateDriverManager = async (req, res, next) => {
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
        const [driver] = await drizzle
            .select()
            .from(driverManager)
            .where(eq(driverManager.token, token))
            .limit(1);
        if (!driver) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid token'
            });
        }
        if (driver.category !== 'intermediate') {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Access restricted to intermediate driver managers'
            });
        }
        req.driver = driver;
        next();
    } catch (err) {
        error(err, res);
    }
};
const authenticateMainDriverManager = async (req, res, next) => {
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
        const [driver] = await drizzle
            .select()
            .from(driverManager)
            .where(eq(driverManager.token, token))
            .limit(1);
        if (!driver) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid token'
            });
        }
        if (driver.category !== 'main') {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Access restricted to main driver managers'
            });
        }
        req.driver = driver;
        next();
    } catch (err) {
        error(err, res);
    }
};

export {
    error,
    notFound,
    authenticateIntermediateHubManager,
    authenticateMainHubManager,
    authenticateIntermediateDriverManager,
    authenticateMainDriverManager
};