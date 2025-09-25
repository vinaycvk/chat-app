"use client"
import Loading from '@/components/Loading'
import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { chat_service, useAppData, User } from '@/context/AppContext'
import ChatSideBar from '@/components/ChatSideBar'
import toast from 'react-hot-toast'
import axios from 'axios'
import Cookies from 'js-cookie'
import ChatHeader from '@/components/ChatHeader'

export interface Message {
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  };
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: string;
  createdAt: string;
}


const ChatApp = () => {
  const {     
    loading,
    isAuth,
    logoutUser,
    chats,
    user: loggedInUser,
    fetchUserChats,
    setChats,
    users,
    setUsers    
  } = useAppData()

  const [selectedUser, setSelectedUser ] = useState<string | null>(null)
  const [message, setMessage] = useState<string>('')
  const [messages, setMessages ] = useState<Message[]>([])
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>(null)
  const [showAllUsers, setShowAllUsers] = useState<boolean>(false)
  //const [users, setUsers] = useState<User[] | null>(null)
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [typingTimeOut, setTypingTimeOut] = useState<NodeJS.Timeout | null>(null)


  const router = useRouter()

  useEffect(() => {
    if (!isAuth && !loading) {
      router.push('/login')
    }
  }, [isAuth, loading, router])


  
  const handleLogout = () => logoutUser?.()

  async function fetchChat() {
    const token = Cookies.get('token')
    try{
      const {data} = await axios.get(`${chat_service}/api/v1/chats/message/${selectedUser}`,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setMessages(data.messages);
      setUser(data.user);

      await fetchUserChats?.();
        
    } catch(error){
      console.log(error);
      toast.error('Failed to load messages')
    }

  }

  async function createChat(u:User) {
    try{
      const token = Cookies.get('token')
      const {data} =await axios.post(`${chat_service}/api/v1/chats/new`,{userId: 
        loggedInUser?._id, otherUserId: u._id
      },{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSelectedUser(data.chatId);
      setShowAllUsers(false);
      await fetchUserChats?.()

    }catch(error){
      toast.error('Failed to start chat')
    }
  }


  useEffect(() => {
    if (selectedUser){
      fetchChat()
    }
  },[selectedUser])

  return (
    <div className='min-h-screen flex bg-gray-900
    text-white relative overflow-hidden'>
      <ChatSideBar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        showAllUsers={showAllUsers}
        setShowAllUsers={setShowAllUsers}
        users={users ?? null}
        loggedInUser={loggedInUser}
        chats={chats ?? null}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleLogout={handleLogout}
        createChat={createChat}        
      />
      <div className='flex-1 flex flex-col justify-between 
      p-4 backdrop-blur-xl bg-white/5 border-1 border-white/10'>
        <ChatHeader />
      </div>
    </div>
  )
}

export default ChatApp