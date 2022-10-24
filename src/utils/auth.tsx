import React, { useContext, ReactNode, useState, useEffect, useMemo } from 'react';

const API_URL = 'https://jsramverk-editor-veax20.azurewebsites.net';

export type User = {
    _id?: string;
    email?: string;
    token?: string;
};

export type UserCredentials = {
    email?: string;
    password?: string;
};

interface AuthContextType {
    // We defined the user type in `index.d.ts`, but it's
    // a simple object with email, name and password.
    user?: User;
    loading?: boolean;
    error?: any;
    login?: (data: UserCredentials) => void;
    register?: (data: UserCredentials) => void;
    logout?: () => void;
}

export const AuthContext = React.createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }): JSX.Element => {
    const [user, setUser] = useState<User>();
    // const [error, setError] = useState<any>();
    const [loading, setLoading] = useState<boolean>(false);
    // const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

    const login = async (data: UserCredentials) => {
        setLoading(true);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

        const response = await fetch(`${API_URL}/auth/login`, requestOptions);
        const result: User = await response.json();

        setUser(result);
        setLoading(false);
    };

    const register = async (data: UserCredentials) => {
        setLoading(true);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

        const response = await fetch(`${API_URL}/auth/register`, requestOptions);
        const result: User = await response.json();
        setLoading(false);
    };

    const logout = () => {
        setUser(undefined);
    };

    const memoedValue = useMemo(
        () => ({
            user,
            loading,
            login,
            register,
            logout
        }),
        [user, loading]
    );

    return <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
    return useContext(AuthContext);
};

export default useAuth;
