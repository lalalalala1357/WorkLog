import axios from "axios";
import { userManager } from "../features/authentication/lib/userManager";

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

apiClient.interceptors.request.use(async (config) => {
    const user = await userManager.getUser();

    if (user?.access_token)
    {
        config.headers.Authorization = `Bearer ${user.access_token}`;
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if(error.response?.status === 401)
        {
            await userManager.signinRedirect();
        }
        return Promise.reject(error);
    },
);