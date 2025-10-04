"Use client"
import { Message } from '@/app/chat/page';
import { User } from '@/context/AppContext';
import React, { useEffect, useMemo, useRef } from 'react';
import moment from 'moment';
import { Check, CheckCheck } from 'lucide-react';

interface ChatMessagesProps {
    selectedUser: string | null;
    messages: Message[] | null;
    loggedInUser: User | null;     
}


const ChatMessages = ({
    selectedUser,
    messages,
    loggedInUser
}: ChatMessagesProps) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    //seen feature
    const uniqueMessages = useMemo(() => {
      if (!messages) return []
      const seen = new Set()
      return messages.filter((message) => {
         if (seen.has(message._id)) {
          return false
         }
         seen.add(message._id)
         return true
      })      
    },[messages])

    useEffect(()=> {
        bottomRef.current?.scrollIntoView({behavior: "smooth"})
    },[selectedUser, uniqueMessages])

    

  return (
    <div className='flex-1 overflow-hidden'>
      <div className='h-full max-h-[calc(100vh-215px)] overflow-y-auto p-2 space-y-2 custom-scroll'>
          {
            !selectedUser ? <p className='text-gray-400 text-center mt-20'>
              Select a conversation to start messaging
            </p> : (
            <>
            {
              uniqueMessages.map((e,i)=> {
                const isSentByMe = e.sender === loggedInUser?._id;
                const uniqueKey = `${e._id}-${i}`
                //console.log(e.sender)
                //console.log(loggedInUser?._id)
                
                return (
                  <div key={uniqueKey} className={`flex flex-col gap-1 mt-2 ${isSentByMe ? "items-end" : "items-start"}`}>
                    <div className={`rounded-lg p-3 max-w-sm ${
                      isSentByMe 
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-white"
                    }`}>{
                      e.messageType === "image" && e.image && (
                        <div className='relative group'>
                          <img src={e.image.url} alt="Shared Image" 
                          className='max-w-full h-auto rounded-lg'/>
                        </div>
                      )
                    }
                      {e.text && <p>{e.text}</p>}
                      </div>
                      <div className={`flex items-center gap-1 text-xs text-gray-400 ${
                        isSentByMe ? "pr-2 flex-row-reverse" : "pl-2 "
                      }
                      `}>
                          <span >{moment(e.createdAt).format("hh:mm A . MMM D")} </span> 
                          {
                            isSentByMe && <div>
                              {
                                e.seen ? <div className='flex items-center gap-1 
                                text-blue-400'>
                                  <CheckCheck  className='w-3 h-3'/>
                                   {
                                    e.seenAt && <span>{moment(e.seenAt).format("hh:mm A . MMM D")}</span>
                                   }
                                </div> : <Check className='w-3 h-3 text-gray-500'/>
                              }
                            </div>
                          }
                      </div>
                  </div>
                )
              })
            }
            <div ref={bottomRef}/>
            </>
            )
          }
      </div>
    </div>
  )
}

export default ChatMessages