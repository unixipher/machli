import { drizzle } from '../drizzle/index.js';
import { vehicle, order, driverManager } from '../drizzle/schema.js';
import { error } from '../middleware/middleware.js';
import { eq } from 'drizzle-orm';

export const createVehicle = async (req, res) => {
    const { number, model, capacity } = req.body;
    const hubmanagerId = req.manager.id;

    if (!number || !model || !capacity || !hubmanagerId) {
        return error('number, model, capacity, and hubmanagerId are required', res, 400);
    }
    try {
        const [newVehicle] = await drizzle
            .insert(vehicle)
            .values({
                number,
                model,
                status: 'available',
                capacity: parseFloat(capacity),
                hubmanagerId: parseInt(hubmanagerId)
            })
            .returning();

        res.status(201).json({
            success: true,
            data: newVehicle
        });
    } catch (err) {
        console.error('Vehicle creation error:', err);
        if (err.code === '23503') {
            return error('Invalid hubmanagerId: Hub manager does not exist', res, 400);
        }
        if (err.code === '23505') {
            return error('Vehicle number already exists', res, 400);
        }
        error(err.message, res);
    }
}

export const allocateVehicletoOrder = async (req, res) => {
    try {
        const { orderId, vehicleId } = req.body;

        if (!orderId || !vehicleId) {
            return error('orderId and vehicleId are required', res, 400);
        }

        const [existingOrder] = await drizzle
            .select()
            .from(order)
            .where(eq(order.id, orderId))
            .limit(1);

        if (!existingOrder) {
            return error('Order not found', res, 404);
        }

        const [existingVehicle] = await drizzle
            .select()
            .from(vehicle)
            .where(eq(vehicle.id, vehicleId))
            .limit(1);

        if (!existingVehicle) {
            return error('Vehicle not found', res, 404);
        }

        if (existingVehicle.status !== 'available') {
            return error('Vehicle is occupied', res, 400);
        }

        if (existingVehicle.drivermanagerId) {
            const [vehicleDriverManager] = await drizzle
                .select()
                .from(driverManager)
                .where(eq(driverManager.id, existingVehicle.drivermanagerId))
                .limit(1);

            if (vehicleDriverManager) {
                const mainStatuses = ['created', 'pending', 'in_source'];
                const intermediateStatuses = ['in_hub'];

                if (mainStatuses.includes(existingOrder.status) && vehicleDriverManager.category !== 'main') {
                    return error('Only vehicles with main driver managers can be allocated to orders with status: created, pending, or in_source', res, 400);
                }

                if (intermediateStatuses.includes(existingOrder.status) && vehicleDriverManager.category !== 'intermediate') {
                    return error('Only vehicles with intermediate driver managers can be allocated to orders with status: in_hub', res, 400);
                }
            }
        }

        await drizzle
            .update(vehicle)
            .set({
                status: 'occupied',
                updatedAt: new Date(),
            })
            .where(eq(vehicle.id, vehicleId));

        const [updatedOrder] = await drizzle
            .update(order)
            .set({
                vehicleId,
                status: 'in_source',
                updatedAt: new Date(),
            })
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

export const allocateDriverManagertoVehicle = async (req, res) => {
    try {
        const { vehicleId, driverManagerId } = req.body;

        if (!vehicleId || !driverManagerId) {
            return error('vehicleId and driverManagerId are required', res, 400);
        }

        const [existingVehicle] = await drizzle
            .select()
            .from(vehicle)
            .where(eq(vehicle.id, vehicleId))
            .limit(1);

        if (!existingVehicle) {
            return error('Vehicle not found', res, 404);
        }

        if (existingVehicle.drivermanagerId !== null) {
            return error('Vehicle already has a driver manager assigned', res, 400);
        }

        const [existingDriverManager] = await drizzle
            .select()
            .from(driverManager)
            .where(eq(driverManager.id, driverManagerId))
            .limit(1);

        if (!existingDriverManager) {
            return error('Driver manager not found', res, 404);
        }

        if (existingDriverManager.status !== 'available') {
            return error('Driver manager is occupied', res, 400);
        }

        const vehicleOrders = await drizzle
            .select()
            .from(order)
            .where(eq(order.vehicleId, vehicleId));

        if (vehicleOrders.length > 0) {
            const mainStatuses = ['created', 'pending', 'in_source'];
            const intermediateStatuses = ['in_hub'];

            for (const vehicleOrder of vehicleOrders) {
                if (mainStatuses.includes(vehicleOrder.status) && existingDriverManager.category !== 'main') {
                    return error('Only main driver managers can be allocated to vehicles with orders having status: created, pending, or in_source', res, 400);
                }

                if (intermediateStatuses.includes(vehicleOrder.status) && existingDriverManager.category !== 'intermediate') {
                    return error('Only intermediate driver managers can be allocated to vehicles with orders having status: in_hub', res, 400);
                }
            }
        }

        await drizzle
            .update(driverManager)
            .set({
                status: 'occupied',
                updatedAt: new Date(),
            })
            .where(eq(driverManager.id, driverManagerId));

        const [updatedVehicle] = await drizzle
            .update(vehicle)
            .set({
                drivermanagerId: driverManagerId,
                updatedAt: new Date(),
            })
            .where(eq(vehicle.id, vehicleId))
            .returning();

        res.status(200).json({
            success: true,
            data: updatedVehicle,
        });
    } catch (err) {
        error(err.message, res);
    }
}