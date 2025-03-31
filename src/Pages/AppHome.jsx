import { useContext, useRef } from "react";
import { useNavigate } from "react-router";
import SessionContext from "../context/SessionContext";
import 'animate.css';


export default function AppHome() {
    const session = useContext(SessionContext);
    const infoRef = useRef(null);
    const navigate = useNavigate();


    const handleClick = () => {
        if (session) {
            navigate("/profile");
            window.scrollTo(0, 0);
        } else {
            navigate("/signin");
        }
    };

    const handleInfo = () => {
        if (infoRef.current) {
            window.scrollTo({
                top: infoRef.current.offsetTop,
                behavior: 'smooth'
            });
        }
    };

    return (
        <>
            <div className="hero d-flex justify-content-center">
                <div className="text-center hero-content">
                    <h1>my places</h1>
                    <h6>
                        una mappa di tutti i posti che hai visitato. <br />
                        montagne, laghi, città, monumenti, locali. <br />
                        visualizza i tuoi ricordi!
                    </h6>
                    <button
                        className="btn btn-cta"
                        onClick={handleInfo}
                    >
                        come funziona?
                    </button>
                </div>
            </div>
            <div className="bgDarkgreen container-fluid pb-5 min-h-100">
                <h2 className="txtWhite text-center pt-5 pb-3" ref={infoRef}>come funziona</h2>
                <div className="row d-flex justify-content-evenly align-items-center h-75">
                    <div className="col-md-3 col-10 collections-info d-flex flex-column justify-content-between mt-4">
                        <h5 className="txtWhite collections-title text-end">
                            <span className="ms-1">
                                crea le tue raccolte
                            </span>
                        </h5>
                        <div className="collections-text txtWhite text-end mb-4">
                            crea delle raccolte in cui archiviare i tuoi posti del cuore: le città che hai visitato, <br /> le montagne che hai scalato...
                        </div>
                        <div className="txtWhite fs-1 fw-bold collections-number">
                            1
                        </div>
                    </div>
                    <div className="col-md-3 col-10 places-info d-flex flex-column justify-content-between mt-4">
                        <h5 className="txtWhite places-title text-end">

                            <span className="ms-1">
                                aggiungi i tuoi luoghi del cuore
                            </span>
                        </h5>
                        <div className="places-text txtWhite text-end mb-4">
                            cerca col nostro motore di ricerca <br /> i posti che hai visitato e aggiungili ad una delle tue raccolte
                        </div>
                        <div className="txtWhite fs-1 fw-bold places-number">
                            2
                        </div>
                    </div>
                    <div className="col-md-3 col-10 map-info d-flex flex-column justify-content-between mt-4">
                        <h5 className="txtWhite map-title text-end">
                            <span className="ms-1">
                                visualizza la tua mappa
                            </span>
                        </h5>
                        <div className="map-text txtWhite text-end mb-4">
                            scegli le diverse raccolte che vuoi vedere sulla tua mappa
                            per avere un'idea <br /> dei luoghi che hai amato
                        </div>
                        <div className="txtWhite fs-1 fw-bold map-number">
                            3
                        </div>


                    </div>
                </div>
                <div className="d-flex justify-content-center">

                    <button
                        className="btn btn-cta mt-5"
                        onClick={handleClick}
                    >
                        inizia!
                    </button>
                </div>
            </div>
        </>
    )
}