/*
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
*/
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../features/authentication/hooks/useAuth";
import { userManager } from "../features/authentication/lib/userManager";

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const bypassAuth = import.meta.env.VITE_AUTH_BYPASS === "true";

  useEffect(() => {
    if (!bypassAuth && !isAuthenticated) {
      userManager.signinRedirect();
    }
  }, [bypassAuth, isAuthenticated]);

  return bypassAuth || isAuthenticated ? <Outlet /> : null;
}