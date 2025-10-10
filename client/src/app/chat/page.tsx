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
import ChatMessages from '@/components/ChatMessages'
import MessageInput from '@/components/MessageInput'
import { SocketData } from '@/context/SocketContext'
import { text } from 'stream/consumers'

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

  const { onlineUsers, socket } = SocketData();



  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [message, setMessage] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
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
    try {
      const { data } = await axios.get(`${chat_service}/api/v1/chats/message/${selectedUser}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setMessages(data.messages);
      setUser(data.otherUser);

      await fetchUserChats?.();

    } catch (error) {
      console.log(error);
      toast.error('Failed to load messages')
    }
  }

  const moveChatToTop = (chatId: string, newMessage: any, updatedUnseenCount = true) => {

    if (!setChats) return;
    setChats((prevChats) => {
      if (!prevChats) return null;

      const updatedChats = [...prevChats];
      const chatIndex = updatedChats.findIndex((chat) => chat._id === chatId);

      if (chatIndex !== -1) {
        const [moveChat] = updatedChats.splice(chatIndex, 1);

        const updatedChat = {
          ...moveChat,
          chat: {
            ...moveChat.chat,
            latestMessage: {
              text: newMessage.text,
              sender: newMessage.sender,
            },
            updatedAt: new Date().toString(),

            unSeenCount: updatedUnseenCount && newMessage.sender !== loggedInUser?._id
              ? (moveChat.chat.unseenCount || 0) + 1 : moveChat.chat.unseenCount || 0
          }
        };

        updatedChats.unshift(updatedChat);
      }

      return updatedChats;
    });

  };


  const resetUnseenCount = (chatId: string) => {
    if (!setChats) return;
    setChats((prevChats) => {
      if (!prevChats) return null;

      return prevChats.map((chat) => {
        if (chat.chat._id === chatId) {
          return {
            ...chat,
            chat: {
              ...chat.chat,
              unSeenCount: 0,
            },
          };
        }
        return chat;
      });
    });
  }

  async function createChat(u: User) {
    try {
      const token = Cookies.get('token')
      const { data } = await axios.post(`${chat_service}/api/v1/chats/new`, {
        userId:
          loggedInUser?._id, otherUserId: u._id
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSelectedUser(data.chatId);
      setShowAllUsers(false);
      await fetchUserChats?.()

    } catch (error) {
      toast.error('Failed to start chat')
    }
  }

  const handleMessageSend = async (e: any, imageFile?: File | null) => {
    e.preventDefault()

    if (!message.trim() && !imageFile) return

    if (!selectedUser) return

    //Socket work
    if (typingTimeOut) {
      clearTimeout(typingTimeOut)
      setTypingTimeOut(null)
    }

    socket?.emit("stopTyping", {
      chatId: selectedUser,
      userId: loggedInUser?._id,
    })

    const token = Cookies.get('token')

    try {
      const formData = new FormData()
      formData.append('chatId', selectedUser)

      if (message.trim()) {
        formData.append("text", message)
      }

      if (imageFile) {
        formData.append("image", imageFile)
      }

      const { data } = await axios.post(`${chat_service}/api/v1/chats/message`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      })

      setMessages((prev) => {
        const currentMessages = prev || []
        const messageExists = currentMessages.some(
          (msg) => msg._id === data.message._id
        );

        if (!messageExists) {
          return [...currentMessages, data.message]
        }
        return currentMessages;
      });

      setMessage('');

      const displayText = imageFile ? "Image" : message

      moveChatToTop(
        selectedUser!,
        {
          text: displayText,
          sender: data.sender,
          _id: data.message._id,
        },
        false
      )

    } catch (error: any) {
      toast.error(error.response.data.message)
    }
  }

  const handleTyping = (value: string) => {
    setMessage(value)
    if (!selectedUser || !socket) return

    //socket setup
    if (value.trim()) {
      socket.emit("typing", {
        chatId: selectedUser,
        userId: loggedInUser?._id,
      })
    }

    if (typingTimeOut) {
      clearTimeout(typingTimeOut)
    }

    const timeout = setTimeout(() => {
      socket.emit("stopTyping", {
        chatId: selectedUser,
        userId: loggedInUser?._id,
      })
    }, 2000)

    setTypingTimeOut(timeout)
  }

  useEffect(() => {

    socket?.on("newMessage", (message) => {
      console.log("newMessage event received:", message);

      if (selectedUser === message.chatId) {
        setMessages((prev) => {
          const currentMessages = prev || []
          const messageExists = currentMessages.some(
            (msg) => msg._id === message._id
          );

          if (!messageExists) {
            return [...currentMessages, message]
          }
          return currentMessages;
        });
         moveChatToTop(message.chatId, message, false);
      } else {
        moveChatToTop(message.chatId, message, true);
      }
    });

    socket?.on("messagesSeen", (data) => {
      console.log("Message seen by:", data);

      if (selectedUser === data.chatId) {
        setMessages((prev) => {
          if (!prev) return [];
          return prev.map((msg) => {
            if (msg.sender === loggedInUser?._id && data.messageIds && data.messageIds.includes(msg._id)) {
              return {
                ...msg,
                seen: true,
                seenAt: new Date().toString()
              };
            } else if (msg.sender === loggedInUser?._id && !data.messageIds) {
              return {
                ...msg,
                seen: true,
                seenAt: new Date().toString()
              };
            }
            return msg;
          });
        });
      }
    })

    socket?.on("userTyping", (data: { chatId: string; userId: string }) => {
      console.log("userTyping event received:", data);
      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) {
        setIsTyping(true)
      }
    })

    socket?.on("userStoppedTyping", (data: { chatId: string; userId: string }) => {
      console.log("userStoppedTyping event received:", data);
      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) {
        setIsTyping(false)
      }
    })

    return () => {
      socket?.off("newMessage")
      socket?.off("messagesSeen")
      socket?.off("userTyping")
      socket?.off("userStoppedTyping")
    }
  }, [selectedUser, socket, setChats, loggedInUser?._id])


  useEffect(() => {
    if (selectedUser) {
      fetchChat();
      setIsTyping(false);

      resetUnseenCount(selectedUser);

      socket?.emit("joinChat", selectedUser);

      return () => {
        socket?.emit("leaveChat", selectedUser);
        setMessages([]);
      }
    }
  }, [selectedUser, socket]);


  useEffect(() => {
    return () => {
      if (typingTimeOut) {
        clearTimeout(typingTimeOut)
      }
    }
  }, [])

  //console.log(user)

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
        onlineUsers={onlineUsers}
      />
      <div className='flex-1 flex flex-col justify-between 
      p-4 backdrop-blur-xl bg-white/5 border-1 border-white/10'>
        <ChatHeader
          user={user}
          setSidebarOpen={setSidebarOpen}
          isTyping={isTyping}
          onlineUsers={onlineUsers}
        />
        <ChatMessages
          selectedUser={selectedUser}
          messages={messages}
          loggedInUser={loggedInUser}
        />
        <MessageInput
          selectedUser={selectedUser}
          message={message}
          setMessage={handleTyping}
          handleMessageSend={handleMessageSend}
        />
      </div>
    </div>
  )
}

export default ChatApp