import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import chatRoutes from './routes/chat.routes.js';
import cors from 'cors'
import { app, server } from './config/socket.js';



dotenv.config();

connectDB();



const PORT = process.env.PORT || 5002;

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
  };

app.use(cors(corsOptions));

app.use(express.json());


app.use('/api/v1/chats', chatRoutes);


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});    