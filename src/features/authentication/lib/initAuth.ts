import { userManager } from "./userManager";
import { useAuthStore } from "../store/authStore";

export async function initAuth()
{
    const user = await userManager.getUser();
    useAuthStore.getState().setUser(user);

    userManager.events.addUserLoaded((user) => {
        useAuthStore.getState().setUser(user);
    })

    userManager.events.addUserUnloaded(() => {
        useAuthStore.getState().setUser(null);
    })

    userManager.events.addSilentRenewError(() => {
        userManager.signinRedirect();
    });
}