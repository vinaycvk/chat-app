import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'asdfllaldfnjlnjn';
export const generateToken = (user) => {
    return jwt.sign({ user }, JWT_SECRET, { expiresIn: '15d' });
};
//# sourceMappingURL=generateToken.js.map