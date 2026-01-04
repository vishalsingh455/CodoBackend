import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.model.js'

const registerUser = async (req, res) => {
    try {
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
            httpOnly: true,   // JS cannot access
            secure: false,    // true in production (HTTPS)
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
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
        res.clearCookie("token")
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

export {registerUser, loginUser, logoutUser}