import prisma from '../lib/prisma.js';
import { error } from '../middleware/middleware.js';

export const createVehicle = async (req, res) => {
    console.log('[createVehicle] Function entry');
    const { number, model, capacity } = req.body;
    const hubmanagerId = req.manager.id;
    console.log('[createVehicle] Request body:', { number, model, capacity, hubmanagerId });

    if (!number || !model || !capacity || !hubmanagerId) {
        console.log('[createVehicle] Validation failed: Missing required fields');
        return error('number, model, capacity, and hubmanagerId are required', res, 400);
    }
    try {
        console.log('[createVehicle] Inserting new vehicle');
        const newVehicle = await prisma.vehicle.create({
            data: {
                number,
                model,
                status: 'available',
                capacity: parseFloat(capacity),
                hubmanagerId: parseInt(hubmanagerId)
            }
        });
        console.log('[createVehicle] Vehicle created, ID:', newVehicle.id);

        console.log('[createVehicle] Sending success response');
        res.status(201).json({
            success: true,
            data: newVehicle
        });
    } catch (err) {
        console.error('[createVehicle] Error:', err.message, err.stack);
        const errorCode = err.cause?.code || err.code;
        console.log('[createVehicle] Error code:', errorCode);
        if (errorCode === '23503') {
            console.log('[createVehicle] Foreign key violation - invalid hubmanagerId');
            return error('Invalid hubmanagerId: Hub manager does not exist', res, 400);
        }
        if (errorCode === '23505') {
            console.log('[createVehicle] Unique constraint violation - duplicate vehicle number');
            return error('Vehicle number already exists', res, 400);
        }
        error(err.message, res);
    }
}

export const allocateVehicletoOrder = async (req, res) => {
    console.log('[allocateVehicletoOrder] Function entry');
    try {
        const manager = req.manager;
        const { orderId, vehicleId } = req.body;
        console.log('[allocateVehicletoOrder] Manager ID:', manager?.id, 'Category:', manager?.hubmanagerCategory);
        console.log('[allocateVehicletoOrder] Request body:', { orderId, vehicleId });

        if (!orderId || !vehicleId) {
            console.log('[allocateVehicletoOrder] Validation failed: Missing required fields');
            return error('orderId and vehicleId are required', res, 400);
        }

        console.log('[allocateVehicletoOrder] Fetching order with ID:', orderId);
        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        });
        console.log('[allocateVehicletoOrder] Order found:', !!existingOrder, 'Status:', existingOrder?.status, 'Old vehicle ID:', existingOrder?.vehicleId);

        if (!existingOrder) {
            console.log('[allocateVehicletoOrder] Order not found');
            return error('Order not found', res, 404);
        }

        // Calculate total quantity for this order
        const orderTotalQuantity = existingOrder.orderItems.reduce((sum, item) => sum + item.quantity, 0);
        console.log('[allocateVehicletoOrder] Order total quantity:', orderTotalQuantity);

        // Handle old vehicle if order is being reassigned
        if (existingOrder.vehicleId) {
            console.log('[allocateVehicletoOrder] Order has existing vehicle, fetching old vehicle ID:', existingOrder.vehicleId);
            const oldVehicle = await prisma.vehicle.findUnique({
                where: { id: existingOrder.vehicleId },
                include: {
                    orders: {
                        include: {
                            orderItems: true
                        }
                    }
                }
            });

            if (oldVehicle) {
                // Calculate remaining capacity after removing this order
                const oldVehicleUsedCapacity = oldVehicle.orders
                    .filter(o => o.id !== orderId)
                    .reduce((sum, order) => {
                        const orderQty = order.orderItems.reduce((qtySum, item) => qtySum + item.quantity, 0);
                        return sum + orderQty;
                    }, 0);

                console.log('[allocateVehicletoOrder] Old vehicle used capacity after removal:', oldVehicleUsedCapacity, '/', oldVehicle.capacity);

                // If old vehicle will have available capacity, set it to available
                if (oldVehicleUsedCapacity < oldVehicle.capacity) {
                    console.log('[allocateVehicletoOrder] Setting old vehicle to available, ID:', oldVehicle.id);
                    await prisma.vehicle.update({
                        where: { id: oldVehicle.id },
                        data: {
                            status: 'available',
                            updatedAt: new Date()
                        }
                    });
                    console.log('[allocateVehicletoOrder] Old vehicle status updated to available');
                }

                if (oldVehicle.drivermanagerId && oldVehicleUsedCapacity === 0) {
                    console.log('[allocateVehicletoOrder] Old vehicle now empty, fetching driver manager ID:', oldVehicle.drivermanagerId);
                    const oldDriverManager = await prisma.driverManager.findUnique({
                        where: { id: oldVehicle.drivermanagerId }
                    });

                    if (oldDriverManager) {
                        console.log('[allocateVehicletoOrder] Setting old driver manager to available, ID:', oldDriverManager.id);
                        await prisma.driverManager.update({
                            where: { id: oldDriverManager.id },
                            data: {
                                status: 'available',
                                updatedAt: new Date()
                            }
                        });
                        console.log('[allocateVehicletoOrder] Old driver manager status updated to available');
                    }
                }
            }
        }

        console.log('[allocateVehicletoOrder] Fetching vehicle with ID:', vehicleId);
        const existingVehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId },
            include: {
                orders: {
                    include: {
                        orderItems: true
                    }
                }
            }
        });
        console.log('[allocateVehicletoOrder] Vehicle found:', !!existingVehicle, 'Status:', existingVehicle?.status, 'Driver manager ID:', existingVehicle?.drivermanagerId);

        if (!existingVehicle) {
            console.log('[allocateVehicletoOrder] Vehicle not found');
            return error('Vehicle not found', res, 404);
        }

        const currentUsedCapacity = existingVehicle.orders
            .filter(o => o.id !== orderId)
            .reduce((sum, order) => {
                const orderQty = order.orderItems.reduce((qtySum, item) => qtySum + item.quantity, 0);
                return sum + orderQty;
            }, 0);
        console.log('[allocateVehicletoOrder] Vehicle current used capacity:', currentUsedCapacity, '/', existingVehicle.capacity);

        // Check capacity based on manager category
        if (manager.hubmanagerCategory === 'intermediate') {
            // For intermediate hub managers, allow multiple orders until capacity is full
            const remainingCapacity = existingVehicle.capacity - currentUsedCapacity;
            console.log('[allocateVehicletoOrder] Intermediate manager - remaining capacity:', remainingCapacity);

            if (orderTotalQuantity > remainingCapacity) {
                console.log('[allocateVehicletoOrder] Order quantity exceeds vehicle remaining capacity');
                return error(`Vehicle has insufficient capacity. Required: ${orderTotalQuantity}, Available: ${remainingCapacity}`, res, 400);
            }
        } else {
            // For main hub managers, only allow if vehicle is available (current behavior)
            if (existingVehicle.status !== 'available') {
                console.log('[allocateVehicletoOrder] Vehicle is not available, status:', existingVehicle.status);
                return error('Vehicle is occupied', res, 400);
            }
        }

        if (existingVehicle.drivermanagerId) {
            console.log('[allocateVehicletoOrder] Vehicle has driver manager, fetching driver manager details');
            const vehicleDriverManager = await prisma.driverManager.findUnique({
                where: { id: existingVehicle.drivermanagerId }
            });
            console.log('[allocateVehicletoOrder] Driver manager found:', !!vehicleDriverManager, 'Category:', vehicleDriverManager?.category);

            if (vehicleDriverManager) {
                const mainStatuses = ['created', 'pending', 'in_source'];
                const intermediateStatuses = ['in_hub'];

                if (mainStatuses.includes(existingOrder.status) && vehicleDriverManager.category !== 'main') {
                    console.log('[allocateVehicletoOrder] Validation failed: Main driver required for order status:', existingOrder.status);
                    return error('Only vehicles with main driver managers can be allocated to orders with status: created, pending, or in_source', res, 400);
                }

                if (intermediateStatuses.includes(existingOrder.status) && vehicleDriverManager.category !== 'intermediate') {
                    console.log('[allocateVehicletoOrder] Validation failed: Intermediate driver required for order status:', existingOrder.status);
                    return error('Only vehicles with intermediate driver managers can be allocated to orders with status: in_hub', res, 400);
                }
            }
        }

        // Calculate new total capacity after adding this order
        const newUsedCapacity = currentUsedCapacity + orderTotalQuantity;
        const willBeFull = newUsedCapacity >= existingVehicle.capacity;

        console.log('[allocateVehicletoOrder] New used capacity will be:', newUsedCapacity, 'Vehicle will be full:', willBeFull);

        // Update vehicle status based on capacity and manager category
        let vehicleStatus = existingVehicle.status;
        if (manager.hubmanagerCategory === 'intermediate') {
            vehicleStatus = willBeFull ? 'occupied' : 'available';
        } else {
            vehicleStatus = 'occupied';
        }

        console.log('[allocateVehicletoOrder] Updating vehicle status to', vehicleStatus);
        await prisma.vehicle.update({
            where: { id: vehicleId },
            data: {
                status: vehicleStatus,
                updatedAt: new Date()
            }
        });
        console.log('[allocateVehicletoOrder] Vehicle updated successfully');

        let newOrderStatus = 'in_source';
        if (manager.hubmanagerCategory === 'intermediate') {
            newOrderStatus = 'in_hub';
        }
        console.log('[allocateVehicletoOrder] New order status based on manager category:', newOrderStatus);

        console.log('[allocateVehicletoOrder] Updating order with vehicle ID and status');
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                vehicleId,
                status: newOrderStatus,
                updatedAt: new Date()
            }
        });
        console.log('[allocateVehicletoOrder] Order updated successfully, new status:', updatedOrder.status);

        console.log('[allocateVehicletoOrder] Sending success response');
        res.status(200).json({
            success: true,
            data: updatedOrder,
            vehicleCapacityInfo: {
                totalCapacity: existingVehicle.capacity,
                usedCapacity: newUsedCapacity,
                remainingCapacity: existingVehicle.capacity - newUsedCapacity,
                isFull: willBeFull
            }
        });
    } catch (err) {
        console.error('[allocateVehicletoOrder] Error:', err.message, err.stack);
        error(err.message, res);
    }
}

export const allocateDriverManagertoVehicle = async (req, res) => {
    console.log('[allocateDriverManagertoVehicle] Function entry');
    try {
        const { vehicleId, driverManagerId } = req.body;
        console.log('[allocateDriverManagertoVehicle] Request body:', { vehicleId, driverManagerId });

        if (!vehicleId || !driverManagerId) {
            console.log('[allocateDriverManagertoVehicle] Validation failed: Missing required fields');
            return error('vehicleId and driverManagerId are required', res, 400);
        }

        console.log('[allocateDriverManagertoVehicle] Fetching vehicle with ID:', vehicleId);
        const existingVehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId }
        });
        console.log('[allocateDriverManagertoVehicle] Vehicle found:', !!existingVehicle, 'Current driver:', existingVehicle?.drivermanagerId);

        if (!existingVehicle) {
            console.log('[allocateDriverManagertoVehicle] Vehicle not found');
            return error('Vehicle not found', res, 404);
        }

        console.log('[allocateDriverManagertoVehicle] Fetching driver manager with ID:', driverManagerId);
        const existingDriverManager = await prisma.driverManager.findUnique({
            where: { id: driverManagerId }
        });
        console.log('[allocateDriverManagertoVehicle] Driver manager found:', !!existingDriverManager, 'Status:', existingDriverManager?.status, 'Category:', existingDriverManager?.category);

        if (!existingDriverManager) {
            console.log('[allocateDriverManagertoVehicle] Driver manager not found');
            return error('Driver manager not found', res, 404);
        }

        if (existingDriverManager.status !== 'available') {
            console.log('[allocateDriverManagertoVehicle] Driver manager is not available:', existingDriverManager.status);
            return error('Driver manager is occupied', res, 400);
        }

        console.log('[allocateDriverManagertoVehicle] Fetching orders for vehicle ID:', vehicleId);
        const vehicleOrders = await prisma.order.findMany({
            where: { vehicleId }
        });
        console.log('[allocateDriverManagertoVehicle] Vehicle orders found:', vehicleOrders.length);

        if (vehicleOrders.length > 0) {
            const mainStatuses = ['created', 'pending', 'in_source'];
            const intermediateStatuses = ['in_hub'];

            for (const vehicleOrder of vehicleOrders) {
                console.log('[allocateDriverManagertoVehicle] Validating order:', vehicleOrder.id, 'Status:', vehicleOrder.status);
                if (mainStatuses.includes(vehicleOrder.status) && existingDriverManager.category !== 'main') {
                    console.log('[allocateDriverManagertoVehicle] Validation failed: Main driver required for order status:', vehicleOrder.status);
                    return error('Only main driver managers can be allocated to vehicles with orders having status: created, pending, or in_source', res, 400);
                }

                if (intermediateStatuses.includes(vehicleOrder.status) && existingDriverManager.category !== 'intermediate') {
                    console.log('[allocateDriverManagertoVehicle] Validation failed: Intermediate driver required for order status:', vehicleOrder.status);
                    return error('Only intermediate driver managers can be allocated to vehicles with orders having status: in_hub', res, 400);
                }
            }
        }

        console.log('[allocateDriverManagertoVehicle] Updating driver manager status to occupied');
        await prisma.driverManager.update({
            where: { id: driverManagerId },
            data: {
                status: 'occupied',
                updatedAt: new Date()
            }
        });
        console.log('[allocateDriverManagertoVehicle] Driver manager updated successfully');

        console.log('[allocateDriverManagertoVehicle] Allocating driver manager to vehicle');
        const updatedVehicle = await prisma.vehicle.update({
            where: { id: vehicleId },
            data: {
                drivermanagerId: driverManagerId,
                updatedAt: new Date()
            }
        });
        console.log('[allocateDriverManagertoVehicle] Vehicle updated successfully');

        console.log('[allocateDriverManagertoVehicle] Sending success response');
        res.status(200).json({
            success: true,
            data: updatedVehicle,
        });
    } catch (err) {
        console.error('[allocateDriverManagertoVehicle] Error:', err.message, err.stack);
        error(err.message, res);
    }
}