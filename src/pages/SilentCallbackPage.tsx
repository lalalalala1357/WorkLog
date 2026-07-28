import { useEffect } from "react";
import { userManager } from "../features/authentication/lib/userManager";

export default function SilentCallbackPage()
{
    useEffect(() => {
        userManager.signinSilentCallback();
    },[]);
    return null;
}