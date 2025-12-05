import { prisma } from './../helper/prisma.js'
import { error } from '../middleware/middleware.js';

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