import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreateAlbumPage from './pages/CreateAlbumPage';
import AlbumPage from './pages/AlbumPage';
import EditAlbumPage from './pages/EditAlbumPage';
import UploadPage from './pages/UploadPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import AdminPanelPage from './pages/AdminPanelPage';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Yükleniyor...
            </div>
        );
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const GuestUploadRedirect = () => {
    const { accessCode } = useParams();
    return <Navigate to={`/upload/${accessCode}`} replace />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <main>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/upload/:accessCode" element={<UploadPage />} />
                            <Route path="/y/:accessCode" element={<GuestUploadRedirect />} />
                            <Route
                                path="/dashboard"
                                element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
                            />
                            <Route
                                path="/create-album"
                                element={<ProtectedRoute><CreateAlbumPage /></ProtectedRoute>}
                            />
                            <Route
                                path="/album/:id"
                                element={<ProtectedRoute><AlbumPage /></ProtectedRoute>}
                            />
                            <Route
                                path="/album/:id/edit"
                                element={<ProtectedRoute><EditAlbumPage /></ProtectedRoute>}
                            />
                            <Route
                                path="/profile"
                                element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
                            />
                            <Route
                                path="/admin"
                                element={<ProtectedRoute><AdminPanelPage /></ProtectedRoute>}
                            />
                        </Routes>
                    </main>
                    <Footer />
                </div>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </Router>
        </AuthProvider>
    );
}

export default App;
