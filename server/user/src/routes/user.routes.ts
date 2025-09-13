import express from 'express';
import {
    loginUser,
    verifyOTP,
    myProfile,
    updateName,
    getAllUsers,
    getUserById
} from '../controllers/user.controller.js';
import { isAuth } from '../middleware/isAuth.js';



const router = express.Router();

router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.get('/me', isAuth, myProfile);
router.get('/', isAuth, getAllUsers);
router.get('/:id', getUserById);
router.put('/update', isAuth, updateName);


export default router;