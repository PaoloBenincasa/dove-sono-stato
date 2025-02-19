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




// Aggiungi l'elemento AppLayout come wrapper per le rotte protette
const router = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />, // AppLayout viene applicato su tutte le route principali
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
                element: <ProtectedRoutes />, // Wrapper per le route protette
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

