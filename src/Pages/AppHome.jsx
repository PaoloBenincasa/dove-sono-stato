import { useContext } from "react";
import { useNavigate} from "react-router";
import SessionContext from "../context/SessionContext";

export default function AppHome() {
    const session = useContext(SessionContext);
    const navigate = useNavigate();
    

    const handleClick = () => {
        if (session) {
            navigate("/profile"); 
        } else {
            navigate("/signin"); 
        }
    };

    return (
        <>
            <div className="hero d-flex justify-content-center">
                <div className="text-center hero-content">
                    <h1>my places</h1>
                    <h6>
                        una mappa di tutti posti che hai visitato. <br />
                        montagne, laghi, città, monumenti, locali. <br />
                        visualizza i tuoi ricordi!
                    </h6>
                    <button
                        className="btn btn-cta"
                        onClick={handleClick}
                    >
                        inizia!
                    </button>
                </div>
            </div>
        </>
    )
}