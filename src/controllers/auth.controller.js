import bcrypt from 'bcryptjs'
import crypto from "crypto";
import jwt from 'jsonwebtoken'
import { User } from '../models/User.model.js'
import connectDB from '../db/db.js'
import sendEmail from '../utils/sendEmail.js'
import { PasswordResetOTP } from '../models/PasswordResetOTP.model.js';

const registerUser = async (req, res) => {
    try {
        await connectDB();
        const {name, email, password} = req.body
        
        // validation
        if(!name || !email || !password) {
            return res
            .status(400)
            .json({
                success:false,
                message:"All fields are required"
            })
        }

        // check if user already exists
        const isUserAlreadyExists = await User.findOne({email})
        if(isUserAlreadyExists) {
            return res
            .status(400)
            .json({
                success:false,
                message:"User already registered"
            })
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // save user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        return res
        .status(201)
        .json({
            success:true,
            message:"user registered successfully..."

        })
    } catch (error) {
        return res
        .status(500)
        .json({
            success:false,
            message:"Server error while registering user"
        })
    }
}

const loginUser = async (req, res) => {
    try {
        await connectDB();
        const {email, password} = req.body
    
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }
    
        // check user exists
    
        const user = await User.findOne({email})
        if(!user) {
            return res
            .status(401)
            .json({
                success:false,
                message:"Invalid credentials"
            })
        }
    
        //compare password
        const isPasswordMatched = await bcrypt.compare(password, user.password)
        if(!isPasswordMatched) {
            return res
            .status(401)
            .json({
                success:false,
                message:"Invalid credentials"
            })
        }
    
        // create jwt token
    
        const token = jwt.sign(
            {
                id:user._id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        )

        // SET COOKIE
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,      // MUST be true for Vercel (HTTPS)
            sameSite: "none",  // MUST be "none" for cross-domain cookies
            maxAge: 24 * 60 * 60 * 1000,
            path: "/"
        });
    
        return res
        .status(200)
        .json({
            success:true,
            message:"User Login Successully",
        })
    } catch (error) {
        return res
        .status(500)
        .json({
            success:false,
            message:`Server Error while logging user ${error}`
        })
    }
}

const logoutUser = async (req, res) => {
    try {
        // res.clearCookie("token")
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/"
        });
        return res
        .status(200)
        .json({
            success:true,
            message:"User logged out successfully"
        })
    } catch (error) {
        return res
        .status(500)
        .json({
            success: true,
            message: "Server error while logout user"
        })
    }
}

const forgotPassword = async (req, res) => {
    try {
        await connectDB();
        const { email } = req.body;
        const user = await User.findOne({ email })

        // prevent email enumeration
        if (!user) {
            return res
                .status(200)
                .json({
                    success: true,
                    message: "If email exists, OTP sent"
                })
        }

        // delete old otp
        await PasswordResetOTP.deleteMany({ userId: user._id })

        // generate otp
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP
        const hashedOTP = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        await PasswordResetOTP.create({
            userId: user._id,
            otp: hashedOTP,
            expiresAt: Date.now() + 10 * 60 * 1000
        })

        await sendEmail({
            to: user.email,
            subject: "Password Reset OTP",
            html: `<h1>${otp}</h1><p>Valid for 10 minutes</p>`
        });

        res.status(200).json({
            success: true,
            message: "OTP sent"
        });
    } catch (error) {
        return res
            .status(500)
            .json({
                success: false,
                message: `Server error while forgot password ${error}}`
            })
    }
}

const resetPassword = async (req, res) => {
    try {
        await connectDB();
        const { otp, newPassword } = req.body;

        if (!otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "OTP and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // hash incoming otp
        const hashedOTP = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        // Find valid OTP
        const otpDoc = await PasswordResetOTP.findOne({
            otp: hashedOTP,
            expiresAt: { $gt: Date.now() }
        });

        if (!otpDoc) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        // Get user using userId from OTP document
        const user = await User.findById(otpDoc.userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        // Invalidate OTP after use
        await PasswordResetOTP.deleteMany({ userId: user._id });

        return res.status(200).json({
            success: true,
            message: "Password reset successful"
        });


    } catch (error) {
        return res
            .status(500)
            .json({
                success: false,
                message: "Server error while reset password"
            })
    }
}

export {registerUser, loginUser, logoutUser, forgotPassword, resetPassword}
