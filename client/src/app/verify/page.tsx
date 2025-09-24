"use client"
import React, { useState, useRef, useEffect } from 'react'
import { ArrowRight, Lock, Loader2 } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { useAppData } from '@/context/AppContext';
import Loading from '@/components/Loading';




const VerifyPage = () => {
    const {isAuth, setIsAuth, setUser, loading: userLoading,fetchUserChats, fetchAllUsers } = useAppData() 
    const [loading, setLoading] = useState<boolean>(false);
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [error, setError] = useState<string>('');
    const [resendLoading, setResendLoading] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(60);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const router = useRouter();


    const searchParams = useSearchParams();

    const email: string = searchParams.get('email') || '';

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);

            return () => clearInterval(interval);
        }       
    }, [timer]);

    
    const handleOtpChange = (index: number, value: string): void => {
        if(value.length > 1) {
            return;
        }
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');
        
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    
    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            
            inputRefs.current[index - 1]?.focus();
        }
    };   

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('Text');
        const digits = pasteData.replace(/\D/g, '').slice(0, 6).split('');
        if (digits.length === 6) {
            setOtp(digits);
            inputRefs.current[5]?.focus();
            setError('');
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLElement>): Promise<void> => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length < 6) {
            setError('Please enter the complete 6-digit code.');
            return;
        }
        setLoading(true);
        setError('');

        try{
            const data = await axios.post(`http://localhost:5000/api/v1/users/verify-otp`, {
               email,
               otp: otpString      
            });
            toast.success(data.data.message);
            cookies.set('token', data.data.token,{
                expires: 15,
                secure: false,
                path: '/'
            });
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();            
            setUser(data.data.user);
            setIsAuth(true);
            await fetchUserChats?.();
            await fetchAllUsers?.()
            
        } catch (err: any) {            
            setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async (): Promise<void> => {
        setResendLoading(true);
        setError('');
        try {
            const data = await axios.post(`http://localhost:5000/api/v1/users/login`, { 
                email, 
            });
            toast.success(data.data.message);
            setTimer(60);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    if (loading) return <Loading />    
    

    return (
        <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
            <div className='max-w-md w-full'>
                <div className='bg-gray-800 border border-gray-700 rounded-lg p-8 '>
                    <div className='text-center mb-8'>
                        <div className='mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6'>
                            <Lock size={40} className='text-white' />
                        </div>
                        <h1 className='text4xl font-bold text-white mb-3'>
                            Verify your Email
                        </h1>
                        <p className='text-gray-300 text-lg'>
                            We have sent a 6-digit verification code to your email address. Please enter the code below to verify your account.
                        </p>
                        <p className='text-blue-400 font-medium'>{email} </p>
                    </div>
                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div>
                            <label  className='block text-sm font-medium text-gray-300 mb-2
                            text-center'
                            >
                                Enter your 6-digit code
                            </label>
                            <div className='flex justify-center in-checked: space-x-3'>
                                {
                                    otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
                                            type='text'
                                            inputMode='numeric'
                                            maxLength={1}
                                            className='w-12 h-12 text-center text-2xl rounded-lg bg-gray-700 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            onPaste={index === 0 ? handlePaste: undefined}
                                            required
                                        />
                                    ))      
                                }
                            </div>
                            {/* <input
                                type='email'
                                // id={email}
                                className='w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                placeholder='Enter your email address'
                                // onChange={(e) => setEmail(e.target.value)}
                                required
                            /> */}
                        </div>
                        {
                            error && (
                                <p className='text-red-500 text-sm text-center'>{error}</p>
                            )
                        }
                        {
                            timer > 0 ? (
                                <p className='text-gray-400 text-sm text-center'>
                                    Resend code in <span className='font-medium'>{timer}s</span>
                                </p>
                            ) : (
                                <p className='text-gray-400 text-sm text-center'>
                                    Didn't receive the code?{' '}
                                    <button
                                        type='button'
                                        className='text-blue-500 font-medium hover:underline'
                                        onClick={handleResend}
                                        disabled={resendLoading}
                                    >
                                        {resendLoading ? 'Resending...' : 'Resend Code'}
                                    </button>
                                </p>
                            )
                        }
                        <button
                            type='submit'
                            className=' w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300'
                            disabled={loading}
                        >
                            {loading ? (
                                <div className='flex items-center justify-center gap-2'>
                                    <Loader2 className='w-5 h-5 animate-spin' />
                                    <span>Verifying..</span>
                                </div>
                            ) : (
                                <div className='flex items-center justify-center gap-2'>
                                    <span>Verify</span>
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

export default VerifyPage