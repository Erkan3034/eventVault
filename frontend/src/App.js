import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
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
import PageLoader from './components/PageLoader';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
        return <PageLoader />;
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const StaffRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth();
    if (loading) {
        return <PageLoader />;
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    if (!user || !user.is_staff) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

const GuestUploadRedirect = () => {
    const { accessCode } = useParams();
    return <Navigate to={`/upload/${accessCode}`} replace />;
};

function AppLayout() {
    const { pathname } = useLocation();
    const bare = pathname === '/login' || pathname === '/register';

    return (
        <div className="flex min-h-screen flex-col bg-cream">
            {!bare && <Navbar />}
            <main className="flex-1">
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
                                element={<StaffRoute><AdminPanelPage /></StaffRoute>}
                            />
                        </Routes>
                    </main>
            {!bare && <Footer />}
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppLayout />
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar
                    newestOnTop
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
