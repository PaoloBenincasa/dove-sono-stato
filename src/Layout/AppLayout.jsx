import { Outlet } from "react-router";
import AppNavbar from "../components/AppNavbar";

export default function AppLayout() {
    return (
        <div className="vh-100">
            <AppNavbar/>
            <Outlet />

        </div>
    )
}