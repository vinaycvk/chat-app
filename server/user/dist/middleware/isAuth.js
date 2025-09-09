import jwt, {} from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'asdfllaldfnjlnjn';
export const isAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Autherization heading is missing' });
        return;
    }
    const token = authHeader.split(" ")[1];
    console.log("Token:", token);
    if (!token) {
        res.status(401).json({ message: 'Not authenticated.' });
        return;
    }
    const decodedToken = jwt.verify(token, JWT_SECRET);
    console.log("Decoded Token:", decodedToken);
    console.log("Decoded Token User:", decodedToken.user);
    if (!decodedToken || !decodedToken.user) {
        res.status(401).json({ message: 'Token is missing from the authorization header.' });
        return;
    }
    req.user = decodedToken.user;
    next();
};
//# sourceMappingURL=isAuth.js.map