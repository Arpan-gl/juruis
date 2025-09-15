import express from "express";
import { userModel } from "../models/user.models.js";
import { lawyerApplicationModel } from "../models/lawyerApplication.models.js";
import bcrypt from "bcryptjs";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { 
      username, 
      email, 
      password, 
      userType, 
      lawyerData 
    } = req.body;

    if (!username || !email || !password || !userType) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all required fields" });
    }

    // Validate user type
    if (!['user', 'lawyer'].includes(userType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user type. Must be 'user' or 'lawyer'" });
    }

    // Check if user already exists
    const userExist = await userModel.findOne({
      $or: [{ username }, { email }]
    });

    if (userExist) {
      return res
        .status(400)
        .json({ success: false, message: "Username or email already exists" });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create user with appropriate role
    const userData = {
      username,
      email,
      password: hashPassword,
      role: userType,
      uploader: []
    };

    // If registering as a lawyer, add lawyer profile
    if (userType === 'lawyer') {
      userData.lawyerProfile = {
        isVerified: false,
        verificationStatus: 'pending',
        applicationDate: new Date()
      };
    }

    const newUser = await userModel.create(userData);

    // If registering as a lawyer, create application
    if (userType === 'lawyer' && lawyerData) {
      try {
        const lawyerApplication = await lawyerApplicationModel.create({
          applicant: newUser._id,
          ...lawyerData,
          status: 'pending',
          applicationDate: new Date(),
          history: [{
            action: 'submitted',
            date: new Date(),
            notes: 'Application submitted'
          }]
        });

        console.log('Lawyer application created:', lawyerApplication._id);
      } catch (appError) {
        console.error('Error creating lawyer application:', appError);
        // Don't fail the user creation if application creation fails
      }
    }

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: userType === 'lawyer' 
        ? "Account created successfully! Your lawyer application has been submitted for review."
        : "Account created successfully!",
      data: userResponse
    });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
});

export default router;