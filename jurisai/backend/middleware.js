import jwt from 'jsonwebtoken';
import {userModel} from './models/user.models.js';

const verifyUser = async (req,res,next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        
        if(!token){
            return res.status(401).json({success:false,message: 'Unauthorized user'});
        } 

        const verifyToken = jwt.verify(token,"4c1e7f6b9a6e3d1c0b8f5e4a7c2d9f8a0e1b3c7a5d6f9e8b1c3d0f7a2b6c4e9d");

        const user = await userModel.findById(verifyToken.id).select('-password');

        if(!user) return res.status(401).json({success:false,message: 'Unauthorized user data'});

        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({success:false,message: 'Unauthorized user'});
    }
}

export { verifyUser };