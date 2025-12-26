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
        const token = req.manager.token;
        const manager = await prisma.manager.findUnique({
            where: { token: token },
            select: { id: true, name: true, phone: true, token: true }
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
        const token = req.driver.token;
        const driver = await prisma.driver.findUnique({
            where: { token: token },
            select: { id: true, name: true, phone: true, token: true, category: true }
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
            where: { token: token },
            select: { id: true, name: true, phone: true, token: true, geoLat: true, geoLng: true }
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
        const token = req.manager.token;
        const { name, phone, token: newToken } = req.body;
        const updatedManager = await prisma.manager.update({
            where: { token: token },
            data: { name, phone, token: newToken }
        });
        res.status(200).json(updatedManager);
    } catch (err) {
        error(err, res);
    }
};
export const UpdateDriver = async (req, res) => {
    try {
        const token = req.driver.token;
        const { name, phone, token: newToken, category } = req.body;
        const updatedDriver = await prisma.driver.update({
            where: { token: token },
            data: { name, phone, token: newToken, category }
        });
        res.status(200).json(updatedDriver);
    } catch (err) {
        error(err, res);
    }
};
export const UpdateShopOwner = async (req, res) => {
    try {
        const token = req.shopOwner.token;
        const { name, phone, token: newToken, geoLat, geoLng } = req.body;
        const updatedShopOwner = await prisma.shopOwner.update({
            where: { token: token },
            data: { name, phone, token: newToken, geoLat, geoLng }
        });
        res.status(200).json(updatedShopOwner);
    } catch (err) {
        error(err, res);
    }
};