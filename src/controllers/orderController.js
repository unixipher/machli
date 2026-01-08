import { drizzle } from '../drizzle/index.js';
import { shop, order, orderItem, hubManager, product, vehicle } from '../drizzle/schema.js';
import { error } from '../middleware/middleware.js';
import { eq, inArray, sql } from 'drizzle-orm';

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
        const [newShop] = await drizzle
            .insert(shop)
            .values({
                name,
                phone,
                hubmanagerId: manager.id,
                address,
                geoLat,
                geoLng
            })
            .returning();
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
        const [newOrder] = await drizzle
            .insert(order)
            .values({
                shopId,
                hubmanagerId: hubManagerId,
                metadata: metadata || null,
                deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
            })
            .returning();
        console.log('[createOrder] Order created, ID:', newOrder.id);

        console.log('[createOrder] Inserting order items');
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
        console.log('[createOrder] Order items inserted:', orderItems.length);

        console.log('[createOrder] Updating product quantities');
        for (const item of items) {
            console.log('[createOrder] Updating product:', item.productId, 'Reducing quantity by:', item.quantity);
            await drizzle
                .update(product)
                .set({
                    quantity: sql`${product.quantity} - ${item.quantity}`,
                    updatedAt: new Date(),
                })
                .where(eq(product.id, item.productId));
        }
        console.log('[createOrder] Product quantities updated');

        console.log('[createOrder] Sending success response');
        res.status(201).json({
            success: true,
            data: {
                ...newOrder,
                items: orderItems,
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
            orders = await drizzle
                .select()
                .from(order)
                .where(eq(order.hubmanagerId, manager.id));
            console.log('[getAllOrdersForIntermediateHubManager] Orders fetched:', orders.length);
        } else {
            console.log('[getAllOrdersForIntermediateHubManager] Fetching intermediate managers under main manager');
            const intermediateManagers = await drizzle
                .select({ id: hubManager.id })
                .from(hubManager)
                .where(eq(hubManager.mainHubManagerId, manager.id));

            const intermediateManagerIds = intermediateManagers.map(m => m.id);
            console.log('[getAllOrdersForIntermediateHubManager] Intermediate manager IDs:', intermediateManagerIds);

            if (intermediateManagerIds.length > 0) {
                orders = await drizzle
                    .select()
                    .from(order)
                    .where(inArray(order.hubmanagerId, intermediateManagerIds));
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
                console.log(`[getAllOrdersForIntermediateHubManager] Order object:`, ord);
                
                let items = [];
                try {
                    items = await drizzle
                        .select({
                            id: orderItem.id,
                            orderId: orderItem.orderId,
                            productId: orderItem.productId,
                            quantity: orderItem.quantity,
                            productTitle: product.title,
                            productDescription: product.description,
                            productPrice: product.price,
                        })
                        .from(orderItem)
                        .leftJoin(product, eq(orderItem.productId, product.id))
                        .where(eq(orderItem.orderId, ord.id));
                    console.log(`[getAllOrdersForIntermediateHubManager] Items fetched for order ${ord.id}:`, items ? items.length : 'null/undefined');
                    console.log(`[getAllOrdersForIntermediateHubManager] Items data:`, items);
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

        const intermediateManagers = await drizzle
            .select({
                id: hubManager.id,
                name: hubManager.name,
                email: hubManager.email,
                phone: hubManager.phone,
            })
            .from(hubManager)
            .where(eq(hubManager.mainHubManagerId, manager.id));

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
                const orders = await drizzle
                    .select()
                    .from(order)
                    .where(eq(order.hubmanagerId, intermediateManager.id));
                
                console.log(`[getAllOrdersForMainHubManager] Orders found for manager ${intermediateManager.id}:`, orders.length);

                const ordersWithProducts = await Promise.all(
                    (orders || []).map(async (ord, orderIndex) => {
                        console.log(`[getAllOrdersForMainHubManager] Fetching items for order ${orderIndex + 1}/${orders.length}, orderId:`, ord.id);
                        const items = await drizzle
                            .select({
                                id: orderItem.id,
                                orderId: orderItem.orderId,
                                productId: orderItem.productId,
                                quantity: orderItem.quantity,
                                productTitle: product.title,
                                productDescription: product.description,
                                productPrice: product.price,
                            })
                            .from(orderItem)
                            .leftJoin(product, eq(orderItem.productId, product.id))
                            .where(eq(orderItem.orderId, ord.id));
                        
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
        const [existingOrder] = await drizzle
            .select()
            .from(order)
            .where(eq(order.id, orderId))
            .limit(1);
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
        const [updatedOrder] = await drizzle
            .update(order)
            .set(updateData)
            .where(eq(order.id, orderId))
            .returning();
        console.log('[updateOrderForIntermediateHubManager] Order updated successfully');

        console.log('[updateOrderForIntermediateHubManager] Fetching order items');
        const items = await drizzle
            .select({
                id: orderItem.id,
                orderId: orderItem.orderId,
                productId: orderItem.productId,
                quantity: orderItem.quantity,
                productTitle: product.title,
                productDescription: product.description,
                productPrice: product.price,
            })
            .from(orderItem)
            .leftJoin(product, eq(orderItem.productId, product.id))
            .where(eq(orderItem.orderId, updatedOrder.id));
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
        const [existingOrder] = await drizzle
            .select()
            .from(order)
            .where(eq(order.id, orderId))
            .limit(1);
        console.log('[updateOrderForMainHubManager] Order found:', !!existingOrder, 'Hub manager ID:', existingOrder?.hubmanagerId);

        if (!existingOrder) {
            console.log('[updateOrderForMainHubManager] Order not found');
            return error('Order not found', res, 404);
        }

        console.log('[updateOrderForMainHubManager] Fetching intermediate managers');
        const intermediateManagers = await drizzle
            .select({ id: hubManager.id })
            .from(hubManager)
            .where(eq(hubManager.mainHubManagerId, manager.id));
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
        const [updatedOrder] = await drizzle
            .update(order)
            .set(updateData)
            .where(eq(order.id, orderId))
            .returning();
        console.log('[updateOrderForMainHubManager] Order updated successfully');

        console.log('[updateOrderForMainHubManager] Fetching order items');
        const items = await drizzle
            .select({
                id: orderItem.id,
                orderId: orderItem.orderId,
                productId: orderItem.productId,
                quantity: orderItem.quantity,
                productTitle: product.title,
                productDescription: product.description,
                productPrice: product.price,
            })
            .from(orderItem)
            .leftJoin(product, eq(orderItem.productId, product.id))
            .where(eq(orderItem.orderId, updatedOrder.id));
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
            const vehicles = await drizzle
                .select({ id: vehicle.id })
                .from(vehicle)
                .where(eq(vehicle.drivermanagerId, driver.id));
            const vehicleIds = vehicles.map(v => v.id);
            console.log('[getOrdersForMainDriverManager] Vehicles found:', vehicleIds);

            if (vehicleIds.length > 0) {
                console.log('[getOrdersForMainDriverManager] Fetching orders for vehicles');
                orders = await drizzle
                    .select()
                    .from(order)
                    .where(inArray(order.vehicleId, vehicleIds));
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
                const items = await drizzle
                    .select({
                        id: orderItem.id,
                        orderId: orderItem.orderId,
                        productId: orderItem.productId,
                        quantity: orderItem.quantity,
                        productTitle: product.title,
                        productDescription: product.description,
                        productPrice: product.price,
                    })
                    .from(orderItem)
                    .leftJoin(product, eq(orderItem.productId, product.id))
                    .where(eq(orderItem.orderId, ord.id));
                console.log('[getOrdersForMainDriverManager] Items fetched for order', ord.id, ':', items.length);

                return {
                    ...ord,
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
            const vehicles = await drizzle
                .select({ id: vehicle.id })
                .from(vehicle)
                .where(eq(vehicle.drivermanagerId, driver.id));
            const vehicleIds = vehicles.map(v => v.id);
            console.log('[getOrdersForIntermediateDriverManager] Vehicles found:', vehicleIds);

            if (vehicleIds.length > 0) {
                console.log('[getOrdersForIntermediateDriverManager] Fetching orders for vehicles');
                orders = await drizzle
                    .select()
                    .from(order)
                    .where(inArray(order.vehicleId, vehicleIds));
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
                const items = await drizzle
                    .select({
                        id: orderItem.id,
                        orderId: orderItem.orderId,
                        productId: orderItem.productId,
                        quantity: orderItem.quantity,
                        productTitle: product.title,
                        productDescription: product.description,
                        productPrice: product.price,
                    })
                    .from(orderItem)
                    .leftJoin(product, eq(orderItem.productId, product.id))
                    .where(eq(orderItem.orderId, ord.id));
                console.log('[getOrdersForIntermediateDriverManager] Items fetched for order', ord.id, ':', items.length);

                return {
                    ...ord,
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
        const shops = await drizzle
            .select()
            .from(shop)
            .where(eq(shop.hubmanagerId, manager.id));
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
        const drivers = await drizzle
            .select()
            .from(driverManager)
            .where(eq(driverManager.hubmanagerId, manager.id));
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
        const intermediateManagers = await drizzle
            .select({ id: hubManager.id })
            .from(hubManager)
            .where(eq(hubManager.mainHubManagerId, manager.id));
        const intermediateManagerIds = intermediateManagers.map(m => m.id);
        console.log('[getAllDriverManagerUnderMainHubManager] Intermediate manager IDs:', intermediateManagerIds);

        let drivers = [];
        if (intermediateManagerIds.length > 0) {
            console.log('[getAllDriverManagerUnderMainHubManager] Fetching driver managers');
            drivers = await drizzle
                .select()
                .from(driverManager)
                .where(inArray(driverManager.hubmanagerId, intermediateManagerIds));
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
        const intermediateManagers = await drizzle
            .select()
            .from(hubManager)
            .where(eq(hubManager.mainHubManagerId, manager.id));
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
        const products = await drizzle
            .select()
            .from(product)
            .where(eq(product.hubmanagerId, manager.id));
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
        const vehicles = await drizzle
            .select()
            .from(vehicle)
            .where(eq(vehicle.hubmanagerId, manager.id));
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

        console.log('[getAllVehicleUnderMainHubManager] Fetching intermediate managers');
        const intermediateManagers = await drizzle
            .select({ id: hubManager.id })
            .from(hubManager)
            .where(eq(hubManager.mainHubManagerId, manager.id));
        const intermediateManagerIds = intermediateManagers.map(m => m.id);
        console.log('[getAllVehicleUnderMainHubManager] Intermediate manager IDs:', intermediateManagerIds);

        let vehicles = [];
        if (intermediateManagerIds.length > 0) {
            console.log('[getAllVehicleUnderMainHubManager] Fetching vehicles');
            vehicles = await drizzle
                .select()
                .from(vehicle)
                .where(inArray(vehicle.hubmanagerId, intermediateManagerIds));
            console.log('[getAllVehicleUnderMainHubManager] Vehicles found:', vehicles.length);
        } else {
            console.log('[getAllVehicleUnderMainHubManager] No intermediate managers found');
        }
        
        console.log('[getAllVehicleUnderMainHubManager] Sending success response');
        res.status(200).json({
            success: true,
            data: vehicles,
        });
    } catch (err) {
        console.error('[getAllVehicleUnderMainHubManager] Error:', err.message, err.stack);
        error(err.message, res);
    }
}