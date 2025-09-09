import express from 'express';
import { loginUser, verifyOTP, myProfile } from '../controllers/user.controller.js';
import { isAuth } from '../middleware/isAuth.js';
const router = express.Router();
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.get('/me', isAuth, myProfile);
export default router;
//# sourceMappingURL=user.routes.js.map