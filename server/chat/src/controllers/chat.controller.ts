import TryCatch from "../config/TryCatch.js"
import type { AuthenticatedRequest } from "../middlewares/isAuth.js"
import { Chat } from "../models/Chat.js"
import { Message } from "../models/messages.js"
import axios from "axios";


export const createNewChat = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;

    const { otherUserId } = req.body;

    if (!otherUserId) {
        res.status(400).json({ message: "otherUserId is required" });
        return;
    }

    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const existingChat = await Chat.findOne({
        users: { $all: [userId, otherUserId], $size: 2 }
    });

    if (existingChat) {
        res.status(200).json({
            message: "Chat already exists",
            chatId: existingChat._id
        });
        return;
    }

    const newChat = await Chat.create({
        users: [userId, otherUserId],
    });

    res.status(201).json({ message: "Chat created successfully", chatId: newChat?._id });
});

export const getAllChats = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;

    if (!userId) {
        res.status(401).json({ message: "User ID not found" });
        return;
    }

    const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });

    const chatWithUserDetails = await Promise.all(chats.map(async (chat) => {
        const otherUserId = chat.users.find(id => id.toString() !== userId.toString());

        const unSeenMessagesCount = await Message.countDocuments({
            chatId: chat._id,
            sender: { $ne: userId },
            seen: false
        });

        try {
            const { data } = await axios.get(
                `${process.env.USER_SERVICE}/api/v1/users/${otherUserId}`
            );

            return {
                user: data,
                chat: {
                    ...chat.toObject(),
                    latestMessage: chat.latestMessage || null,
                    unSeenMessagesCount
                }
            }
        } catch (error) {
            console.log(error);
            return {
                user: { _id: otherUserId, name: "Unknown", email: "unknown" },
                chat: {
                    ...chat.toObject(),
                    latestMessage: chat.latestMessage || null,
                    unSeenMessagesCount
                }
            }
        }
    }));


    res.status(200).json({
        chats: chatWithUserDetails
    });
});


export const sendMessage = TryCatch(async (req: AuthenticatedRequest, res) => {
    const senderId = req.user?._id;
    const { chatId, text } = req.body;
    const imageFile = req.file;

    if (!senderId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    if (!chatId) {
        res.status(400).json({ message: "chatId is required" });
        return;
    }

    if (!text && !imageFile) {
        res.status(400).json({ message: "Either text or image is required" });
        return;
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
        res.status(404).json({ message: "Chat not found" });
        return;
    }

    const isUserInChat = chat.users.some(
        (userId) => userId.toString() === senderId.toString()
    );

    if (!isUserInChat) {
        res.status(403).json({ message: "You are not a participant of this chat" });
        return;
    }

    const otherUserId = chat.users.find(
        (userId) => userId.toString() !== senderId.toString()
    );

    if (!otherUserId) {
        res.status(500).json({ message: "Other user not found in chat" });
        return;
    }

    //socket.io setup

    let messageData: any = {
        chatId,
        sender: senderId,
        seen: false,
        seenAt: undefined,
    };


    if (imageFile) {
        messageData.messageType = "image";
        messageData.text = text || "";
        messageData.image = {
            url: imageFile.path,
            public_id: imageFile.filename,
        };
    } else {
        messageData.messageType = "text";
        messageData.text = text;
    }

    const message = await Message.create(messageData);

    const savedMessage = await message.save();

    const latestMessageText = imageFile ? "Sent an image" : text;

    await Chat.findByIdAndUpdate(chatId, {
        latestMessage: {
            text: latestMessageText,
            sender: senderId,
        },
        updatedAt: new Date(),
    }, { new: true });

    //emit to sockets

    res.status(201).json({
        message: savedMessage,
        sender: senderId,
    });
}
)



export const getMessagesByChatId = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { chatId } = req.params;

    if (!chatId) {
        res.status(400).json({ message: "chatId is required" });
        return;
    }

    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
        res.status(404).json({ message: "Chat not found" });
        return;
    }

    const isUserInChat = chat.users.some(
        (id) => id.toString() === userId.toString()
    );

    if (!isUserInChat) {
        res.status(403).json({ message: "You are not a participant of this chat" });
        return;
    }

    const messagesToMarkSeen = await Message.find({
        chatId,
        sender: { $ne: userId },
        seen: false
    });

    await Message.updateMany({
        chatId,
        sender: { $ne: userId },
        seen: false
    }, {
        seen: true,
        seenAt: new Date()
    });

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

    const otherUserId = chat.users.find(id => id.toString() !== userId.toString());

    try {
        const { data } = await axios.get(
            `${process.env.USER_SERVICE}/api/v1/users/${otherUserId}`
        );

        if (!otherUserId) {
            res.status(400).json({ message: "Other user not found in chat" });
            return;
        }

        //socket work

        res.status(200).json({
            messages,
            otherUser: data,
            markedAsSeenMessageIds: messagesToMarkSeen.map(msg => msg._id)
        });
    } catch (error) {
        console.log(error);
        res.json({
            messages,
            user: { _id: otherUserId, name: "Unknown", email: "unknown" },
        })
    }
})

