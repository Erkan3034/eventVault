import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: true,
    error: null
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return {
                ...state,
                loading: true,
                error: null
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false,
                error: null
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
                error: action.payload
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
                error: null
            };
        case 'UPDATE_USER':
            return {
                ...state,
                user: action.payload
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Set up axios defaults
    useEffect(() => {
        if (state.token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
            localStorage.setItem('token', state.token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    }, [state.token]);

    // Check if user is authenticated on mount
    useEffect(() => {
        const checkAuth = async() => {
            if (state.token) {
                try {
                    const response = await axios.get('/api/v1/auth/profile/');
                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: { user: response.data, token: state.token }
                    });
                } catch (error) {
                    dispatch({ type: 'LOGOUT' });
                }
            } else {
                dispatch({ type: 'LOGOUT' });
            }
        };

        checkAuth();
        // eslint-disable-next-line
    }, []);

    const login = async(email, password) => {
        dispatch({ type: 'LOGIN_START' });

        try {
            const response = await axios.post('/api/v1/auth/login/', {
                email,
                password
            });

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    user: response.data.user,
                    token: response.data.access
                }
            });

            return { success: true };
        } catch (error) {
            const errorMessage =
                (error.response && (error.response.data && (error.response.data.message || error.response.data.detail))) ||
                'Giriş başarısız';
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: errorMessage
            });
            return { success: false, error: errorMessage };
        }
    };

    const register = async(userData) => {
        dispatch({ type: 'LOGIN_START' });

        try {
            const response = await axios.post('/api/v1/auth/register/', userData);

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    user: response.data.user,
                    token: response.data.access
                }
            });

            return { success: true };
        } catch (error) {
            const errorMessage =
                (error.response && (error.response.data && (error.response.data.message || error.response.data.detail))) ||
                'Kayıt başarısız';
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: errorMessage
            });
            return { success: false, error: errorMessage };
        }
    };

    const logout = async() => {
        try {
            if (state.token) {
                await axios.post('/api/v1/auth/logout/', {
                    refresh: state.token
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            dispatch({ type: 'LOGOUT' });
        }
    };

    const updateProfile = async(profileData) => {
        try {
            const response = await axios.patch('/api/v1/auth/profile/update/', profileData);
            dispatch({
                type: 'UPDATE_USER',
                payload: response.data
            });
            return { success: true };
        } catch (error) {
            const errorMessage =
                (error.response && (error.response.data && (error.response.data.message || error.response.data.detail))) ||
                'Profil güncellenemedi';
            return { success: false, error: errorMessage };
        }
    };

    const changePassword = async(passwordData) => {
        try {
            await axios.post('/api/v1/auth/password/change/', passwordData);
            return { success: true };
        } catch (error) {
            const errorMessage =
                (error.response && (error.response.data && (error.response.data.message || error.response.data.detail))) ||
                'Şifre değiştirilemedi';
            return { success: false, error: errorMessage };
        }
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const value = {
        ...state,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        clearError
    };

    return ( <
        AuthContext.Provider value = { value } > { children } <
        /AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};