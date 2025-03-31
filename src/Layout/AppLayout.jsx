import { Outlet } from "react-router";
import AppNavbar from "../components/AppNavbar";
import Search from "../components/Search";

export default function AppLayout() {
    return (
        <div className="h-100">
            <AppNavbar/>
            <Outlet />

        </div>
    )
}