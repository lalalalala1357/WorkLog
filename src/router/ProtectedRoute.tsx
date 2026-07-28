import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../features/authentication/hooks/useAuth";
import { userManager } from '../features/authentication/lib/userManager';

export function ProtectedRoute()
{
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if(!isAuthenticated)
        {
            userManager.signinRedirect();
        }
    },[isAuthenticated])
    return isAuthenticated ? <Outlet /> :null
}