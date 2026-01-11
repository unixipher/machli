import prisma from '../lib/prisma.js';
import { error } from '../middleware/middleware.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rajat@bharatgiveaways.com',
        pass: 'kxcs igcm utww gfpe'
    }
});

const sendOTP = async (email, otpCode) => {
    try {
        const mailOptions = {
            from: 'rajat@bharatgiveaways.com',
            to: email,
            subject: 'Your OTP Code',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Your OTP Code</h2>
                    <p style="font-size: 16px; color: #666;">Please use the following OTP to verify your email:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #333; margin: 0; letter-spacing: 5px;">${otpCode}</h1>
                    </div>
                    <p style="font-size: 14px; color: #999;">This OTP will expire in 10 minutes.</p>
                    <p style="font-size: 14px; color: #999;">If you didn't request this OTP, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP sent successfully to ${email}`);
        return true;
    } catch (err) {
        console.error('Error sending OTP:', err);
        throw new Error('Failed to send OTP email');
    }
};

export const requestOTP = async (req, res) => {
    console.log('[requestOTP] Function entry');
    const { email } = req.body;
    console.log('[requestOTP] Request body:', { email });
    
    if (!email) {
        console.log('[requestOTP] Validation failed: Email is required');
        return error('Email is required', res, 400);
    }

    try {
        console.log('[requestOTP] Checking for existing hub manager with email:', email);
        const existingHubManager = await prisma.hubManager.findUnique({
            where: { email }
        });
        console.log('[requestOTP] Hub manager found:', !!existingHubManager);

        console.log('[requestOTP] Checking for existing driver manager with email:', email);
        const existingDriverManager = await prisma.driverManager.findUnique({
            where: { email }
        });
        console.log('[requestOTP] Driver manager found:', !!existingDriverManager);

        const userExists = existingHubManager || existingDriverManager;
        console.log('[requestOTP] User exists:', !!userExists);

        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        console.log('[requestOTP] Generated OTP, expires at:', expiresAt);

        console.log('[requestOTP] Inserting OTP record into database');
        await prisma.oTP.create({
            data: {
                email,
                otp: otpCode,
                verified: 'false',
                expiresAt
            }
        });
        console.log('[requestOTP] OTP record inserted successfully');

        console.log('[requestOTP] Sending OTP email to:', email);
        await sendOTP(email, otpCode);
        console.log('[requestOTP] OTP email sent successfully');

        console.log('[requestOTP] Sending success response');
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            userExists: !!userExists,
            data: {
                email,
                requiresProfileCreation: !userExists
            }
        });
    } catch (err) {
        console.error('[requestOTP] Error:', err.message, err.stack);
        error(err.message, res);
    }
};

export const verifyOTP = async (req, res) => {
    console.log('[verifyOTP] Function entry');
    const { email, otp: userOTP } = req.body;
    console.log('[verifyOTP] Request body:', { email, otpProvided: !!userOTP });

    if (!email || !userOTP) {
        console.log('[verifyOTP] Validation failed: Email and OTP are required');
        return error('Email and OTP are required', res, 400);
    }

    try {
        console.log('[verifyOTP] Fetching OTP record for email:', email);
        const otpRecord = await prisma.oTP.findFirst({
            where: {
                email,
                otp: userOTP,
                verified: 'false',
                expiresAt: {
                    gt: new Date()
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log('[verifyOTP] OTP record found:', !!otpRecord);

        if (!otpRecord) {
            console.log('[verifyOTP] Invalid or expired OTP');
            return error('Invalid or expired OTP', res, 400);
        }

        console.log('[verifyOTP] Marking OTP as verified, ID:', otpRecord.id);
        await prisma.oTP.update({
            where: { id: otpRecord.id },
            data: { verified: 'true' }
        });
        console.log('[verifyOTP] OTP marked as verified');

        console.log('[verifyOTP] Checking for existing hub manager with email:', email);
        const existingHubManager = await prisma.hubManager.findUnique({
            where: { email }
        });
        console.log('[verifyOTP] Hub manager found:', !!existingHubManager);

        console.log('[verifyOTP] Checking for existing driver manager with email:', email);
        const existingDriverManager = await prisma.driverManager.findUnique({
            where: { email }
        });
        console.log('[verifyOTP] Driver manager found:', !!existingDriverManager);

        if (existingHubManager) {
            console.log('[verifyOTP] Returning hub manager data');
            res.status(200).json({
                success: true,
                message: 'OTP verified successfully',
                userExists: true,
                data: {
                    token: existingHubManager.token,
                    userType: 'hubManager',
                    user: existingHubManager
                }
            });
        } else if (existingDriverManager) {
            console.log('[verifyOTP] Returning driver manager data');
            res.status(200).json({
                success: true,
                message: 'OTP verified successfully',
                userExists: true,
                data: {
                    token: existingDriverManager.token,
                    userType: 'driverManager',
                    user: existingDriverManager
                }
            });
        } else {
            console.log('[verifyOTP] No existing user, profile creation required');
            res.status(200).json({
                success: true,
                message: 'OTP verified successfully. Please create your profile.',
                userExists: false,
                data: {
                    email,
                    verified: true,
                    requiresProfileCreation: true
                }
            });
        }
    } catch (err) {
        console.error('[verifyOTP] Error:', err.message, err.stack);
        error(err.message, res);
    }
};


export const createHubManager = async (req, res) => {
    console.log('[createHubManager] Function entry');
    const { name, email, phone, hubmanagerCategory, mainHubManagerId, address, geoLat, geoLng } = req.body;
    console.log('[createHubManager] Request body:', { name, email, phone, hubmanagerCategory, mainHubManagerId, address, geoLat, geoLng });
    
    if (!name || !email || !phone || !hubmanagerCategory || !address || !geoLat || !geoLng) {
        console.log('[createHubManager] Validation failed: Missing required fields');
        return error('name, email, phone, hubmanagerCategory, address, geoLat, and geoLng are required', res, 400);
    }
    
    if (hubmanagerCategory === 'intermediate' && !mainHubManagerId) {
        console.log('[createHubManager] Validation failed: mainHubManagerId required for intermediate');
        return error('mainHubManagerId is required for intermediate hub managers', res, 400);
    }
    
    if (hubmanagerCategory === 'main' && mainHubManagerId) {
        console.log('[createHubManager] Validation failed: mainHubManagerId not allowed for main');
        return error('mainHubManagerId should not be provided for main hub managers', res, 400);
    }

    try {
        console.log('[createHubManager] Checking for verified OTP');
        const verifiedOTP = await prisma.oTP.findFirst({
            where: {
                email,
                verified: 'true'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log('[createHubManager] Verified OTP found:', !!verifiedOTP);

        if (!verifiedOTP) {
            console.log('[createHubManager] Email not verified');
            return error('Email not verified. Please verify OTP first.', res, 400);
        }

        console.log('[createHubManager] Checking for existing hub manager with email:', email);
        const existingManager = await prisma.hubManager.findUnique({
            where: { email }
        });
        console.log('[createHubManager] Existing manager found:', !!existingManager);

        if (existingManager) {
            console.log('[createHubManager] Hub manager already exists with email:', email);
            return error('Hub manager with this email already exists', res, 400);
        }

        console.log('[createHubManager] Checking for existing phone:', phone);
        const existingPhone = await prisma.hubManager.findUnique({
            where: { phone }
        });
        console.log('[createHubManager] Existing phone found:', !!existingPhone);

        if (existingPhone) {
            console.log('[createHubManager] Phone number already exists:', phone);
            return error('Hub manager with this phone number already exists', res, 400);
        }

        if (mainHubManagerId) {
            console.log('[createHubManager] Validating main hub manager ID:', mainHubManagerId);
            const mainHub = await prisma.hubManager.findUnique({
                where: { id: mainHubManagerId }
            });
            console.log('[createHubManager] Main hub found:', !!mainHub);

            if (!mainHub) {
                console.log('[createHubManager] Main hub manager not found:', mainHubManagerId);
                return error(`Main hub manager with ID ${mainHubManagerId} does not exist`, res, 400);
            }

            if (mainHub.hubmanagerCategory !== 'main') {
                console.log('[createHubManager] Referenced hub is not main category:', mainHub.hubmanagerCategory);
                return error('The referenced hub manager must be of category "main"', res, 400);
            }
        }

        console.log('[createHubManager] Generating authentication token');
        const token = crypto.randomBytes(32).toString('hex');

        console.log('[createHubManager] Inserting new hub manager');
        const newHubManager = await prisma.hubManager.create({
            data: {
                name,
                email,
                phone,
                token,
                address,
                geoLat,
                geoLng,
                hubmanagerCategory,
                mainHubManagerId: mainHubManagerId || null
            }
        });
        console.log('[createHubManager] Hub manager created, ID:', newHubManager.id);

        console.log('[createHubManager] Sending success response');
        res.status(201).json({
            success: true,
            message: 'Hub manager created successfully',
            data: newHubManager
        });
    } catch (err) {
        console.error('[createHubManager] Error:', err.message, err.stack);
        error(err.message || err.toString(), res);
    }
}

export const createDriverManager = async (req, res) => {
    console.log('[createDriverManager] Function entry');
    const { name, email, phone, category, address, geoLat, geoLng, hubmanagerId } = req.body;
    console.log('[createDriverManager] Request body:', { name, email, phone, category, address, geoLat, geoLng, hubmanagerId });
    
    if (!name || !email || !phone || !category || !address || !geoLat || !geoLng || !hubmanagerId) {
        console.log('[createDriverManager] Validation failed: Missing required fields');
        return error('name, email, phone, category, address, geoLat, geoLng, and hubmanagerId are required', res, 400);
    }

    try {
        console.log('[createDriverManager] Checking for verified OTP for email:', email);
        const verifiedOTP = await prisma.oTP.findFirst({
            where: {
                email,
                verified: 'true'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log('[createDriverManager] Verified OTP found:', !!verifiedOTP);

        if (!verifiedOTP) {
            console.log('[createDriverManager] Email not verified');
            return error('Email not verified. Please verify OTP first.', res, 400);
        }

        console.log('[createDriverManager] Checking for existing driver manager with email:', email);
        const existingManager = await prisma.driverManager.findUnique({
            where: { email }
        });
        console.log('[createDriverManager] Existing manager found:', !!existingManager);

        if (existingManager) {
            console.log('[createDriverManager] Driver manager already exists with email:', email);
            return error('Driver manager with this email already exists', res, 400);
        }

        console.log('[createDriverManager] Generating authentication token');
        const token = crypto.randomBytes(32).toString('hex');

        console.log('[createDriverManager] Inserting new driver manager');
        const newDriverManager = await prisma.driverManager.create({
            data: {
                name,
                email,
                phone,
                hubmanagerId,
                token,
                address,
                geoLat,
                geoLng,
                category,
                status: 'available'
            }
        });
        console.log('[createDriverManager] Driver manager created, ID:', newDriverManager.id);

        console.log('[createDriverManager] Sending success response');
        res.status(201).json({
            success: true,
            message: 'Driver manager created successfully',
            data: newDriverManager
        });
    } catch (err) {
        console.error('[createDriverManager] Error:', err.message, err.stack);
        error(err.message, res);
    }
}

export const getHubManagerProfileInfo = async (req, res) => {
    console.log('[getHubManagerProfileInfo] Function entry');
    try {
        const manager = req.manager;
        console.log('[getHubManagerProfileInfo] Manager ID:', manager?.id);
        console.log('[getHubManagerProfileInfo] Sending profile data');
        res.status(200).json({
            success: true,
            data: manager
        });
    } catch (err) {
        console.error('[getHubManagerProfileInfo] Error:', err.message, err.stack);
        error(err.message, res);
    }
}

export const getDriverManagerProfileInfo = async (req, res) => {
    console.log('[getDriverManagerProfileInfo] Function entry');
    try {
        const manager = req.manager;
        console.log('[getDriverManagerProfileInfo] Manager ID:', manager?.id);
        console.log('[getDriverManagerProfileInfo] Sending profile data');
        res.status(200).json({
            success: true,
            data: manager
        });
    } catch (err) {
        console.error('[getDriverManagerProfileInfo] Error:', err.message, err.stack);
        error(err.message, res);
    }
}

export const getAllHubManagers = async (req, res) => {
    console.log('[getAllHubManagers] Function entry');
    try {
        console.log('[getAllHubManagers] Fetching all main hub managers');
        const managers = await prisma.hubManager.findMany({
            where: {
                hubmanagerCategory: 'main'
            }
        });
        console.log('[getAllHubManagers] Hub managers found:', managers.length);
        
        console.log('[getAllHubManagers] Sending success response');
        res.status(200).json({
            success: true,
            data: managers
        });
    } catch (err) {
        console.error('[getAllHubManagers] Error:', err.message, err.stack);
        error(err.message, res);
    }
}

export const getAllIntermediateHubManagers = async (req, res) => {
    console.log('[getAllIntermediateHubManagers] Function entry');
    try {
        console.log('[getAllIntermediateHubManagers] Fetching all intermediate hub managers');
        const managers = await prisma.hubManager.findMany({
            where: {
                hubmanagerCategory: 'intermediate'
            }
        });
        console.log('[getAllIntermediateHubManagers] Hub managers found:', managers.length);
        
        console.log('[getAllIntermediateHubManagers] Sending success response');
        res.status(200).json({
            success: true,
            data: managers
        });
    } catch (err) {
        console.error('[getAllIntermediateHubManagers] Error:', err.message, err.stack);
        error(err.message, res);
    }
}