import React, { useContext, useEffect, useState } from "react";
import { getApiBase } from "../utils/utils";

export interface User {
    id: number;
    email: string;
    name: string;
    username: string;
    avatar_url: string | null;
    about: string;
    location: string;
    date_joined: string;
}

type AuthContextProps = {
    loading: boolean,
    user: User | null;
    login: (username: string, password: string) => Promise<Response>;
    logout: () => void;
    getToken: () => Promise<string>;
}

const AuthContext = React.createContext<Partial<AuthContextProps>>({});

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState("");
    const [accessTokenExpiry, setAccessTokenExpiry] = useState<number | null>(null);
    const API_BASE = getApiBase();

    const initAuth = async () => {
        if (!accessTokenIsValid()) {
            await refreshToken();
        }
    }

    useEffect(() => {
        initAuth();
    }, [])

    const accessTokenIsValid = (): boolean => {
        if (accessToken === "" || accessTokenExpiry === null) {
            return false;
        }
        const expiry = new Date(accessTokenExpiry);
        return expiry.getTime() > Date.now();
    }

    const initUser = async (token: string): Promise<void> => {
        const resp = await fetch(`${API_BASE}/users/me/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const user = await resp.json();
        setUser(user);
    }

    const login = async (username: string, password: string): Promise<Response> => {
        const resp = await fetch(`${API_BASE}/token/`, {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: { "Content-Type": 'application/json' },
            credentials: "include",
        });
        if (resp.ok) {
            const tokenData = await resp.json();
            setAccessToken(tokenData.access);
            setAccessTokenExpiry(tokenData.access_expires);
            await initUser(tokenData.access);
        }
        return resp;
    };

    const logout = (): void => {
        setAccessToken("");
        setAccessTokenExpiry(null);
        setUser(null);
        fetch(`${API_BASE}/token/logout/`, {
            method: "POST",
            credentials: "include"
        });
    }

    const getToken = async (): Promise<string> => {
        // Returns an access token if there's one or refetches a new one
        let result;
        if (accessTokenIsValid()) {
            result = Promise.resolve(accessToken);
        } else if (loading) {
            while (loading) {
                console.log("Getting access token.. waiting for token to be refreshed");
            }
            // Assume this means the token is in the middle of refreshing
            result = Promise.resolve(accessToken);
        } else {
            const token = await refreshToken();
            result = token;
        }
        return result;
    }

    const refreshToken = async (): Promise<string> => {
        const resp = await fetch(`${API_BASE}/token/refresh/`, {
            method: 'POST',
            credentials: "include"
        })
        if (resp.ok) {
            const tokenData = await resp.json();
            setAccessToken(tokenData.access);
            setAccessTokenExpiry(tokenData.access_expiry);
            if (user == null) await initUser(tokenData.access);
        } else {
            setAccessToken("");
            setAccessTokenExpiry(null);
            setUser(null);
        }
        setLoading(false);
        return accessToken;
    }

    const value = {
        loading,
        user,
        login,
        logout,
        getToken,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
