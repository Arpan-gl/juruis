import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    try {
        return res.clearCookie("token").status(200).json({success:true,message: 'Logged out successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({success:false,message: 'Internal Server Error'});
    }
});

export default router;