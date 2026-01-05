import { drizzle } from '../drizzle/index.js';
import { hubManager, driverManager } from '../drizzle/schema.js';
import { error } from '../middleware/middleware.js';

export const createHubManager = async (req, res) => {
    const { name, email, phone, token, hubmanagerCategory, mainHubManagerId } = req.body;
    if (!name || !email || !phone || !token || !hubmanagerCategory) {
        return error('name, email, phone, token, and hubmanagerCategory are required', res, 400);
    }
    if (hubmanagerCategory === 'intermediate' && !mainHubManagerId) {
        return error('mainHubManagerId is required for intermediate hub managers', res, 400);
    }
    if (hubmanagerCategory === 'main' && mainHubManagerId) {
        return error('mainHubManagerId should not be provided for main hub managers', res, 400);
    }
    try {
        const [newHubManager] = await drizzle
            .insert(hubManager)
            .values({
                name,
                email,
                phone,
                token,
                hubmanagerCategory,
                mainHubManagerId: mainHubManagerId || null
            })
            .returning();

        res.status(201).json({
            success: true,
            data: newHubManager
        });
    } catch (err) {
        error(err.message, res);
    }
}

export const createDriverManager = async (req, res) => {
    const { name, email, phone, token, category } = req.body;
    if (!name || !email || !phone || !token || !category) {
        return error('name, email, phone, token, and category are required', res, 400);
    }
    try {
        const [newDriverManager] = await drizzle
            .insert(driverManager)
            .values({
                name,
                email,
                phone,
                token,
                category,
                status: 'available'
            })
            .returning();

        res.status(201).json({
            success: true,
            data: newDriverManager
        });
    } catch (err) {
        error(err.message, res);
    }
}