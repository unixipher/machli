import { drizzle } from '../drizzle/index.js';
import { shop, order, orderItem, hubManager, product, vehicle } from '../drizzle/schema.js';
import { error } from '../middleware/middleware.js';
import { eq, inArray, sql } from 'drizzle-orm';

export const createShop = async (req, res) => {
    try {
        const { name, phone, address, geoLat, geoLng } = req.body;

        if (!name || !phone || !address || !geoLat || !geoLng) {
            return error('name, phone, address, geoLat, and geoLng are required', res, 400);
        }

        const [newShop] = await drizzle
            .insert(shop)
            .values({
                name,
                phone,
                address,
                geoLat,
                geoLng
            })
            .returning();

        res.status(201).json({
            success: true,
            data: newShop
        });
    } catch (err) {
        error(err.message, res);
    }
}

export const createOrder = async (req, res) => {
    try {
        const hubManagerId = req.manager.id;
        const { shopId, items, metadata, deliveryDate } = req.body;

        if (!shopId || !items || !Array.isArray(items) || items.length === 0) {
            return error('shopId and items array are required', res, 400);
        }

        for (const item of items) {
            if (!item.productId || !item.quantity || item.quantity <= 0) {
                return error('Each item must have productId and valid quantity', res, 400);
            }
        }

        const [newOrder] = await drizzle
            .insert(order)
            .values({
                shopId,
                hubmanagerId: hubManagerId,
                metadata: metadata || null,
                deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
            })
            .returning();

        const orderItems = await drizzle
            .insert(orderItem)
            .values(
                items.map(item => ({
                    orderId: newOrder.id,
                    productId: item.productId,
                    quantity: item.quantity,
                }))
            )
            .returning();

        for (const item of items) {
            await drizzle
                .update(product)
                .set({
                    quantity: sql`${product.quantity} - ${item.quantity}`,
                    updatedAt: new Date(),
                })
                .where(eq(product.id, item.productId));
        }

        res.status(201).json({
            success: true,
            data: {
                ...newOrder,
                items: orderItems,
            },
        });
    } catch (err) {
        error(err.message, res);
    }
}

export const getOrdersForIntermediateHubManager = async (req, res) => {
    try {
        const manager = req.manager;
        let orders;

        if (manager.hubmanagerCategory === 'intermediate') {
            orders = await drizzle
                .select()
                .from(order)
                .where(eq(order.hubmanagerId, manager.id));
        } else {
            const intermediateManagers = await drizzle
                .select({ id: hubManager.id })
                .from(hubManager)
                .where(eq(hubManager.mainHubManagerId, manager.id));

            const intermediateManagerIds = intermediateManagers.map(m => m.id);

            if (intermediateManagerIds.length > 0) {
                orders = await drizzle
                    .select()
                    .from(order)
                    .where(inArray(order.hubmanagerId, intermediateManagerIds));
            } else {
                orders = [];
            }
        }

        res.status(200).json({
            success: true,
            data: orders,
        });
    } catch (err) {
        error(err.message, res);
    }
}

export const getOrdersForMainHubManager = async (req, res) => {
    try {
        const manager = req.manager;

        const intermediateManagers = await drizzle
            .select({
                id: hubManager.id,
                name: hubManager.name,
                email: hubManager.email,
                phone: hubManager.phone,
            })
            .from(hubManager)
            .where(eq(hubManager.mainHubManagerId, manager.id));

        if (intermediateManagers.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
            });
        }

        const result = await Promise.all(
            intermediateManagers.map(async (intermediateManager) => {
                const orders = await drizzle
                    .select()
                    .from(order)
                    .where(eq(order.hubmanagerId, intermediateManager.id));

                return {
                    intermediateManager: {
                        name: intermediateManager.name,
                        email: intermediateManager.email,
                        phone: intermediateManager.phone,
                    },
                    orders,
                };
            })
        );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (err) {
        error(err.message, res);
    }
}

export const updateOrderForIntermediateHubManager = async (req, res) => {
    try {
        const manager = req.manager;
        const { orderId, status, metadata } = req.body;

        if (!orderId) {
            return error('orderId is required', res, 400);
        }

        const [existingOrder] = await drizzle
            .select()
            .from(order)
            .where(eq(order.id, orderId))
            .limit(1);

        if (!existingOrder) {
            return error('Order not found', res, 404);
        }


        const updateData = {};
        if (status) updateData.status = status;
        if (metadata) updateData.metadata = metadata;
        updateData.updatedAt = new Date();

        const [updatedOrder] = await drizzle
            .update(order)
            .set(updateData)
            .where(eq(order.id, orderId))
            .returning();

        res.status(200).json({
            success: true,
            data: updatedOrder,
        });
    } catch (err) {
        error(err.message, res);
    }
}

export const updateOrderForMainHubManager = async (req, res) => {
    try {
        const manager = req.manager;
        const { orderId, status, metadata } = req.body;

        if (!orderId) {
            return error('orderId is required', res, 400);
        }

        const [existingOrder] = await drizzle
            .select()
            .from(order)
            .where(eq(order.id, orderId))
            .limit(1);

        if (!existingOrder) {
            return error('Order not found', res, 404);
        }

        const intermediateManagers = await drizzle
            .select({ id: hubManager.id })
            .from(hubManager)
            .where(eq(hubManager.mainHubManagerId, manager.id));

        const intermediateManagerIds = intermediateManagers.map(m => m.id);

        if (!intermediateManagerIds.includes(existingOrder.hubmanagerId)) {
            return error('You do not have permission to update this order', res, 403);
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (metadata) updateData.metadata = metadata;
        updateData.updatedAt = new Date();

        const [updatedOrder] = await drizzle
            .update(order)
            .set(updateData)
            .where(eq(order.id, orderId))
            .returning();

        res.status(200).json({
            success: true,
            data: updatedOrder,
        });
    } catch (err) {
        error(err.message, res);
    }
}

export const getOrdersForMainDriverManager = async (req, res) => {
    try {
        const driver = req.driver;
        let orders;

        if (driver.category === 'main') {
            const vehicles = await drizzle
                .select({ id: vehicle.id })
                .from(vehicle)
                .where(eq(vehicle.drivermanagerId, driver.id));

            const vehicleIds = vehicles.map(v => v.id);

            if (vehicleIds.length > 0) {
                orders = await drizzle
                    .select()
                    .from(order)
                    .where(inArray(order.vehicleId, vehicleIds));
            } else {
                orders = [];
            }
        } else {
            orders = [];
        }

        res.status(200).json({
            success: true,
            data: orders,
        });
    } catch (err) {
        error(err.message, res);
    }
}

export const getOrdersForIntermediateDriverManager = async (req, res) => {
    try {
        const driver = req.driver;
        let orders;

        if (driver.category === 'intermediate') {
            const vehicles = await drizzle
                .select({ id: vehicle.id })
                .from(vehicle)
                .where(eq(vehicle.drivermanagerId, driver.id));

            const vehicleIds = vehicles.map(v => v.id);

            if (vehicleIds.length > 0) {
                orders = await drizzle
                    .select()
                    .from(order)
                    .where(inArray(order.vehicleId, vehicleIds));
            } else {
                orders = [];
            }
        } else {
            orders = [];
        }

        res.status(200).json({
            success: true,
            data: orders,
        });
    } catch (err) {
        error(err.message, res);
    }
}