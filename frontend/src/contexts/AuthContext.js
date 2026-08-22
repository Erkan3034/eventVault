import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const readStoredAuth = () => ({
    token: localStorage.getItem('token'),
    refresh: localStorage.getItem('refresh'),
});

const initialState = {
    user: null,
    token: readStoredAuth().token,
    refresh: readStoredAuth().refresh,
    isAuthenticated: false,
    loading: true,
    error: null,
};

const extractError = (error, fallback) => {
    const data = error.response && error.response.data;
    if (!data) return fallback;
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    if (Array.isArray(data.non_field_errors) && data.non_field_errors[0]) {
        return data.non_field_errors[0];
    }
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
        const value = data[firstKey];
        return Array.isArray(value) ? value[0] : String(value);
    }
    return fallback;
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return { ...state, loading: true, error: null };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                refresh: action.payload.refresh || state.refresh,
                isAuthenticated: true,
                loading: false,
                error: null,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                user: null,
                token: null,
                refresh: null,
                isAuthenticated: false,
                loading: false,
                error: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                refresh: null,
                isAuthenticated: false,
                loading: false,
                error: null,
            };
        case 'UPDATE_USER':
            return { ...state, user: action.payload };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        if (state.token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
            localStorage.setItem('token', state.token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }

        if (state.refresh) {
            localStorage.setItem('refresh', state.refresh);
        } else {
            localStorage.removeItem('refresh');
        }
    }, [state.token, state.refresh]);

    useEffect(() => {
        const checkAuth = async () => {
            if (state.token) {
                try {
                    const response = await axios.get('/api/v1/auth/profile/');
                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: {
                            user: response.data,
                            token: state.token,
                            refresh: state.refresh,
                        },
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

    const login = async (email, password) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            const response = await axios.post('/api/v1/auth/login/', { email, password });
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    user: response.data.user,
                    token: response.data.access,
                    refresh: response.data.refresh,
                },
            });
            return { success: true };
        } catch (error) {
            const errorMessage = extractError(error, 'Giriş başarısız');
            dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
            return { success: false, error: errorMessage };
        }
    };

    const register = async (userData) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            const response = await axios.post('/api/v1/auth/register/', userData);
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    user: response.data.user,
                    token: response.data.access,
                    refresh: response.data.refresh,
                },
            });
            return { success: true };
        } catch (error) {
            const errorMessage = extractError(error, 'Kayıt başarısız');
            dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
            return { success: false, error: errorMessage };
        }
    };

    const logout = async () => {
        try {
            if (state.token) {
                await axios.post('/api/v1/auth/logout/', { refresh: state.refresh });
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Logout error:', error);
        } finally {
            dispatch({ type: 'LOGOUT' });
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await axios.patch('/api/v1/auth/profile/update/', profileData);
            dispatch({ type: 'UPDATE_USER', payload: response.data });
            return { success: true };
        } catch (error) {
            return { success: false, error: extractError(error, 'Profil güncellenemedi') };
        }
    };

    const changePassword = async (passwordData) => {
        try {
            await axios.post('/api/v1/auth/change-password/', passwordData);
            return { success: true };
        } catch (error) {
            return { success: false, error: extractError(error, 'Şifre değiştirilemedi') };
        }
    };

    const value = {
        ...state,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
