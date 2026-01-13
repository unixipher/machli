import { ca } from 'zod/locales';
import prisma from '../lib/prisma.js';
import { error } from '../middleware/middleware.js';

export const createShop = async (req, res) => {
    console.log('[createShop] Function entry');
    try {
        const { name, phone, address, geoLat, geoLng } = req.body;
        const manager = req.manager;
        console.log('[createShop] Request body:', { name, phone, address, geoLat, geoLng });
        console.log('[createShop] Manager ID:', manager?.id);

        if (!name || !phone || !address || !geoLat || !geoLng) {
            console.log('[createShop] Validation failed: Missing required fields');
            return error('name, phone, address, geoLat, and geoLng are required', res, 400);
        }

        console.log('[createShop] Inserting new shop');
        const newShop = await prisma.shop.create({
            data: {
                name,
                phone,
                hubmanagerId: manager.id,
                address,
                geoLat,
                geoLng
            }
        });
        console.log('[createShop] Shop created, ID:', newShop.id);

        console.log('[createShop] Sending success response');
        res.status(201).json({
            success: true,
            data: newShop
        });
    } catch (err) {
        console.error('[createShop] Error:', err.message, err.stack);
        error(err.message, res);
    }
}

export const createOrder = async (req, res) => {
    console.log('[createOrder] Function entry');
    try {
        const hubManagerId = req.manager.id;
        const { shopId, items, metadata, deliveryDate } = req.body;
        console.log('[createOrder] Hub manager ID:', hubManagerId);
        console.log('[createOrder] Request body:', { shopId, itemCount: items?.length, hasMetadata: !!metadata, deliveryDate });

        if (!shopId || !items || !Array.isArray(items) || items.length === 0) {
            console.log('[createOrder] Validation failed: Invalid shopId or items');
            return error('shopId and items array are required', res, 400);
        }

        console.log('[createOrder] Validating items');
        for (const item of items) {
            if (!item.productId || !item.quantity || item.quantity <= 0) {
                console.log('[createOrder] Validation failed: Invalid item:', item);
                return error('Each item must have productId and valid quantity', res, 400);
            }
        }
        console.log('[createOrder] All items validated successfully');

        console.log('[createOrder] Inserting new order');
        const newOrder = await prisma.order.create({
            data: {
                shopId,
                hubmanagerId: hubManagerId,
                metadata: metadata || null,
                deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
            }
        });
        console.log('[createOrder] Order created, ID:', newOrder.id);

        console.log('[createOrder] Inserting order items');
        const orderItems = await prisma.orderItem.createMany({
            data: items.map(item => ({
                orderId: newOrder.id,
                productId: item.productId,
                quantity: item.quantity,
            }))
        });
        console.log('[createOrder] Order items inserted:', orderItems.count);

        console.log('[createOrder] Updating product quantities');
        for (const item of items) {
            console.log('[createOrder] Updating product:', item.productId, 'Reducing quantity by:', item.quantity);
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    quantity: {
                        decrement: item.quantity
                    },
                    updatedAt: new Date()
                }
            });
        }
        console.log('[createOrder] Product quantities updated');

        // Fetch the created order items
        const createdItems = await prisma.orderItem.findMany({
            where: { orderId: newOrder.id }
        });

        console.log('[createOrder] Sending success response');
        res.status(201).json({
            success: true,
            data: {
                ...newOrder,
                items: createdItems,
            },
        });
    } catch (err) {
        console.error('[createOrder] Error:', err.message, err.stack);
        error(err.message, res);
    }
}

export const getAllOrdersForIntermediateHubManager = async (req, res) => {
    try {
        const manager = req.manager;
        console.log('[getAllOrdersForIntermediateHubManager] Manager:', { id: manager.id, category: manager.hubmanagerCategory });
        let orders;

        if (manager.hubmanagerCategory === 'intermediate') {
            console.log('[getAllOrdersForIntermediateHubManager] Fetching orders for intermediate manager');
            orders = await prisma.order.findMany({
                where: { hubmanagerId: manager.id }
            });
            console.log('[getAllOrdersForIntermediateHubManager] Orders fetched:', orders.length);
        } else {
            console.log('[getAllOrdersForIntermediateHubManager] Fetching intermediate managers under main manager');
            const intermediateManagers = await prisma.hubManager.findMany({
                where: { mainHubManagerId: manager.id },
                select: { id: true }
            });

            const intermediateManagerIds = intermediateManagers.map(m => m.id);
            console.log('[getAllOrdersForIntermediateHubManager] Intermediate manager IDs:', intermediateManagerIds);

            if (intermediateManagerIds.length > 0) {
                orders = await prisma.order.findMany({
                    where: {
                        hubmanagerId: { in: intermediateManagerIds }
                    }
                });
                console.log('[getAllOrdersForIntermediateHubManager] Orders fetched:', orders.length);
            } else {
                orders = [];
                console.log('[getAllOrdersForIntermediateHubManager] No intermediate managers found');
            }
        }

        console.log('[getAllOrdersForIntermediateHubManager] Fetching products for', orders.length, 'orders');
        const ordersWithProducts = await Promise.all(
            (orders || []).map(async (ord, index) => {
                console.log(`[getAllOrdersForIntermediateHubManager] Fetching items for order ${index + 1}/${orders.length}, orderId:`, ord.id);

                let items = [];
                try {
                    items = await prisma.orderItem.findMany({
                        where: { orderId: ord.id },
                        include: {
                            product: {
                                select: {
                                    title: true,
                                    description: true,
                                    price: true
                                }
                            }
                        }
                    });
                    console.log(`[getAllOrdersForIntermediateHubManager] Items fetched for order ${ord.id}:`, items ? items.length : 'null/undefined');
                } catch (itemError) {
                    console.error(`[getAllOrdersForIntermediateHubManager] Error fetching items for order ${ord.id}:`, itemError.message);
                    items = [];
                }

                return {
                    ...ord,
                    items: items || [],
                };
            })
        );

        console.log('[getAllOrdersForIntermediateHubManager] Sending response with', ordersWithProducts.length, 'orders');
        res.status(200).json({
            success: true,
            data: ordersWithProducts,
        });
    } catch (err) {
        console.error('[getAllOrdersForIntermediateHubManager] Error:', err.message);
        error(err.message, res);
    }
}

export const getAllOrdersForMainHubManager = async (req, res) => {
    try {
        const manager = req.manager;
        console.log('[getAllOrdersForMainHubManager] Manager:', { id: manager.id });

        const intermediateManagers = await prisma.hubManager.findMany({
            where: { mainHubManagerId: manager.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true
            }
        });

        console.log('[getAllOrdersForMainHubManager] Intermediate managers found:', intermediateManagers.length);

        if (intermediateManagers.length === 0) {
            console.log('[getAllOrdersForMainHubManager] No intermediate managers, returning empty array');
            return res.status(200).json({
                success: true,
                data: [],
            });
        }

        console.log('[getAllOrdersForMainHubManager] Fetching orders for each intermediate manager');
        const result = await Promise.all(
            intermediateManagers.map(async (intermediateManager, index) => {
                console.log(`[getAllOrdersForMainHubManager] Fetching orders for intermediate manager ${index + 1}/${intermediateManagers.length}, ID:`, intermediateManager.id);
                const orders = await prisma.order.findMany({
                    where: { hubmanagerId: intermediateManager.id }
                });

                console.log(`[getAllOrdersForMainHubManager] Orders found for manager ${intermediateManager.id}:`, orders.length);

                const ordersWithProducts = await Promise.all(
                    (orders || []).map(async (ord, orderIndex) => {
                        console.log(`[getAllOrdersForMainHubManager] Fetching items for order ${orderIndex + 1}/${orders.length}, orderId:`, ord.id);
                        const items = await prisma.orderItem.findMany({
                            where: { orderId: ord.id },
                            include: {
                                product: {
                                    select: {
                                        title: true,
                                        description: true,
                                        price: true
                                    }
                                }
                            }
                        });

                        console.log(`[getAllOrdersForMainHubManager] Items fetched for order ${ord.id}:`, items.length);

                        return {
                            ...ord,
                            items: items || [],
                        };
                    })
                );

                return {
                    intermediateManager: {
                        name: intermediateManager.name,
                        email: intermediateManager.email,
                        phone: intermediateManager.phone,
                    },
                    orders: ordersWithProducts,
                };
            })
        );

        console.log('[getAllOrdersForMainHubManager] Sending response with data for', result.length, 'intermediate managers');
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (err) {
        console.error('[getAllOrdersForMainHubManager] Error:', err.message);
        error(err.message, res);
    }
}

export const updateOrderForIntermediateHubManager = async (req, res) => {
    console.log('[updateOrderForIntermediateHubManager] Function entry');
    try {
        const manager = req.manager;
        const { orderId, status, metadata } = req.body;
        console.log('[updateOrderForIntermediateHubManager] Manager ID:', manager?.id);
        console.log('[updateOrderForIntermediateHubManager] Request body:', { orderId, status, hasMetadata: !!metadata });

        if (!orderId) {
            console.log('[updateOrderForIntermediateHubManager] Validation failed: orderId is required');
            return error('orderId is required', res, 400);
        }

        console.log('[updateOrderForIntermediateHubManager] Fetching order with ID:', orderId);
        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId }
        });
        console.log('[updateOrderForIntermediateHubManager] Order found:', !!existingOrder);

        if (!existingOrder) {
            console.log('[updateOrderForIntermediateHubManager] Order not found');
            return error('Order not found', res, 404);
        }

        console.log('[updateOrderForIntermediateHubManager] Preparing update data');
        const updateData = {};
        if (status) updateData.status = status;
        if (metadata) updateData.metadata = metadata;
        updateData.updatedAt = new Date();
        console.log('[updateOrderForIntermediateHubManager] Update data:', updateData);

        console.log('[updateOrderForIntermediateHubManager] Updating order');
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updateData
        });
        console.log('[updateOrderForIntermediateHubManager] Order updated successfully');

        console.log('[updateOrderForIntermediateHubManager] Fetching order items');
        const items = await prisma.orderItem.findMany({
            where: { orderId: updatedOrder.id },
            include: {
                product: {
                    select: {
                        title: true,
                        description: true,
                        price: true
                    }
                }
            }
        });
        console.log('[updateOrderForIntermediateHubManager] Items fetched:', items.length);

        console.log('[updateOrderForIntermediateHubManager] Sending success response');
        res.status(200).json({
            success: true,
            data: {
                ...updatedOrder,
                items: items || [],
            },
        });
    } catch (err) {
        console.error('[updateOrderForIntermediateHubManager] Error:', err.message, err.stack);
        error(err.message, res);
    }
}

export const updateOrderViaMainDriverManager = async (req, res) => {
    console.log('[updateOrderViaMainDriverManager] Function entry');
    try {
        const driver = req.driver;
        const { orderId, status, metadata } = req.body;
        console.log('[updateOrderViaMainDriverManager] Driver ID:', driver?.id);
        console.log('[updateOrderViaMainDriverManager] Request body:', { orderId, status, hasMetadata: !!metadata });

        if (!orderId) {
            console.log('[updateOrderViaMainDriverManager] Validation failed: orderId is required');
            return error('orderId is required', res, 400);
        }

        console.log('[updateOrderViaMainDriverManager] Fetching order with ID:', orderId);
        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId }
        });
        console.log('[updateOrderViaMainDriverManager] Order found:', !!existingOrder);

        if (!existingOrder) {
            console.log('[updateOrderViaMainDriverManager] Order not found');
            return error('Order not found', res, 404);
        }

        console.log('[updateOrderViaMainDriverManager] Fetching vehicles for driver ID:', driver.id);
        const vehicles = await prisma.vehicle.findMany({
            where: { drivermanagerId: driver.id },
            select: { id: true }
        });
        const vehicleIds = vehicles.map(v => v.id);
        console.log('[updateOrderViaMainDriverManager] Driver vehicles:', vehicleIds);
        console.log('[updateOrderViaMainDriverManager] Order vehicleId:', existingOrder.vehicleId);

        if (!existingOrder.vehicleId || !vehicleIds.includes(existingOrder.vehicleId)) {
            console.log('[updateOrderViaMainDriverManager] Permission denied: Order does not belong to driver\'s vehicles');
            return error('You do not have permission to update this order', res, 403);
        }

        if (status) {
            const allowedStatuses = ['in_transit', 'in_hub'];
            if (!allowedStatuses.includes(status)) {
                console.log('[updateOrderViaMainDriverManager] Validation failed: Invalid status for main driver');
                return error('Main driver managers can only update order status to: in_transit, in_hub', res, 400);
            }
        }

        console.log('[updateOrderViaMainDriverManager] Preparing update data');
        const updateData = {};
        if (status) updateData.status = status;
        if (metadata) updateData.metadata = metadata;
        updateData.updatedAt = new Date();
        console.log('[updateOrderViaMainDriverManager] Update data:', updateData);

        console.log('[updateOrderViaMainDriverManager] Updating order');
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updateData
        });
        console.log('[updateOrderViaMainDriverManager] Order updated successfully');

        console.log('[updateOrderViaMainDriverManager] Fetching order items');
        const items = await prisma.orderItem.findMany({
            where: { orderId: updatedOrder.id },
            include: {
                product: {
                    select: {
                        title: true,
                        description: true,
                        price: true
                    }
                }
            }
        });
        console.log('[updateOrderViaMainDriverManager] Items fetched:', items.length);

        console.log('[updateOrderViaMainDriverManager] Sending success response');
        res.status(200).json({
            success: true,
            data: {
                ...updatedOrder,
                items: items || [],
            },
        });
    } catch (err) {
        console.error('[updateOrderViaMainDriverManager] Error:', err.message, err.stack);
        error(err.message, res);
    }
}

export const updateOrderViaIntermediateDriverManager = async (req, res) => {
    console.log('[updateOrderViaIntermediateDriverManager] Function entry');
    try {
        const driver = req.driver;
        const { orderId, status, metadata } = req.body;
        console.log('[updateOrderViaIntermediateDriverManager] Driver ID:', driver?.id);
        console.log('[updateOrderViaIntermediateDriverManager] Request body:', { orderId, status, hasMetadata: !!metadata });

        if (!orderId) {
            console.log('[updateOrderViaIntermediateDriverManager] Validation failed: orderId is required');
            return error('orderId is required', res, 400);
        }

        console.log('[updateOrderViaIntermediateDriverManager] Fetching order with ID:', orderId);
        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId }
        });
        console.log('[updateOrderViaIntermediateDriverManager] Order found:', !!existingOrder);

        if (!existingOrder) {
            console.log('[updateOrderViaIntermediateDriverManager] Order not found');
            return error('Order not found', res, 404);
        }

        console.log('[updateOrderViaIntermediateDriverManager] Fetching vehicles for driver ID:', driver.id);
        const vehicles = await prisma.vehicle.findMany({
            where: { drivermanagerId: driver.id },
            select: { id: true }
        });
        const vehicleIds = vehicles.map(v => v.id);
        console.log('[updateOrderViaIntermediateDriverManager] Driver vehicles:', vehicleIds);
        console.log('[updateOrderViaIntermediateDriverManager] Order vehicleId:', existingOrder.vehicleId);

        if (!existingOrder.vehicleId || !vehicleIds.includes(existingOrder.vehicleId)) {
            console.log('[updateOrderViaIntermediateDriverManager] Permission denied: Order does not belong to driver\'s vehicles');
            return error('You do not have permission to update this order', res, 403);
        }

        if (status) {
            const allowedStatuses = ['in_transit', 'delivered'];
            if (!allowedStatuses.includes(status)) {
                console.log('[updateOrderViaIntermediateDriverManager] Validation failed: Invalid status for intermediate driver');
                return error('Intermediate driver managers can only update order status to: in_transit, delivered', res, 400);
            }
        }

        console.log('[updateOrderViaIntermediateDriverManager] Preparing update data');
        const updateData = {};
        if (status) updateData.status = status;
        if (metadata) updateData.metadata = metadata;
        updateData.updatedAt = new Date();
        console.log('[updateOrderViaIntermediateDriverManager] Update data:', updateData);

        console.log('[updateOrderViaIntermediateDriverManager] Updating order');
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updateData
        });
        console.log('[updateOrderViaIntermediateDriverManager] Order updated successfully');

        console.log('[updateOrderViaIntermediateDriverManager] Fetching order items');
        const items = await prisma.orderItem.findMany({
            where: { orderId: updatedOrder.id },
            include: {
                product: {
                    select: {
                        title: true,
                        description: true,
                        price: true
                    }
                }
            }
        });
        console.log('[updateOrderViaIntermediateDriverManager] Items fetched:', items.length);

        console.log('[updateOrderViaIntermediateDriverManager] Sending success response');
        res.status(200).json({
            success: true,
            data: {
                ...updatedOrder,
                items: items || [],
            },
        });
    } catch (err) {
        console.error('[updateOrderViaIntermediateDriverManager] Error:', err.message, err.stack);
        error(err.message, res);
    }
}


export const updateOrderForMainHubManager = async (req, res) => {
    console.log('[updateOrderForMainHubManager] Function entry');
    try {
        const manager = req.manager;
        const { orderId, status, metadata } = req.body;
        console.log('[updateOrderForMainHubManager] Manager ID:', manager?.id);
        console.log('[updateOrderForMainHubManager] Request body:', { orderId, status, hasMetadata: !!metadata });

        if (!orderId) {
            console.log('[updateOrderForMainHubManager] Validation failed: orderId is required');
            return error('orderId is required', res, 400);
        }

        console.log('[updateOrderForMainHubManager] Fetching order with ID:', orderId);
        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId }
        });
        console.log('[updateOrderForMainHubManager] Order found:', !!existingOrder, 'Hub manager ID:', existingOrder?.hubmanagerId);

        if (!existingOrder) {
            console.log('[updateOrderForMainHubManager] Order not found');
            return error('Order not found', res, 404);
        }

        console.log('[updateOrderForMainHubManager] Fetching intermediate managers');
        const intermediateManagers = await prisma.hubManager.findMany({
            where: { mainHubManagerId: manager.id },
            select: { id: true }
        });
        const intermediateManagerIds = intermediateManagers.map(m => m.id);
        console.log('[updateOrderForMainHubManager] Intermediate manager IDs:', intermediateManagerIds);

        if (!intermediateManagerIds.includes(existingOrder.hubmanagerId)) {
            console.log('[updateOrderForMainHubManager] Permission denied: Order belongs to different manager');
            return error('You do not have permission to update this order', res, 403);
        }

        console.log('[updateOrderForMainHubManager] Preparing update data');
        const updateData = {};
        if (status) updateData.status = status;
        if (metadata) updateData.metadata = metadata;
        updateData.updatedAt = new Date();
        console.log('[updateOrderForMainHubManager] Update data:', updateData);

        console.log('[updateOrderForMainHubManager] Updating order');
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updateData
        });
        console.log('[updateOrderForMainHubManager] Order updated successfully');

        console.log('[updateOrderForMainHubManager] Fetching order items');
        const items = await prisma.orderItem.findMany({
            where: { orderId: updatedOrder.id },
            include: {
                product: {
                    select: {
                        title: true,
                        description: true,
                        price: true
                    }
                }
            }
        });
        console.log('[updateOrderForMainHubManager] Items fetched:', items.length);

        console.log('[updateOrderForMainHubManager] Sending success response');
        res.status(200).json({
            success: true,
            data: {
                ...updatedOrder,
                items: items || [],
            },
        });
    } catch (err) {
        console.error('[updateOrderForMainHubManager] Error:', err.message, err.stack);
        error(err.message, res);
    }
}

export const getOrdersForMainDriverManager = async (req, res) => {
    console.log('[getOrdersForMainDriverManager] Function entry');
    try {
        const driver = req.driver;
        console.log('[getOrdersForMainDriverManager] Driver ID:', driver?.id, 'Category:', driver?.category);
        let orders;

        if (driver.category === 'main') {
            console.log('[getOrdersForMainDriverManager] Fetching vehicles for driver ID:', driver.id);
            const vehicles = await prisma.vehicle.findMany({
                where: { drivermanagerId: driver.id },
                select: { id: true }
            });
            const vehicleIds = vehicles.map(v => v.id);
            console.log('[getOrdersForMainDriverManager] Vehicles found:', vehicleIds);

            if (vehicleIds.length > 0) {
                console.log('[getOrdersForMainDriverManager] Fetching orders for vehicles');
                orders = await prisma.order.findMany({
                    where: {
                        vehicleId: { in: vehicleIds }
                    },
                    include: {
                        shop: {
                            select: {
                                name: true
                            }
                        },
                        hubManager: {
                            select: {
                                name: true,
                                address: true,
                                geoLat: true,
                                geoLng: true
                            }
                        }
                    }
                });
                console.log('[getOrdersForMainDriverManager] Orders found:', orders.length);
            } else {
                console.log('[getOrdersForMainDriverManager] No vehicles found');
                orders = [];
            }
        } else {
            console.log('[getOrdersForMainDriverManager] Driver is not main category');
            orders = [];
        }

        console.log('[getOrdersForMainDriverManager] Fetching order items for', orders.length, 'orders');
        const ordersWithProducts = await Promise.all(
            (orders || []).map(async (ord) => {
                console.log('[getOrdersForMainDriverManager] Fetching items for order ID:', ord.id);
                const items = await prisma.orderItem.findMany({
                    where: { orderId: ord.id },
                    include: {
                        product: {
                            select: {
                                title: true,
                                description: true,
                                price: true
                            }
                        }
                    }
                });
                console.log('[getOrdersForMainDriverManager] Items fetched for order', ord.id, ':', items.length);

                return {
                    ...ord,
                    destination: {
                        address: ord.hubManager?.address || null,
                        geoLat: ord.hubManager?.geoLat || null,
                        geoLng: ord.hubManager?.geoLng || null
                    },
                    items: items || [],
                };
            })
        );

        console.log('[getOrdersForMainDriverManager] Sending success response');
        res.status(200).json({
            success: true,
            data: ordersWithProducts,
        });
    } catch (err) {
        console.error('[getOrdersForMainDriverManager] Error:', err.message, err.stack);
        error(err.message, res);
    }
}

export const getOrdersForIntermediateDriverManager = async (req, res) => {
    console.log('[getOrdersForIntermediateDriverManager] Function entry');
    try {
        const driver = req.driver;
        console.log('[getOrdersForIntermediateDriverManager] Driver ID:', driver?.id, 'Category:', driver?.category);
        let orders;

        if (driver.category === 'intermediate') {
            console.log('[getOrdersForIntermediateDriverManager] Fetching vehicles for driver ID:', driver.id);
            const vehicles = await prisma.vehicle.findMany({
                where: { drivermanagerId: driver.id },
                select: { id: true }
            });
            const vehicleIds = vehicles.map(v => v.id);
            console.log('[getOrdersForIntermediateDriverManager] Vehicles found:', vehicleIds);

            if (vehicleIds.length > 0) {
                console.log('[getOrdersForIntermediateDriverManager] Fetching orders for vehicles');
                orders = await prisma.order.findMany({
                    where: {
                        vehicleId: { in: vehicleIds }
                    },
                    include: {
                        shop: {
                            select: {
                                name: true,
                                address: true,
                                geoLat: true,
                                geoLng: true
                            }
                        },
                        hubManager: {
                            select: {
                                name: true,
                                address: true
                            }
                        }
                    }
                });
                console.log('[getOrdersForIntermediateDriverManager] Orders found:', orders.length);
            } else {
                console.log('[getOrdersForIntermediateDriverManager] No vehicles found');
                orders = [];
            }
        } else {
            console.log('[getOrdersForIntermediateDriverManager] Driver is not intermediate category');
            orders = [];
        }

        console.log('[getOrdersForIntermediateDriverManager] Fetching order items for', orders.length, 'orders');
        const ordersWithProducts = await Promise.all(
            (orders || []).map(async (ord) => {
                console.log('[getOrdersForIntermediateDriverManager] Fetching items for order ID:', ord.id);
                const items = await prisma.orderItem.findMany({
                    where: { orderId: ord.id },
                    include: {
                        product: {
                            select: {
                                title: true,
                                description: true,
                                price: true
                            }
                        }
                    }
                });
                console.log('[getOrdersForIntermediateDriverManager] Items fetched for order', ord.id, ':', items.length);

                return {
                    ...ord,
                    destination: {
                        address: ord.shop?.address || null,
                        geoLat: ord.shop?.geoLat || null,
                        geoLng: ord.shop?.geoLng || null
                    },
                    items: items || [],
                };
            })
        );

        console.log('[getOrdersForIntermediateDriverManager] Sending success response');
        res.status(200).json({
            success: true,
            data: ordersWithProducts,
        });
    } catch (err) {
        console.error('[getOrdersForIntermediateDriverManager] Error:', err.message, err.stack);
        error(err.message, res);
    }
}

export const getAllShopsUnderIntermediateHubManager = async (req, res) => {
    console.log('[getAllShopsUnderIntermediateHubManager] Function entry');
    try {
        const manager = req.manager;
        console.log('[getAllShopsUnderIntermediateHubManager] Manager ID:', manager?.id);

        console.log('[getAllShopsUnderIntermediateHubManager] Fetching shops');
        const shops = await prisma.shop.findMany({
            where: { hubmanagerId: manager.id }
        });
        console.log('[getAllShopsUnderIntermediateHubManager] Shops found:', shops.length);

        console.log('[getAllShopsUnderIntermediateHubManager] Sending success response');
        res.status(200).json({
            success: true,
            data: shops,
        });
    } catch (err) {
        console.error('[getAllShopsUnderIntermediateHubManager] Error:', err.message, err.stack);
        error(err.message, res);
    }
}

export const getAllDriverManagerUnderIntermediateHubManager = async (req, res) => {
    console.log('[getAllDriverManagerUnderIntermediateHubManager] Function entry');
    try {
        const manager = req.manager;
        console.log('[getAllDriverManagerUnderIntermediateHubManager] Manager ID:', manager?.id);

        console.log('[getAllDriverManagerUnderIntermediateHubManager] Fetching driver managers');
        const drivers = await prisma.driverManager.findMany({
            where: { hubmanagerId: manager.id }
        });
        console.log('[getAllDriverManagerUnderIntermediateHubManager] Driver managers found:', drivers.length);

        console.log('[getAllDriverManagerUnderIntermediateHubManager] Sending success response');
        res.status(200).json({
            success: true,
            data: drivers,
        });
    } catch (err) {
        console.error('[getAllDriverManagerUnderIntermediateHubManager] Error:', err.message, err.stack);
        error(err.message, res);
    }
}

export const getAllDriverManagerUnderMainHubManager = async (req, res) => {
    console.log('[getAllDriverManagerUnderMainHubManager] Function entry');
    try {
        const manager = req.manager;
        console.log('[getAllDriverManagerUnderMainHubManager] Manager ID:', manager?.id);

        console.log('[getAllDriverManagerUnderMainHubManager] Fetching intermediate managers');
        const intermediateManagers = await prisma.hubManager.findMany({
            where: { mainHubManagerId: manager.id },
            select: { id: true }
        });
        const intermediateManagerIds = intermediateManagers.map(m => m.id);
        console.log('[getAllDriverManagerUnderMainHubManager] Intermediate manager IDs:', intermediateManagerIds);

        let drivers = [];
        if (intermediateManagerIds.length > 0) {
            console.log('[getAllDriverManagerUnderMainHubManager] Fetching driver managers');
            drivers = await prisma.driverManager.findMany({
                where: {
                    hubmanagerId: { in: intermediateManagerIds }
                }
            });
            console.log('[getAllDriverManagerUnderMainHubManager] Driver managers found:', drivers.length);
        } else {
            console.log('[getAllDriverManagerUnderMainHubManager] No intermediate managers found');
        }

        console.log('[getAllDriverManagerUnderMainHubManager] Sending success response');
        res.status(200).json({
            success: true,
            data: drivers,
        });
    } catch (err) {
        console.error('[getAllDriverManagerUnderMainHubManager] Error:', err.message, err.stack);
        error(err.message, res);
    }
}

export const getAllIntermediateHubManagerUnderMainHubManager = async (req, res) => {
    console.log('[getAllIntermediateHubManagerUnderMainHubManager] Function entry');
    try {
        const manager = req.manager;
        console.log('[getAllIntermediateHubManagerUnderMainHubManager] Manager ID:', manager?.id);

        console.log('[getAllIntermediateHubManagerUnderMainHubManager] Fetching intermediate managers');
        const intermediateManagers = await prisma.hubManager.findMany({
            where: { mainHubManagerId: manager.id }
        });
        console.log('[getAllIntermediateHubManagerUnderMainHubManager] Intermediate managers found:', intermediateManagers.length);

        console.log('[getAllIntermediateHubManagerUnderMainHubManager] Sending success response');
        res.status(200).json({
            success: true,
            data: intermediateManagers,
        });
    } catch (err) {
        console.error('[getAllIntermediateHubManagerUnderMainHubManager] Error:', err.message, err.stack);
        error(err.message, res);
    }
}

export const getAllProductsUnderIntermediateHubManager = async (req, res) => {
    console.log('[getAllProductsUnderIntermediateHubManager] Function entry');
    try {
        const manager = req.manager;
        console.log('[getAllProductsUnderIntermediateHubManager] Manager ID:', manager?.id);

        console.log('[getAllProductsUnderIntermediateHubManager] Fetching products');
        const products = await prisma.product.findMany({
            where: { hubmanagerId: manager.id }
        });
        console.log('[getAllProductsUnderIntermediateHubManager] Products found:', products.length);

        console.log('[getAllProductsUnderIntermediateHubManager] Sending success response');
        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (err) {
        console.error('[getAllProductsUnderIntermediateHubManager] Error:', err.message, err.stack);
        error(err.message, res);
    }
}

export const getAllVehicleUnderIntermediateHubManager = async (req, res) => {
    console.log('[getAllVehicleUnderIntermediateHubManager] Function entry');
    try {
        const manager = req.manager;
        console.log('[getAllVehicleUnderIntermediateHubManager] Manager ID:', manager?.id);

        console.log('[getAllVehicleUnderIntermediateHubManager] Fetching vehicles');
        const vehicles = await prisma.vehicle.findMany({
            where: { hubmanagerId: manager.id }
        });
        console.log('[getAllVehicleUnderIntermediateHubManager] Vehicles found:', vehicles.length);

        console.log('[getAllVehicleUnderIntermediateHubManager] Sending success response');
        res.status(200).json({
            success: true,
            data: vehicles,
        });
    } catch (err) {
        console.error('[getAllVehicleUnderIntermediateHubManager] Error:', err.message, err.stack);
        error(err.message, res);
    }
}

export const getAllVehicleUnderMainHubManager = async (req, res) => {
    console.log('[getAllVehicleUnderMainHubManager] Function entry');
    try {
        const manager = req.manager;
        console.log('[getAllVehicleUnderMainHubManager] Manager ID:', manager?.id);

        console.log('[getAllVehicleUnderMainHubManager] Fetching mainhub managers')


        console.log('[getAllVehicleUnderMainHubManager] Fetching vehicles');
        const vehicles = await prisma.vehicle.findMany({
            where: {
                hubmanagerId: manager.id,
            },
        });

        console.log('[getAllVehicleUnderMainHubManager] Vehicles found:', vehicles.length);

        return res.status(200).json({
            success: true,
            data: vehicles,
        });
    } catch (err) {
        console.error(
            '[getAllVehicleUnderMainHubManager] Error:',
            err.message,
            err.stack
        );
        return error(err.message, res);
    }
};