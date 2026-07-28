import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userManager } from "../features/authentication/lib/userManager";
import { apiClient } from "../lib/apiClient";

export default function CallbackPage()
{
    const navigate = useNavigate();

    useEffect(() => {
        userManager
            .signinRedirectCallback()
            .then(() => apiClient.get("/auth/me"))
            .then(() => navigate("/dashboard",{replace: true}));
    },[navigate]);
    return <p>登入中...</p>
}