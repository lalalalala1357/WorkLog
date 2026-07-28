import {UserManager , WebStorageStateStore} from "oidc-client-ts";

export const userManager = new UserManager({
    authority:import.meta.env.VITE_OIDC_AUTHORITY,
    client_id:import.meta.env.VITE_OIDC_CLIENT_ID,
    redirect_uri:import.meta.env.VITE_OIDC_REDIRECT_URI,
    silent_redirect_uri:import.meta.env.VITE_OIDC_SILENT_REDIRECT_URI,
    post_logout_redirect_uri:
        import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI,
    response_type:"code",
    scope:import.meta.env.VITE_OIDC_SCOPE,
    automaticSilentRenew:
        import.meta.env.VITE_OIDC_AUTOMATIC_SILENT_RENEW === "true",
    accessTokenExpiringNotificationTimeInSeconds: 60,
    userStore: new WebStorageStateStore({
        store: window.localStorage,
    }),
});