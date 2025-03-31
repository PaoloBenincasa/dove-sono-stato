import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import SessionContext from '../context/SessionContext';
import supabase from "../supabase/client";
import Search from "./Search";

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

            <div className="col-md-4 col-0 home-container text-center ">
                <Link to="/" className="home-link">
                    home
                </Link>
            </div>

            <div className="search-container col-10 col-md-4">
                <Search onSave={(newPlace) => handleSave(newPlace)} />
            </div>

            {session ?
                (
                    <div className="dropdown col-md-4 col-2 text-end account-container  text-center">
                        <div className=" dropdown-toggle txtWhite" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            {session.user.user_metadata.username}
                        </div>
                        <ul className="dropdown-menu p-2">
                            <li>
                                <Link to="/profile" className="navlink">La tua mappa</Link>
                            </li>
                           
                            <li>
                                <a href="#" onClick={signOut} className="navlink">Logout</a>
                            </li>
                        </ul>
                    </div>


                ) : (
                    <div className="dropdown col-md-4 col-2 text-end account-container text-center">
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

            {session ?
                (
                    <div className="dropdown col-md-4 col-2  account-container-resp  text-center ">
                        <div className=" dropdown-toggle txtWhite" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            {/* {session.user.user_metadata.username} */}
                            <i className="bi bi-list fs-1"></i>
                        </div>
                        <ul className="dropdown-menu p-2">
                            <li>
                                <Link to="/" className="navlink">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile" className="navlink">La tua mappa</Link>
                            </li>
                            <li>
                                <a href="#" onClick={signOut} className="navlink">Logout</a>
                            </li>
                        </ul>
                    </div>


                ) : (
                    <div className="dropdown col-md-4 col-2  account-container-resp text-center ">
                        <div className="txtWhite dropdown-toggle " type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            {/* benvenuto! */}
                            <i className="bi bi-list fs-1"></i>
                        </div>
                        <ul className="dropdown-menu p-2">
                            <li>
                                <Link to="/" className="navlink">
                                    Home
                                </Link>
                            </li>
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