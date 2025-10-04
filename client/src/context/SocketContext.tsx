"use client"

import { createContext, use, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client"
import { chat_service, useAppData } from "./AppContext";


interface SocketContextType {
    socket: Socket | null;
    onlineUsers: string[];
    //setSocket: React.Dispatch<React.SetStateAction<Socket | null>>;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    onlineUsers: [],
    //setSocket: () => {}
});

interface ProviderProps {
    children: React.ReactNode;
}

export const SocketProvider = ({ children }: ProviderProps) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const { user } = useAppData();

    useEffect(() => {
        if (!user?._id) return;
        const newSocket = io(chat_service, {
            query: {
                userId: user?._id
            }
        })

        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (users: string[]) => {
            setOnlineUsers(users);
        })

        return () => {
            newSocket.disconnect();
        }
    }, [user?._id])


    return (
        <SocketContext.Provider value={{
            socket,
            onlineUsers,
            //setSocket
        }}>
            {children}
        </SocketContext.Provider>
    )
}

export const SocketData = () => useContext(SocketContext);