'use client'
import React, { useEffect, useState } from 'react'
import { User, Chats } from '@/context/AppContext'
import { CornerDownRight, CornerUpLeft, CornerUpRight , LogOut, MessageCircle, Plus, Search, CircleUserRound, X } from 'lucide-react';
import Link from 'next/link';


interface ChatSideBarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    showAllUsers: boolean;
    setShowAllUsers: (show: boolean | ((prev: boolean) => boolean)) => void;
    users: User[] | null;
    loggedInUser: User | null;
    chats: any[] | null;
    selectedUser: string | null;
    setSelectedUser: (userId: string | null) => void;
    handleLogout: () => void;
    createChat: (u: User) => void;
}

const ChatSideBar = ({
    setSidebarOpen,
    setShowAllUsers,
    showAllUsers,
    users,
    loggedInUser,
    chats,
    selectedUser,
    handleLogout,
    setSelectedUser,
    sidebarOpen,
    createChat
}: ChatSideBarProps) => {
    const [searchQuery, setSearchQuery] = useState("");



    return (
        <aside className={`fixed z-20 sm:static top-0 left-0
    w-80 bg-gray-900 border-r border-gray-700 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } sm:translate-x-0 transition-transform duration-300 flex
    flex-col`}>
            {/* Header */}
            <div className='p-6 border-b border-gray-700'>
                <div className='sm:hidden flex justify-end mb-0'>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className='p-2 bover:bg-gray-700 rounded-lg
                transition-colors'><X className='w-5 h-5 text-gray-300' />
                    </button>
                </div>

                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-blue-600 justify-between'>
                            <MessageCircle className='w-5 h-5 text-white' />
                        </div>
                        <h2 className='text-xl font-bold text-white'>
                            {showAllUsers ? "New Chat" : "Messages"}
                        </h2>
                    </div>
                    <button className={`p-2.5 rounded-lg transition-colors 
                        ${showAllUsers
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-green-600 hover:bg-green-700 text-white"}`}
                        onClick={() => {
                            setShowAllUsers(prev => !prev);
                            setSearchQuery("");
                            setSelectedUser(null);
                        }}>
                        {showAllUsers
                            ? <X className='w-4 h-4' />
                            : <Plus className='w-4 h-4' />}
                    </button>
                </div>
            </div>
            {/* content */}
            <div className='flex-1 overflow-hidden px-4 py-2'>
                {
                    showAllUsers
                        ? (<div className='space-y-4 h-full'>
                            <div className='relative'>
                                <Search className='absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-gray-400' />
                                <input
                                    type="text"
                                    placeholder='Search users...'
                                    className='w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* User List */}
                            <div className='space-y-2 overflow-y-auto h-full pb-4'>
                                {
                                    users?.filter((u) => u._id !== loggedInUser?._id && u.username
                                        .toLowerCase().includes(searchQuery.toLocaleLowerCase()))
                                        .map((u) => (
                                            <button
                                                key={u._id}
                                                className='w-full text-left p-2 rounded-lg border-gray-600 
                                            hover:bg-gray-700 flex items-center gap-3 transition-colors'
                                                onClick={() => createChat(u)}
                                            >
                                                <div className='flex items-center gap-3'>
                                                    <div className='relative'>
                                                        <CircleUserRound className='w-6 h-6 text-gray-300' />
                                                    </div>
                                                    {/* Online symbol */}
                                                    <div className='flex-1 min-w-0'>
                                                        <span className='font-medium text-white'>{u.username}</span>
                                                        <div className='text-xs text-gray-400 mt-0.5'>
                                                            {/* to show online offline text */}
                                                        </div>
                                                    </div>
                                                </div>

                                            </button>
                                        ))
                                }
                            </div>
                        </div>) : chats && chats.length > 0 ? (
                            <div className='space-y-2 overflow-y-auto h-full pb-4'>
                                {
                                    chats.map((chat) => {
                                        const latestMessage = chat.chat.latestMessage;
                                        const isSelected = selectedUser === chat.chat._id;
                                        const isSentByMe = latestMessage?.sender === loggedInUser?._id;
                                        const unSeenCount = chat.chat.unSeenCount || 0;

                                        return <button key={chat.chat._id} onClick={() => {
                                            setSelectedUser(chat.chat._id);
                                            setSidebarOpen(false);
                                        }}
                                            className={`w-full text-left p-4 rounded-lg transition-color${isSelected
                                                ? "bg-blue-600 border-blue-500"
                                                : "border border-gray-700 hover:border-gray-600"
                                                }`}
                                        >
                                            <div className='flex items-center gap-3'>
                                                <div className='relative'>
                                                    <div className='w-12 h-12 rounded-full bg-gray-700
                                                      flex items-center justify-center'>
                                                        <CircleUserRound className='w-7 h-7 text-gray-300' />
                                                        {/*online related worl*/}

                                                    </div>


                                                </div>
                                                <div className='flex-1 min-w-0'>
                                                    <div className='flex items-center justify-between mb-1'>
                                                        <span className={`font-semibold truncate ${isSelected ? "text-white" : "text-gray-200"
                                                            }`}>
                                                            {chat.user.username}
                                                        </span>
                                                        {
                                                            unSeenCount > 0 && <div className='bg-red-600 
                                                                        text-white text-xs font-bold rounded-full min-w-[22px]
                                                                        h-5.5 flex items-center justify-center px-2
                                                                        '>
                                                                {unSeenCount > 99 ? "99+" : unSeenCount}
                                                            </div>
                                                        }
                                                    </div>
                                                    {
                                                        latestMessage && <div className='flex items-center gap-2'>
                                                            {isSentByMe ? <CornerUpLeft size={14}
                                                                className='text-blue-400 text-shrink-0'
                                                            /> : <CornerDownRight size={14} className='text-green-400 text-shrink-0' />}
                                                            <span className='text-sm text-gray-400 truncate-flex-1'>{latestMessage.text}</span>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </button>
                                    })
                                }
                            </div>
                        ) : (
                            <div className='flex flex-col items-center justify-center h-full
                            text-center'>
                                <div>
                                    <MessageCircle className='w-8 h-8 text-gray-400' />
                                </div>
                                <p className='text-gray-400 font-medium'>
                                    No conversation yet
                                </p>
                                <p className='text-sm text-gray-500 mt-2'>
                                    Start a new chat to begin messaging
                                </p>
                            </div>
                        )
                }
            </div>
            {/* footer */}
            <div className='p-4 border-t border-gray-700 space-y-2'>
                <Link href={'/profile'} className='flex items-center gap-3 px-4 py-3
                    rounded-lg hover:bg-gray-800 transition-colors'>
                        <span className='p-1.5 bg-gray-700 rounded-lg'>
                            <CircleUserRound className='w-4 h-4 text-gray-300' />
                        </span>
                        <span className='font-medium text-white'>Profile</span>
                </Link>
                <button onClick={handleLogout} className='flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500 hover:text-white' >
                    <LogOut className='w-4 h-4 text-gray-300' />
                    <span className='font-medium text-white'>LogOut</span>
                </button>
            </div>
        </aside>
    )
}

export default ChatSideBar