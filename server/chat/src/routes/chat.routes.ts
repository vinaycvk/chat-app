import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import {
    createNewChat, 
    getAllChats,
    sendMessage,
    getMessagesByChatId
} from '../controllers/chat.controller.js';
import { upload } from '../middlewares/multer.js';

const router = express.Router();


router.post('/new', isAuth, createNewChat);
router.get('/all', isAuth, getAllChats);
router.post('/message', isAuth, upload.single('image'), sendMessage);
router.get('/message/:chatId', isAuth, getMessagesByChatId)

export default router;