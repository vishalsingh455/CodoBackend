import jwt from 'jsonwebtoken';

const authUserMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token
        if(!token) {
            return res
            .status(401)
            .json({
                success:false,
                message:"Unauthorized access"
            })
        }
    
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // {id}
        req.user = decoded
        next();
    } catch (error) {
        return res
        .status(401)
        .json({
            success:false,
            message:"Invalid or expired token"
        })
    }
}

export default authUserMiddleware