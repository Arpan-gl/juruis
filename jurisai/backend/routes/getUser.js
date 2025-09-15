import express from "express";
import {userModel} from "../models/user.models.js";
import {verifyUser} from "../middleware.js";

const router = express.Router();

router.get("/",verifyUser,async (req, res) => {
    try {
        const user = req.user;

        if (!user) return res.status(401).json({success:false,message: "user Unauthorized, Please do sign in"});

        const userId = user._id;

        const userDetails = await userModel.findById(userId).select("-password");

        if (!userDetails) return res.status(404).json({success:false,message: "User not found"});

        return res.status(200).json({success:true,message: "User details fetched successfully",data:userDetails});
    } catch (error) {
        console.error(error);
        return res.status(500).json({success:false,message: "Something went wrong in getting user details"});
    }
});

export default router;