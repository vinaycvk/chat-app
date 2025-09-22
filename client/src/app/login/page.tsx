import React from 'react'
import { Mail } from 'lucide-react'

const LoginPage = () => {
    return (
        <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
            <div className='max-w-md w-full'>
                <div className='bg-gray-800 border border-gray-700 rounded-lg p-8 '>
                    <div className='text-center mb-8'>
                        <div className='mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6'>
                            <Mail size={40} className='text-white' />
                        </div>
                        <h1 className='text4xl font-bold text-white mb-3'>
                            Welcome to Chat App
                        </h1>          
                        <p className='text-gray-300 text-lg'>
                            Enter your email to continue your journey with us. 
                        </p>             
                    </div>
                    <form className='space-y-6'>
                        <div>
                            <label htmlFor='email' className='block text-sm font-medium text-gray-300 mb-2'>
                                Email Address
                            </label>
                            <input
                                type='email'
                                id='email'
                                className='w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                            />                                                      
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default LoginPage