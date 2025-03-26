import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { useContext } from 'react';
import SessionContext from '../context/SessionContext';
import AppSignIn from '../Pages/AppSignIn';
import AppSignUp from '../Pages/AppSignUp';
import AppHome from '../Pages/AppHome';
import AppLayout from '../Layout/AppLayout';
import AppProfile from '../Pages/AppProfile';

function ProtectedRoutes() {
    const session = useContext(SessionContext);

    if (!session) {
        return <Navigate to="/" />;
    }

    return <Outlet />;
}




const router = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />, 
        children: [
            {
                path: "/",
                element: <AppHome />,
            },
            {
                path: "/signup",
                element: <AppSignUp />,
            },
            {
                path: "/signin",
                element: <AppSignIn />,
            },
            {
                element: <ProtectedRoutes />, 
                children: [
                    {
                        path: "/profile",
                        element: <AppProfile />,
                    },
                ],
            },
        ],
    },
]);


export default router;

