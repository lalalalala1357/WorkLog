import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import CallbackPage from "../pages/CallbackPage";
import SilentCallbackPage from "../pages/SilentCallbackPage";
import DashboardPage from "../pages/DashboardPage";

export const router = createBrowserRouter([
    {
        path: "/callback",
        element: <CallbackPage />,
    },

    {
        path: "/silent-callback",
        element:<SilentCallbackPage />,
    },

    {
        element: <ProtectedRoute />,
        children: [
            {
                path:"/dashboard",
                element: <DashboardPage />,
            },

            {
                path:"*",
                element: <DashboardPage />,
            },
        ],
    },
]);