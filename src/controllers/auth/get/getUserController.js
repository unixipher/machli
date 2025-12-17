import { prisma } from './../../../helper/prisma.js'
import { error } from '../../../middleware/middleware.js';

export const getManager = async (req, res) => {
    try {
        const { id } = req.params;
        const manager = await prisma.manager.findUnique({
            where: { id: parseInt(id) }
        });
        if (!manager) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Manager not found'
            });
        }
        res.status(200).json(manager);
    } catch (err) {
        error(err, res);
    }
};

export const getDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const driver = await prisma.driver.findUnique({
            where: { id: parseInt(id) }
        });
        if (!driver) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Driver not found'
            });
        }
        res.status(200).json(driver);
    } catch (err) {
        error(err, res);
    }
};

export const getShopOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const shopOwner = await prisma.shopOwner.findUnique({
            where: { id: parseInt(id) }
        });
        if (!shopOwner) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Shop Owner not found'
            });
        }
        res.status(200).json(shopOwner);
    } catch (err) {
        error(err, res);
    }
};