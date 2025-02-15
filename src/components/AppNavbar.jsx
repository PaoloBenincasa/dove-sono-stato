import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import SessionContext from '../context/SessionContext';
import supabase from "../supabase/client";

export default function AppNavbar() {
    const session = useContext(SessionContext);
    const [isScrolled, setIsScrolled] = useState(false);

    const handleScroll = () => {
        setIsScrolled(window.scrollY > 80);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);


    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            alert(error);
        }
    };

    console.log(session)

    return (
        <nav className={`${isScrolled ? 'scrolled' : ''}`}>
            <div>
                <Link to="/" className="home-link">
                    home
                </Link>
            </div>
            {session ?
                (
                    <div className="dropdown">
                        <div className=" dropdown-toggle txtWhite" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            {session.user.user_metadata.username}
                        </div>
                        <ul className="dropdown-menu p-2">
                            <li>
                                <Link to="/profile" className="navlink">I tuoi luoghi</Link>
                            </li>
                            <li>
                                <a href="#" onClick={signOut} className="navlink">Logout</a>
                            </li>
                        </ul>
                    </div>


                ) : (
                    <div className="dropdown">
                        <div className="txtWhite dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            benvenuto!
                        </div>
                        <ul className="dropdown-menu p-2">
                            <li>
                                <Link to="/signup" className="navlink">Registrati</Link>
                            </li>
                            <li>
                                <Link to="/signin" className="navlink">Accedi</Link>
                            </li>
                        </ul>
                    </div>

                )
            }
        </nav >
    );
}