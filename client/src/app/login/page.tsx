'use client'
import React from 'react'
import { ArrowRight, Mail, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import Loading from '@/components/Loading'
 


const LoginPage = () => {
    const [email, setEmail] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await axios.post(`http://localhost:5000/api/v1/users/login`,
                {
                    email
                });

            toast.success('Verification code sent to your email.');
            router.push(`/verify?email=${email}`); // Navigate to verify page with email as query param
        } catch (error: any) {
            alert(error.response.data.error.message);
        } finally {
            setLoading(false);
        }

    }

    

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
                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div>
                            <label htmlFor='email' className='block text-sm font-medium text-gray-300 mb-2'>
                                Email Address
                            </label>
                            <input
                                type='email'
                                id={email}
                                className='w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                placeholder='Enter your email address'
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type='submit'
                            className=' w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300'
                            disabled={loading}
                        >
                            {loading ? (
                                <div className='flex items-center justify-center gap-2'>
                                    <Loader2 className='w-5 h-5 animate-spin' />
                                    <span>Sending OTP...</span>
                                </div>
                            ) : (
                                <div className='flex items-center justify-center gap-2'>
                                    <span>Send Verification Code</span>
                                    <ArrowRight className='w-5 h-5' />
                                </div>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default LoginPage