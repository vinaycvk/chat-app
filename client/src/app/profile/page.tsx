"use client"
import { useAppData } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import Reac, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import axios from 'axios'
import { user_service } from '@/context/AppContext'
import toast from 'react-hot-toast'
import Loading from '@/components/Loading'
import { ArrowLeft, Save, User, UserCircle, X } from 'lucide-react'


const ProfilePage = () => {
    const { user, isAuth, loading, setUser } = useAppData()
    const [isEdit, setisEdit] = useState(false)
    const [name, setname] = useState<string | undefined>("")

    const router = useRouter()

    const editHandler = () => {
        setisEdit(true)
        setname(user?.username)
    }

    const submitHandler = async (e: any) => {
        e.preventDefault()
        const token = Cookies.get("token")
        if (!token) {
            router.push("/login")
            return
        }

        try {
            const { data } = await axios.put(`${user_service}/api/v1/users/update`, {username: name }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            Cookies.set("token", data.token, {
                expires: 15,
                secure: false,
                path: "/"
            })

            toast.success(data.message)

            setUser(data.username)
            setisEdit(false)
        } catch (error: any) {
            toast.error(error.response.data.message)
        }

    }

    useEffect(() => {
        if (!isAuth && !loading) {
            router.push("/login")
        }
    }, [isAuth, loading, router])

    if (loading) return <Loading />

    return (
        <div className='min-h-screen bg-gray-900 p-4'>
            <div className='max-w-2xl mx-auto pt-8'>
                <div className="flex items-center gap-4 mb-8">
                    <button className='p-3 bg-gray-800 hover:bg-gray-700
                rounded-lg border border-gray-700' onClick={() => router.push("/chat")}>
                        <ArrowLeft className='w-5 h-5 text-gray-300' />
                    </button>
                    <div className="">
                        <h1 className='text-3xl font-bold text-white'>Profile Settings</h1>
                        <p className='text-gray-400 mt-1'>
                            Manage your account information and settings
                        </p>
                    </div>
                </div>
                <div className="bg-gray-800 border-gray-700 shadow-lg">
                    <div className='bg-gray-700 p-8 border-b border-gray-600'>
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className='w-20 h-20 rounded-full bg-gray-600 flex
                        items-center justify-center'>
                                    <UserCircle className='w-12 h-12 text-gray-300' />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 
                        bg-green-500 rounded-full border-2 border-gray-800">

                                </div>

                            </div>
                            <div className="flex-1">
                                <h2 className='text-xl font-bold text-white mb-1'>{user?.username}</h2>
                                <p className='text-gray-400 text-sm'>Active now</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="space-y-6">
                            <div className="div">
                                <label htmlFor='name' className='block text-sm font-semibold text-gray-300 mb-2'>
                                    Display Name
                                </label>
                                {
                                    isEdit ? (
                                        <form onSubmit={submitHandler} className='space-y-4'>
                                            <div className="relative">
                                                <input
                                                    type='text'
                                                    id='name'
                                                    className='w-full px-4 py-3 rounded-lg text-white bg-gray-700 border border-gray-600 placeholder-gray-400'
                                                    placeholder='Enter your display name'
                                                    required
                                                    value={name}
                                                    onChange={(e) => setname(e.target.value)}
                                                />
                                                <User className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400'/>
                                            </div>
                                            <div className="flex gap-3">
                                                <button type='submit' className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300'>
                                                    <Save  className='w-4 h-4 mr-2'/>
                                                    Save Changes
                                                </button>
                                                <button type='button' className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition duration-300 cursor-pointer" onClick={() => setisEdit(false)}>
                                                    <X className='w-4 h-4 mr-2'/>
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className='flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600'>
                                            <span className='text-gray-200'>{user?.username || "Not Set"}</span>
                                            <button className='text-blue-500' onClick={editHandler}>
                                                Edit
                                            </button>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage