import { prisma } from './../../../helper/prisma.js'
import { error } from '../../../middleware/middleware.js';

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