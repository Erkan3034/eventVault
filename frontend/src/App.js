import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreateAlbumPage from './pages/CreateAlbumPage';
import AlbumPage from './pages/AlbumPage';
import UploadPage from './pages/UploadPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import AdminPanelPage from './pages/AdminPanelPage';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
    return ( <
        AuthProvider >
        <
        Router >
        <
        div className = "min-h-screen bg-gray-50" >
        <
        Navbar / >
        <
        main >
        <
        Routes >
        <
        Route path = "/"
        element = { < HomePage / > }
        /> <
        Route path = "/login"
        element = { < LoginPage / > }
        /> <
        Route path = "/register"
        element = { < RegisterPage / > }
        /> <
        Route path = "/dashboard"
        element = { < DashboardPage / > }
        /> <
        Route path = "/create-album"
        element = { < CreateAlbumPage / > }
        /> <
        Route path = "/album/:id"
        element = { < AlbumPage / > }
        /> <
        Route path = "/upload/:accessCode"
        element = { < UploadPage / > }
        /> <
        Route path = "/profile"
        element = { < ProfilePage / > }
        /> <
        Route path = "/about"
        element = { < AboutPage / > }
        /> <
        Route path = "/admin"
        element = { < AdminPanelPage / > }
        /> <
        /Routes> <
        /main> <
        Footer / >
        <
        /div> <
        ToastContainer position = "top-right"
        autoClose = { 5000 }
        hideProgressBar = { false }
        newestOnTop = { false }
        closeOnClick rtl = { false }
        pauseOnFocusLoss draggable pauseOnHover /
        >
        <
        /Router> <
        /AuthProvider>
    );
}

export default App;