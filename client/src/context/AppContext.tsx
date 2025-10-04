'use client'

import {
    createContext,
    ReactNode,
    useState,
    useContext,
    useEffect
} from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export const user_service = 'http://localhost:5000';
export const chat_service = 'http://localhost:5002';


export interface User {
    _id: string;
    username: string;
    email: string;
}


export interface Chat {
    _id: string;
    users: string[];
    latestMesssage: {
        text: string;
        sender: string;
    };
    createdAt: string;
    updatedAt: string;
    unseenCount: number;
}

export interface Chats {
    _id: string;
    user: User;
    chat: Chat;
}

interface AppContextType {
    user: User | null;
    loading: boolean;
    isAuth: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
    logoutUser?: () => void;
    fetchAllUsers?: () => Promise<void>;
    fetchUserChats?: () => Promise<void>;
    fetchUserData?: () => Promise<void>;
    chats?: Chats[] | null;
    users?: User[] | null;
    setChats?: React.Dispatch<React.SetStateAction<Chats[] | null>>;
    setUsers?: React.Dispatch<React.SetStateAction<User[] | null>>;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}


export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    async function fetchUserData() {
        try {
            const token = Cookies.get('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const { data } = await axios.get(`${user_service}/api/v1/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUser(data);
            setIsAuth(true);
        } catch (error) {
            console.error("Error fetching user data:", error);
            setUser(null);
            setIsAuth(false);
        } finally {
            setLoading(false);
        }
    }

    async function logoutUser() {
        Cookies.remove('token');
        setUser(null);
        setIsAuth(false);
        toast.success('Logged out successfully');
    }

    const [chats, setChats] = useState<Chats[] | null>(null);
    

    async function fetchUserChats() {
        const token = Cookies.get('token');
        try {
            const { data } = await axios.get(`${chat_service}/api/v1/chats/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            setChats(data.chats)

        }
        catch (error) {
            console.error("Error fetching chats:", error);
            setChats(null);
        }
    }

    const [users, setUsers] = useState<User[] | null>(null);
   
    
    

    async function fetchAllUsers() {
        const token = Cookies.get('token');
        try {
            const { data } = await axios.get(`${user_service}/api/v1/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(data);     

        }
        catch (error) {
            console.error("Error fetching users:", error);
            setUsers(null);
        }
    }

    useEffect(() => {
        fetchUserData();
        fetchUserChats();
        fetchAllUsers();        
    }, []);

    


    return (
        <AppContext.Provider value={{
            user,
            setUser,
            isAuth,
            setIsAuth,
            loading,
            logoutUser,
            fetchAllUsers, 
            fetchUserChats, 
            fetchUserData, 
            chats, 
            users, 
            setChats, 
            setUsers
        }} >
            {children}
            <Toaster />
        </AppContext.Provider>
    );
};

export const useAppData = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppData must be used within an AppProvider");
    }
    return context;
};