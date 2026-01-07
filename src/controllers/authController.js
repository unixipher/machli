import { drizzle } from '../drizzle/index.js';
import { hubManager, driverManager, otp } from '../drizzle/schema.js';
import { error } from '../middleware/middleware.js';
import { eq, and, gt, desc } from 'drizzle-orm';
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
    const { email } = req.body;
    
    if (!email) {
        return error('Email is required', res, 400);
    }

    try {
        const [existingHubManager] = await drizzle
            .select()
            .from(hubManager)
            .where(eq(hubManager.email, email))
            .limit(1);

        const [existingDriverManager] = await drizzle
            .select()
            .from(driverManager)
            .where(eq(driverManager.email, email))
            .limit(1);

        const userExists = existingHubManager || existingDriverManager;

        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await drizzle
            .insert(otp)
            .values({
                email,
                otp: otpCode,
                verified: 'false',
                expiresAt
            });

        await sendOTP(email, otpCode);

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
        error(err.message, res);
    }
};

export const verifyOTP = async (req, res) => {
    const { email, otp: userOTP } = req.body;

    if (!email || !userOTP) {
        return error('Email and OTP are required', res, 400);
    }

    try {
        const [otpRecord] = await drizzle
            .select()
            .from(otp)
            .where(
                and(
                    eq(otp.email, email),
                    eq(otp.otp, userOTP),
                    eq(otp.verified, 'false'),
                    gt(otp.expiresAt, new Date())
                )
            )
            .orderBy(desc(otp.createdAt))
            .limit(1);

        if (!otpRecord) {
            return error('Invalid or expired OTP', res, 400);
        }

        await drizzle
            .update(otp)
            .set({ verified: 'true' })
            .where(eq(otp.id, otpRecord.id));

        const [existingHubManager] = await drizzle
            .select()
            .from(hubManager)
            .where(eq(hubManager.email, email))
            .limit(1);

        const [existingDriverManager] = await drizzle
            .select()
            .from(driverManager)
            .where(eq(driverManager.email, email))
            .limit(1);

        if (existingHubManager) {
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
        error(err.message, res);
    }
};


export const createHubManager = async (req, res) => {
    const { name, email, phone, hubmanagerCategory, mainHubManagerId, address, geoLat, geoLng } = req.body;
    
    if (!name || !email || !phone || !hubmanagerCategory || !address || !geoLat || !geoLng) {
        return error('name, email, phone, hubmanagerCategory, address, geoLat, and geoLng are required', res, 400);
    }
    
    if (hubmanagerCategory === 'intermediate' && !mainHubManagerId) {
        return error('mainHubManagerId is required for intermediate hub managers', res, 400);
    }
    
    if (hubmanagerCategory === 'main' && mainHubManagerId) {
        return error('mainHubManagerId should not be provided for main hub managers', res, 400);
    }

    try {
        const [verifiedOTP] = await drizzle
            .select()
            .from(otp)
            .where(
                and(
                    eq(otp.email, email),
                    eq(otp.verified, 'true')
                )
            )
            .orderBy(desc(otp.createdAt))
            .limit(1);

        if (!verifiedOTP) {
            return error('Email not verified. Please verify OTP first.', res, 400);
        }

        const [existingManager] = await drizzle
            .select()
            .from(hubManager)
            .where(eq(hubManager.email, email))
            .limit(1);

        if (existingManager) {
            return error('Hub manager with this email already exists', res, 400);
        }

        const token = crypto.randomBytes(32).toString('hex');

        const [newHubManager] = await drizzle
            .insert(hubManager)
            .values({
                name,
                email,
                phone,
                token,
                address,
                geoLat,
                geoLng,
                hubmanagerCategory,
                mainHubManagerId: mainHubManagerId || null
            })
            .returning();

        res.status(201).json({
            success: true,
            message: 'Hub manager created successfully',
            data: newHubManager
        });
    } catch (err) {
        error(err.message, res);
    }
}

export const createDriverManager = async (req, res) => {
    const { name, email, phone, category, address, geoLat, geoLng, hubmanagerId } = req.body;
    
    if (!name || !email || !phone || !category || !address || !geoLat || !geoLng || !hubmanagerId) {
        return error('name, email, phone, category, address, geoLat, geoLng, and hubmanagerId are required', res, 400);
    }

    try {
        const [verifiedOTP] = await drizzle
            .select()
            .from(otp)
            .where(
                and(
                    eq(otp.email, email),
                    eq(otp.verified, 'true')
                )
            )
            .orderBy(desc(otp.createdAt))
            .limit(1);

        if (!verifiedOTP) {
            return error('Email not verified. Please verify OTP first.', res, 400);
        }

        const [existingManager] = await drizzle
            .select()
            .from(driverManager)
            .where(eq(driverManager.email, email))
            .limit(1);

        if (existingManager) {
            return error('Driver manager with this email already exists', res, 400);
        }

        const token = crypto.randomBytes(32).toString('hex');

        const [newDriverManager] = await drizzle
            .insert(driverManager)
            .values({
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
            })
            .returning();

        res.status(201).json({
            success: true,
            message: 'Driver manager created successfully',
            data: newDriverManager
        });
    } catch (err) {
        error(err.message, res);
    }
}

export const getHubManagerProfileInfo = async (req, res) => {
    try {
        const manager = req.manager;
        res.status(200).json({
            success: true,
            data: manager
        });
    } catch (err) {
        error(err.message, res);
    }
}

export const getDriverManagerProfileInfo = async (req, res) => {
    try {
        const manager = req.manager;
        res.status(200).json({
            success: true,
            data: manager
        });
    } catch (err) {
        error(err.message, res);
    }
}

export const getAllHubManagers = async (req, res) => {
    try {
        const managers = await drizzle
            .select()
            .from(hubManager)
            .where(eq(hubManager.hubmanagerCategory, 'main'));
        
        res.status(200).json({
            success: true,
            data: managers
        });
    } catch (err) {
        error(err.message, res);
    }
}