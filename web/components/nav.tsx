import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../utils/auth';

const navigation = [
    { name: 'Home', href: '#', current: true },
    { name: 'Discover', href: '#', current: false },
    { name: 'Friends', href: '#', current: false },
    { name: 'Messages', href: '#', current: false },
]


export default function Nav() {
    const { user, logout } = useAuth();
    const userMenuRef = useRef<HTMLDivElement>(null);
    const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const documentClickHandler = (e: any) => {
        if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
            setIsUserMenuOpen(false);
        }
    }

    useEffect(() => {
        document.addEventListener("click", documentClickHandler);
        return () => {
            document.removeEventListener('click', documentClickHandler, false);
        }
    }, []);

    const initLogout = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        if (logout) logout();
        setIsUserMenuOpen(false);
    };

    return (
        <nav className='bg-gray-800'>
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    <div className="sm:hidden">
                        <button className="rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" onClick={() => setIsMainMenuOpen(!isMainMenuOpen)}>
                            <span className="sr-only">Open main menu</span>
                            {isMainMenuOpen ? (
                                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>

                    <div className="flex flex-row items-center">
                        <div className='mr-3'>
                            <img className="block h-8 w-auto" src="/logo.svg" alt="twitter" />
                        </div>
                        <div className="hidden sm:flex p-1">
                            {navigation.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className={
                                        (item.current ?
                                            'bg-gray-900 text-white'
                                            :
                                            'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        ) + ' px-3 py-2 rounded-md text-sm font-medium'
                                    }
                                    aria-current={item.current ? 'page' : undefined}
                                >
                                    {item.name}
                                </a>
                            ))}
                        </div>
                    </div>

                    {
                        user &&
                        <div className="flex flex-row items-center">
                            <button
                                type="button"
                                className="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                <span className="sr-only">View notifications</span>
                                <BellIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                            <div ref={userMenuRef} className='relative ml-3'>
                                <button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                                    <span className="sr-only">Open user menu</span>
                                    <img
                                        className="h-8 w-8 rounded-full"
                                        src={`https://ui-avatars.com/api/?background=random&name=${user.username}`}
                                        alt="avatar"
                                    />
                                </button>
                                {isUserMenuOpen &&
                                    <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Your Profile</a>
                                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Settings</a>
                                        <a href="#" onClick={initLogout} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Sign out</a>
                                    </div>
                                }
                            </div>
                        </div>
                    }

                    {
                        !user &&
                        <div className='flex flex-row items-center'>
                            <Link href="/login" className='text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-semibold'>Login</Link>
                            <Link href="/register" className='ml-3 bg-purple-600 text-gray-300 hover:bg-purple-700 hover:text-white px-3 py-2 rounded-md text-sm font-semibold'>Sign Up</Link>
                        </div>
                    }
                </div>
            </div>

            {
                isMainMenuOpen &&
                <div className="sm:hidden" x-show="open">
                    <div className="space-y-1 px-2 pt-2 pb-3">
                        {navigation.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className={
                                    (item.current ?
                                        'bg-gray-900 text-white'
                                        :
                                        'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    ) + ' block px-3 py-2 rounded-md text-sm font-medium'
                                }
                                aria-current={item.current ? 'page' : undefined}
                            >
                                {item.name}
                            </a>
                        ))}
                    </div>
                </div>
            }

        </nav>
    )
}
