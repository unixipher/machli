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
        const { orderId, vehicleId } = req.body;
        console.log('[allocateVehicletoOrder] Request body:', { orderId, vehicleId });

        if (!orderId || !vehicleId) {
            console.log('[allocateVehicletoOrder] Validation failed: Missing required fields');
            return error('orderId and vehicleId are required', res, 400);
        }

        console.log('[allocateVehicletoOrder] Fetching order with ID:', orderId);
        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId }
        });
        console.log('[allocateVehicletoOrder] Order found:', !!existingOrder, 'Status:', existingOrder?.status);

        if (!existingOrder) {
            console.log('[allocateVehicletoOrder] Order not found');
            return error('Order not found', res, 404);
        }

        console.log('[allocateVehicletoOrder] Fetching vehicle with ID:', vehicleId);
        const existingVehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId }
        });
        console.log('[allocateVehicletoOrder] Vehicle found:', !!existingVehicle, 'Status:', existingVehicle?.status, 'Driver manager ID:', existingVehicle?.drivermanagerId);

        if (!existingVehicle) {
            console.log('[allocateVehicletoOrder] Vehicle not found');
            return error('Vehicle not found', res, 404);
        }

        if (existingVehicle.status !== 'available') {
            console.log('[allocateVehicletoOrder] Vehicle is not available, status:', existingVehicle.status);
            return error('Vehicle is occupied', res, 400);
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

        console.log('[allocateVehicletoOrder] Updating vehicle status to occupied');
        await prisma.vehicle.update({
            where: { id: vehicleId },
            data: {
                status: 'occupied',
                updatedAt: new Date()
            }
        });
        console.log('[allocateVehicletoOrder] Vehicle updated successfully');

        console.log('[allocateVehicletoOrder] Updating order with vehicle ID and status');
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                vehicleId,
                status: 'in_source',
                updatedAt: new Date()
            }
        });
        console.log('[allocateVehicletoOrder] Order updated successfully, new status:', updatedOrder.status);

        console.log('[allocateVehicletoOrder] Sending success response');
        res.status(200).json({
            success: true,
            data: updatedOrder,
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

        if (existingVehicle.drivermanagerId !== null) {
            console.log('[allocateDriverManagertoVehicle] Vehicle already has driver manager:', existingVehicle.drivermanagerId);
            return error('Vehicle already has a driver manager assigned', res, 400);
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