import { Server, Socket } from 'socket.io';
import http from 'http';
import express from 'express';


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

const userSocketMap: Record<string, string> = {};

io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    const userId = socket.handshake.query.userId as string | undefined;

    if (userId && userId !== 'undefined'){
        userSocketMap[userId] = socket.id;
        console.log(`User ${userId} connected with socket ID: ${socket.id}`);
    }

    io.emit("getOnlineUser", Object.keys(userSocketMap));

    if(userId){
        socket.join(userId);
    }

    socket.on("typing", (data) => {
        console.log(`User ${data.userId} is typing in chat ${data.chatId}`)
        socket.to(data.chatId).emit("userTyping", {
            chatId: data.chatId,
            userId: data.userId,
        });
    })

    socket.on("stopTyping", (data) => {
        console.log(`User ${data.userId} stopped typing in chat ${data.chatId}`)
        socket.to(data.chatId).emit("userStoppedTyping", {
            chatId: data.chatId,
            userId: data.userId,
        });
    })

    socket.on("leaveChat", (chatId) => {
        socket.leave(chatId)
        console.log(`User ${userId} left chat room ${chatId}`)
    })

    socket.on('joinChat', (chatId) => {
        socket.join(chatId)
        console.log(`User ${userId} joined chat room ${chatId}`)
    })

    socket.on("disconnect", () => {
        console.log('User disconnected:', socket.id);
        // delete userSocketMap[socket.id];
        if(userId){
            delete userSocketMap[userId];
            console.log(`User ${userId} disconnected with socket ID: ${socket.id}`);
            io.emit("getOnlineUser", Object.keys(userSocketMap));
        }
    });

    socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
    })
})


export { app, server, io };