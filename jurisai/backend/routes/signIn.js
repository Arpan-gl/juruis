import { userModel } from "../models/user.models.js";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/",async (req,res) => {
    try {
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({success:false,message:"Please fill all the fields"});
        }

        const userExist = await userModel.findOne({email:email});

        if (!userExist){
            return res.status(400).json({success:false,message:"User does not exist"});
        }

        const verifyPassword = await bcrypt.compare(password,userExist.password);

        if (!verifyPassword) return res.status(400).json({success:false,message:"Please provide valid password"});

        const token = jwt.sign({id:userExist._id},"4c1e7f6b9a6e3d1c0b8f5e4a7c2d9f8a0e1b3c7a5d6f9e8b1c3d0f7a2b6c4e9d",{expiresIn:"1d"});

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only secure in production
        }

        // Return user object without password
        const userResponse = {
            _id: userExist._id,
            username: userExist.username,
            email: userExist.email,
            role: userExist.role,
            isActive: userExist.isActive,
            createdAt: userExist.createdAt,
            lastLogin: userExist.lastLogin
        };
                
        return res.cookie("token",token,options).status(200).json({
            success: true,
            message: "user sign in successfully",
            user: userResponse,
            token: token
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"User not sign in"});
    }
})

export default router;