import { prisma } from '../../helper/prisma.js'
import { error } from '../../middleware/middleware.js';

export const CreateManager = async (req, res) => {
    try {
        const { name, phone, token } = req.body
        const newManager = await prisma.manager.create({
            data: {
                name,
                phone,
                token
            }
        });
        res.status(201).json(newManager);
    } catch (err) {
        error(err, res);
    }
};
export const CreateDriver = async (req, res) => {
    try {
        const { name, phone, token, category } = req.body
        const newDriver = await prisma.driver.create({
            data: {
                name,
                phone,
                token,
                category
            }
        });
        res.status(201).json(newDriver);
    } catch (err) {
        error(err, res);
    }
};
export const CreateShopOwner = async (req, res) => {
    try {
        const { name, phone, token, geoLat, geoLng } = req.body
        const newShopOwner = await prisma.shopOwner.create({
            data: {
                name,
                phone,
                token,
                geoLat,
                geoLng
            }
        });
        res.status(201).json(newShopOwner);
    } catch (err) {
        error(err, res);
    }
};

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
export const UpdateManager = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, token } = req.body;
        const updatedManager = await prisma.manager.update({
            where: { id: parseInt(id) },
            data: { name, phone, token }
        });
        res.status(200).json(updatedManager);
    } catch (err) {
        error(err, res);
    }
};
export const UpdateDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, token, category } = req.body;
        const updatedDriver = await prisma.driver.update({
            where: { id: parseInt(id) },
            data: { name, phone, token, category }
        });
        res.status(200).json(updatedDriver);
    } catch (err) {
        error(err, res);
    }
};
export const UpdateShopOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, token, geoLat, geoLng } = req.body;
        const updatedShopOwner = await prisma.shopOwner.update({
            where: { id: parseInt(id) },
            data: { name, phone, token, geoLat, geoLng }
        });
        res.status(200).json(updatedShopOwner);
    } catch (err) {
        error(err, res);
    }
};