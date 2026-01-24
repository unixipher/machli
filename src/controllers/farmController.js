import prisma from '../lib/prisma.js';
import { error } from '../middleware/middleware.js';

export const createFarm = async (req, res) => {
    console.log('[createFarm] Function entry');
    try {
        const {
            name,
            farmSize,
            address,
            geoLat,
            geoLng,
            expectedHarvestDate,
            harvestQuantity,
            ownerName,
            ownerPhone,
            ownerEmail,
            metadata
        } = req.body;

        console.log('[createFarm] Request body:', req.body);

        // Validation for required fields
        if (!name || !farmSize || !address || !geoLat || !geoLng || !expectedHarvestDate || !harvestQuantity || !ownerName || !ownerPhone || !ownerEmail) {
            console.log('[createFarm] Validation failed: Missing required fields');
            return error('Missing required fields', res, 400);
        }

        const newFarm = await prisma.farm.create({
            data: {
                name,
                farmSize: parseFloat(farmSize),
                address,
                geoLat: parseFloat(geoLat),
                geoLng: parseFloat(geoLng),
                expectedHarvestDate: new Date(expectedHarvestDate),
                harvestQuantity: parseInt(harvestQuantity),
                ownerName,
                ownerPhone,
                ownerEmail,
                metadata: metadata || {},
                updatedAt: new Date() // Manually setting updatedAt as it lacks @updatedAt in schema
            }
        });

        console.log('[createFarm] Farm created, ID:', newFarm.id);
        res.status(201).json({
            success: true,
            data: newFarm
        });
    } catch (err) {
        console.error('[createFarm] Error:', err.message, err.stack);
        error(err.message, res);
    }
}

export const getAllFarms = async (req, res) => {
    console.log('[getAllFarms] Function entry');
    try {
        const farms = await prisma.farm.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                HubManager: true
            }
        });

        console.log('[getAllFarms] Farms found:', farms.length);
        res.status(200).json({
            success: true,
            data: farms
        });
    } catch (err) {
        console.error('[getAllFarms] Error:', err.message);
        error(err.message, res);
    }
}

export const getFarmById = async (req, res) => {
    console.log('[getFarmById] Function entry');
    try {
        const { id } = req.params;
        console.log('[getFarmById] Fetching farm with ID:', id);

        const farm = await prisma.farm.findUnique({
            where: { id: parseInt(id) },
            include: {
                HubManager: true
            }
        });

        if (!farm) {
            console.log('[getFarmById] Farm not found');
            return error('Farm not found', res, 404);
        }

        console.log('[getFarmById] Farm found');
        res.status(200).json({
            success: true,
            data: farm
        });
    } catch (err) {
        console.error('[getFarmById] Error:', err.message);
        error(err.message, res);
    }
}

export const updateFarm = async (req, res) => {
    console.log('[updateFarm] Function entry');
    try {
        const { id } = req.params;
        const {
            name,
            farmSize,
            address,
            geoLat,
            geoLng,
            expectedHarvestDate,
            harvestQuantity,
            ownerName,
            ownerPhone,
            ownerEmail,
            metadata
        } = req.body;

        console.log('[updateFarm] Request body:', req.body);

        const existingFarm = await prisma.farm.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingFarm) {
            return error('Farm not found', res, 404);
        }

        const dataToUpdate = {
            updatedAt: new Date()
        };

        if (name) dataToUpdate.name = name;
        if (farmSize) dataToUpdate.farmSize = parseFloat(farmSize);
        if (address) dataToUpdate.address = address;
        if (geoLat) dataToUpdate.geoLat = parseFloat(geoLat);
        if (geoLng) dataToUpdate.geoLng = parseFloat(geoLng);
        if (expectedHarvestDate) dataToUpdate.expectedHarvestDate = new Date(expectedHarvestDate);
        if (harvestQuantity) dataToUpdate.harvestQuantity = parseInt(harvestQuantity);
        if (ownerName) dataToUpdate.ownerName = ownerName;
        if (ownerPhone) dataToUpdate.ownerPhone = ownerPhone;
        if (ownerEmail) dataToUpdate.ownerEmail = ownerEmail;
        if (metadata) dataToUpdate.metadata = metadata;

        const updatedFarm = await prisma.farm.update({
            where: { id: parseInt(id) },
            data: dataToUpdate
        });

        console.log('[updateFarm] Farm updated successfully');
        res.status(200).json({
            success: true,
            data: updatedFarm
        });
    } catch (err) {
        console.error('[updateFarm] Error:', err.message);
        error(err.message, res);
    }
}

export const deleteFarm = async (req, res) => {
    console.log('[deleteFarm] Function entry');
    try {
        const { id } = req.params;
        console.log('[deleteFarm] Deleting farm with ID:', id);

        const existingFarm = await prisma.farm.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingFarm) {
            return error('Farm not found', res, 404);
        }

        await prisma.farm.delete({
            where: { id: parseInt(id) }
        });

        console.log('[deleteFarm] Farm deleted successfully');
        res.status(200).json({
            success: true,
            message: 'Farm deleted successfully'
        });
    } catch (err) {
        console.error('[deleteFarm] Error:', err.message);
        error(err.message, res);
    }
}
