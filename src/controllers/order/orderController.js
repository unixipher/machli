import { prisma } from '../../helper/prisma.js'
import { error } from '../../middleware/middleware.js';
import { ordermetadataschema } from '../../schema/schema.js';

export const CreateOrder = async (req, res) => {
    try {
        const { productId, shopOwnerId, driverId, managerId, metadata, quantity } = req.body;
        if (metadata) {
            ordermetadataschema.parse(metadata);
        }
        const newOrder = await prisma.order.create({
            data: {
                productId,
                shopOwnerId,
                driverId,
                managerId,
                quantity,
                metadata,
                status: 'CREATED'
            }
        });
        await prisma.product.update({
            where: { id: productId },
            data: {
                quantity: {
                    decrement: quantity
                }
            }
        });
        res.status(201).json(newOrder);
    } catch (err) {
        error(err, res);
    }
};
export const UpdateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, metadata } = req.body;
        if (metadata) {
            ordermetadataschema.parse(metadata);
        }
        const updatedOrder = await prisma.order.update({
            where: { id: parseInt(id) },
            data: {
                status,
                metadata
            }
        });
        res.status(200).json(updatedOrder);
    } catch (err) {
        error(err, res);
    }
};

export const GetOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) }
        });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Order not found'
            });
        }
        res.status(200).json(order);
    } catch (err) {
        error(err, res);
    }
};

export const CancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) }
        });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Order not found'
            });
        }
        if (order.status === 'CANCELLED') {
            return res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: 'Order is already cancelled'
            });
        }
        const cancelledOrder = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { status: 'CANCELLED' }
        });
        await prisma.product.update({
            where: { id: order.productId },
            data: {
                quantity: {
                    increment: order.quantity
                }
            }
        });
        res.status(200).json(cancelledOrder);
    } catch (err) {
        error(err, res);
    }
};
export const GetAllOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany();
        res.status(200).json(orders);
    } catch (err) {
        error(err, res);
    }
};