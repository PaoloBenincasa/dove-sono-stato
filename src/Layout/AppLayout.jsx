import { Outlet } from "react-router";
import AppNavbar from "../components/AppNavbar";
import { ToastContainer } from "react-toastify";

export default function AppLayout() {
    return (
        <div className="h-100">
            <AppNavbar/>
            <Outlet />
            <ToastContainer position="bottom-right" />

        </div>
    )
}