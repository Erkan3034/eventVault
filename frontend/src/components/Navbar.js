import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Bars3Icon,
    XMarkIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Handles user logout
    const handleLogout = async() => {
        await logout(); // Call the logout function from AuthContext
        navigate('/'); // Redirect to home page after logout
        setIsProfileOpen(false); // Close profile dropdown
    };

    // Navigation items configuration
    const navigation = [
        { name: 'Ana Sayfa', href: '/', auth: false },
        { name: 'Hakkında', href: '/about', auth: false },
        { name: 'Dashboard', href: '/dashboard', auth: true },
        { name: 'Albüm Oluştur', href: '/create-album', auth: true },
    ];

    return ( <
        nav className = "bg-white shadow-lg" >
        <
        div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" >
        <
        div className = "flex justify-between h-16" > { /* Logo and Site Title */ } <
        div className = "flex items-center" >
        <
        Link to = "/"
        className = "flex-shrink-0 flex items-center" >
        <
        div className = "w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center" >
        <
        span className = "text-white font-bold text-lg" > E < /span> <
        /div> <
        span className = "ml-2 text-xl font-bold text-gray-900" > EventVault < /span> <
        /Link> <
        /div>

        { /* Desktop Navigation */ } <
        div className = "hidden md:flex items-center space-x-8" > { /* Render navigation links */ } {
            navigation.map((item) => {
                // Only show authenticated links if user is logged in
                if (item.auth && !isAuthenticated) return null;
                return ( <
                    Link key = { item.name }
                    to = { item.href }
                    className = "text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors" >
                    { item.name } <
                    /Link>
                );
            })
        }

        { /* Conditional rendering for authenticated vs. unauthenticated users */ } {
            isAuthenticated ? ( <
                div className = "relative" > { /* User profile button */ } <
                button onClick = {
                    () => setIsProfileOpen(!isProfileOpen) }
                className = "flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors" >
                <
                UserCircleIcon className = "h-6 w-6" / >
                <
                span className = "text-sm font-medium" > { user && user.first_name ? user.first_name : 'Kullanıcı' } <
                /span> <
                /button>

                { /* Profile dropdown menu */ } {
                    isProfileOpen && ( <
                        div className = "absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50" >
                        <
                        Link to = "/dashboard"
                        className = "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick = {
                            () => setIsProfileOpen(false) } >
                        Dashboard <
                        /Link> <
                        Link to = "/profile"
                        className = "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick = {
                            () => setIsProfileOpen(false) } >
                        Profil <
                        /Link> <
                        button onClick = { handleLogout }
                        className = "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" >
                        Çıkış Yap <
                        /button> <
                        /div>
                    )
                } <
                /div>
            ) : ( <
                div className = "flex items-center space-x-4" > { /* Login and Register buttons for unauthenticated users */ } <
                Link to = "/login"
                className = "text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors" >
                Giriş Yap <
                /Link> <
                Link to = "/register"
                className = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors" >
                Kayıt Ol <
                /Link> <
                /div>
            )
        } <
        /div>

        { /* Mobile menu button */ } <
        div className = "md:hidden flex items-center" >
        <
        button onClick = {
            () => setIsOpen(!isOpen) }
        className = "text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600" >
        {
            isOpen ? ( <
                XMarkIcon className = "h-6 w-6" / >
            ) : ( <
                Bars3Icon className = "h-6 w-6" / >
            )
        } <
        /button> <
        /div> <
        /div> <
        /div>

        { /* Mobile Navigation (conditionally rendered) */ } {
            isOpen && ( <
                div className = "md:hidden" >
                <
                div className = "px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t" > { /* Render mobile navigation links */ } {
                    navigation.map((item) => {
                        if (item.auth && !isAuthenticated) return null;
                        return ( <
                            Link key = { item.name }
                            to = { item.href }
                            className = "text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                            onClick = {
                                () => setIsOpen(false) } >
                            { item.name } <
                            /Link>
                        );
                    })
                }

                { /* Conditional rendering for authenticated vs. unauthenticated users in mobile menu */ } {
                    isAuthenticated ? ( <
                        div className = "border-t pt-4 mt-4" >
                        <
                        div className = "px-3 py-2 text-sm text-gray-500" >
                        Hoş geldin, { user && user.first_name ? user.first_name : 'Kullanıcı' } <
                        /div> <
                        Link to = "/dashboard"
                        className = "text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                        onClick = {
                            () => setIsOpen(false) } >
                        Dashboard <
                        /Link> <
                        Link to = "/profile"
                        className = "text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                        onClick = {
                            () => setIsOpen(false) } >
                        Profil <
                        /Link> <
                        button onClick = { handleLogout }
                        className = "text-gray-700 hover:text-blue-600 block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors" >
                        Çıkış Yap <
                        /button> <
                        /div>
                    ) : ( <
                        div className = "border-t pt-4 mt-4 space-y-2" >
                        <
                        Link to = "/login"
                        className = "text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                        onClick = {
                            () => setIsOpen(false) } >
                        Giriş Yap <
                        /Link> <
                        Link to = "/register"
                        className = "bg-blue-600 hover:bg-blue-700 text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                        onClick = {
                            () => setIsOpen(false) } >
                        Kayıt Ol <
                        /Link> <
                        /div>
                    )
                } <
                /div> <
                /div>
            )
        } <
        /nav>
    );
};

export default Navbar;