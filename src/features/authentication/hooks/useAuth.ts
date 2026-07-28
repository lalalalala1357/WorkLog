import { useAuthStore } from "../store/authStore";
import { userManager } from "../lib/userManager";

export function useAuth()
{
    const user = useAuthStore((State) => State.user);
    return{
        isAuthenticated: !!user && !user?.expired,
        accessToken: user?.access_token,
        logout: () =>
            userManager.signoutRedirect(
                user?.id_token
                    ?{id_token_hint: user.id_token}
                    : undefined,
            ),
    };
}