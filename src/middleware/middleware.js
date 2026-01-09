import prisma from '../lib/prisma.js';

const error = (err, res, status = 500) => {
    console.error('[error] Sending error response:', { error: err, status });
    res.status(status).json({
        success: false,
        error: err,
    });
};

const notFound = (req, res) => {
    console.log('[notFound] Endpoint not found:', { method: req.method, url: req.originalUrl });
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
};

const authenticateIntermediateHubManager = async (req, res, next) => {
    console.log('[authenticateIntermediateHubManager] Authentication attempt');
    try {
        const authHeader = req.headers.authorization;
        console.log('[authenticateIntermediateHubManager] Auth header present:', !!authHeader);
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[authenticateIntermediateHubManager] No token provided');
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'No token provided'
            });
        }
        const token = authHeader.substring(7);
        console.log('[authenticateIntermediateHubManager] Fetching manager with token');
        const manager = await prisma.hubManager.findUnique({
            where: { token }
        });
        console.log('[authenticateIntermediateHubManager] Manager found:', !!manager, 'Category:', manager?.hubmanagerCategory);
        if (!manager) {
            console.log('[authenticateIntermediateHubManager] Invalid token');
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid token'
            });
        }
        if (manager.hubmanagerCategory !== 'intermediate') {
            console.log('[authenticateIntermediateHubManager] Not intermediate category:', manager.hubmanagerCategory);
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Access restricted to intermediate hub managers'
            });
        }
        console.log('[authenticateIntermediateHubManager] Authentication successful, manager ID:', manager.id);
        req.manager = manager;
        next();
    } catch (err) {
        console.error('[authenticateIntermediateHubManager] Error:', err.message, err.stack);
        error(err, res);
    }
};
const authenticateMainHubManager = async (req, res, next) => {
    console.log('[authenticateMainHubManager] Authentication attempt');
    try {
        const authHeader = req.headers.authorization;
        console.log('[authenticateMainHubManager] Auth header present:', !!authHeader);
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[authenticateMainHubManager] No token provided');
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'No token provided'
            });
        }
        const token = authHeader.substring(7);
        console.log('[authenticateMainHubManager] Fetching manager with token');
        const manager = await prisma.hubManager.findUnique({
            where: { token }
        });
        console.log('[authenticateMainHubManager] Manager found:', !!manager, 'Category:', manager?.hubmanagerCategory);
        if (!manager) {
            console.log('[authenticateMainHubManager] Invalid token');
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid token'
            });
        }
        if (manager.hubmanagerCategory !== 'main') {
            console.log('[authenticateMainHubManager] Not main category:', manager.hubmanagerCategory);
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Access restricted to main hub managers'
            });
        }
        console.log('[authenticateMainHubManager] Authentication successful, manager ID:', manager.id);
        req.manager = manager;
        next();
    } catch (err) {
        console.error('[authenticateMainHubManager] Error:', err.message, err.stack);
        error(err, res);
    }
};

const authenticateIntermediateDriverManager = async (req, res, next) => {
    console.log('[authenticateIntermediateDriverManager] Authentication attempt');
    try {
        const authHeader = req.headers.authorization;
        console.log('[authenticateIntermediateDriverManager] Auth header present:', !!authHeader);
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[authenticateIntermediateDriverManager] No token provided');
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'No token provided'
            });
        }
        const token = authHeader.substring(7);
        console.log('[authenticateIntermediateDriverManager] Fetching driver with token');
        const driver = await prisma.driverManager.findUnique({
            where: { token }
        });
        console.log('[authenticateIntermediateDriverManager] Driver found:', !!driver, 'Category:', driver?.category);
        if (!driver) {
            console.log('[authenticateIntermediateDriverManager] Invalid token');
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid token'
            });
        }
        if (driver.category !== 'intermediate') {
            console.log('[authenticateIntermediateDriverManager] Not intermediate category:', driver.category);
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Access restricted to intermediate driver managers'
            });
        }
        console.log('[authenticateIntermediateDriverManager] Authentication successful, driver ID:', driver.id);
        req.driver = driver;
        next();
    } catch (err) {
        console.error('[authenticateIntermediateDriverManager] Error:', err.message, err.stack);
        error(err, res);
    }
};
const authenticateMainDriverManager = async (req, res, next) => {
    console.log('[authenticateMainDriverManager] Authentication attempt');
    try {
        const authHeader = req.headers.authorization;
        console.log('[authenticateMainDriverManager] Auth header present:', !!authHeader);
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[authenticateMainDriverManager] No token provided');
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'No token provided'
            });
        }
        const token = authHeader.substring(7);
        console.log('[authenticateMainDriverManager] Fetching driver with token');
        const driver = await prisma.driverManager.findUnique({
            where: { token }
        });
        console.log('[authenticateMainDriverManager] Driver found:', !!driver, 'Category:', driver?.category);
        if (!driver) {
            console.log('[authenticateMainDriverManager] Invalid token');
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid token'
            });
        }
        if (driver.category !== 'main') {
            console.log('[authenticateMainDriverManager] Not main category:', driver.category);
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Access restricted to main driver managers'
            });
        }
        console.log('[authenticateMainDriverManager] Authentication successful, driver ID:', driver.id);
        req.driver = driver;
        next();
    } catch (err) {
        console.error('[authenticateMainDriverManager] Error:', err.message, err.stack);
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