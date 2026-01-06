import jwt from 'jsonwebtoken';

const authUserMiddleware = async (req, res, next) => {
    try {
        console.log('=== AUTH MIDDLEWARE ===');
        console.log('URL:', req.method, req.originalUrl);
        console.log('Cookies:', req.cookies);
        console.log('Headers:', req.headers.authorization ? 'Has Auth Header' : 'No Auth Header');

        const token = req.cookies.token
        if (!token) {
            console.log('No token found in cookies');
            return res
                .status(401)
                .json({
                    success: false,
                    message: "Unauthorized access"
                })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // {id}
        req.user = decoded
        console.log('Token decoded successfully, user:', decoded);
        next();
    } catch (error) {
        console.log('Token verification failed:', error.message);
        return res
            .status(401)
            .json({
                success: false,
                message: "Invalid or expired token"
            })
    }
}

export default authUserMiddleware
