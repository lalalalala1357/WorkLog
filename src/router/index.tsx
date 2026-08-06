import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import CallbackPage from "../pages/CallbackPage";
import SilentCallbackPage from "../pages/SilentCallbackPage";
import DashboardPage from "../pages/DashboardPage";
import EditLogPage from "../pages/EditLogPage";
import CalendarPage from "../pages/CalendarPage";

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
                path:"/logs/:id/edit",
                element:<EditLogPage />,
            },

            {
                path: "/calendar",
                element: <CalendarPage />
            },

            {
                path:"*",
                element: <DashboardPage />,
            },
        ],
    },
]);