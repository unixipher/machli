import { drizzle } from '../drizzle/index.js';
import { hubManager, driverManager } from '../drizzle/schema.js';
import { error } from '../middleware/middleware.js';

export const createHubManager = async (req, res) => {
    const { name, email, phone, token, hubmanagerCategory, mainHubManagerId, address, geoLat, geoLng } = req.body;
    if (!name || !email || !phone || !token || !hubmanagerCategory || !address || !geoLat || !geoLng) {
        return error('name, email, phone, token, hubmanagerCategory, address, geoLat, and geoLng are required', res, 400);
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
                address,
                geoLat,
                geoLng,
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
    const { name, email, phone, token, category, address, geoLat, geoLng } = req.body;
    if (!name || !email || !phone || !token || !category || !address || !geoLat || !geoLng) {
        return error('name, email, phone, token, category, address, geoLat, and geoLng are required', res, 400);
    }
    try {
        const [newDriverManager] = await drizzle
            .insert(driverManager)
            .values({
                name,
                email,
                phone,
                token,
                address,
                geoLat,
                geoLng,
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